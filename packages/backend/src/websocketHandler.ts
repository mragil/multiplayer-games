import { ClientData, Message } from "./type";

import Playground from "./Playground";

const websocketHandler = (playground: Playground) =>  ({
  open: (ws: Bun.ServerWebSocket<ClientData>) => {
      const { room, username, genre, isRoomExist } = ws.data;
      console.log("OPEN", { room, username, genre });

      if (!isRoomExist) {
        playground.initializeRoom(room, ws, genre);
      } else {
        const existingRoom = playground.getRoom(room);
        existingRoom.addMember(ws);
      }
  },
  message: (ws: Bun.ServerWebSocket<ClientData>, message: string)  => {
    const { room, username } = ws.data;
    console.log("MESSAGE", { room, username, message });

    const parsedMessage: Message = JSON.parse(message.toString());
    const existingRoom = playground.getRoom(room);

    switch (parsedMessage.type) {
      case "PLAYER_TURN": {
        existingRoom.handleGamePlay(ws, parsedMessage);
        break;
      }
      case "RESET": {
        existingRoom.handleLeave(ws);
        break;
      }
      case "REPLAY": {
        existingRoom.handleReplay(ws);
        break;
      }
      default: {
        console.log("NOTHING MASE");
      }
    }
  },
  close: (ws: Bun.ServerWebSocket<ClientData>, code: number) => {
    const { room, username } = ws.data;
    console.log("CLOSE", { room, username });

    const existingRoom = playground.getRoom(room);
    existingRoom.handleLeave(ws, code === 1000);

    if (existingRoom.getMemberCount() === 0) {
      playground.deleteRoom(room);
    }
    console.log('rooms after delete', playground.getRooms());
  },
});

export default websocketHandler;