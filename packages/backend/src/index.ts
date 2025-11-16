import { ClientData, Message } from "./type";

import Playground from "./Playground";
import { GAME_GENRE, LIMIT, PORT } from "./constant";

const getDataFromQuery = (req: Request, key: string) => {
  return new URL(req.url).searchParams.get(key);
};

const PlaygroundNG = new Playground();

const server = Bun.serve<ClientData>({
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/")
      return Response.json({
        hai: "Hello",
      });
    if (
      url.pathname === "/number-guesser" ||
      url.pathname === "/rock-paper-scissor"
    ) {
      const genre = GAME_GENRE[url.pathname];
      const username = getDataFromQuery(req, "userName");
      const room = getDataFromQuery(req, "roomName");

      if (
        room === null ||
        username === null ||
        room === "" ||
        username === ""
      ) {
        return new Response("Room Name or User Name Cannot Be Empty");
      }

      if (PlaygroundNG.isRoomExist(room)) {
        const existingRoom = PlaygroundNG.getRoom(room);
        if (existingRoom.getMemberCount() === LIMIT) {
          return new Response(`Sudah LIMIT 2 ORANG DI ROOM ${room}`, {
            status: 400,
          });
        }

        const isUsernameExist = existingRoom.isUserInRoom(username);

        if (isUsernameExist) {
          return new Response(
            `Username: ${username} already exist in the room`,
            { status: 400 }
          );
        }
      }
      const success = server.upgrade(req, { data: { username, room, genre } });
      return success
        ? undefined
        : new Response("WebSocket upgrade error", { status: 400 });
    }

    if (url.pathname === "/list") {
      return Response.json(PlaygroundNG.getRooms());
    }

    return new Response("Hello world");
  },
  port: PORT,
  websocket: {
    open(ws) {
      const { room, username, genre } = ws.data;
      console.log("OPEN", { room, username });

      if (!PlaygroundNG.isRoomExist(room)) {
        PlaygroundNG.initializeRoom(room, ws, genre);
      } else {
        const existingRoom = PlaygroundNG.getRoom(room);
        existingRoom.addMember(ws);
      }
    },
    message(ws, message) {
      const { room, username } = ws.data;
      console.log("MESSAGE", { room, username, message });

      const parsedMessage: Message = JSON.parse(message.toString());
      const existingRoom = PlaygroundNG.getRoom(room);

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
    close(ws) {
      const { room, username } = ws.data;
      console.log("CLOSE", { room, username });

      const existingRoom = PlaygroundNG.getRoom(room);
      existingRoom.handleLeave(ws);

      if (existingRoom.getMemberCount() === 0) {
        PlaygroundNG.deleteRoom(room);
      }
    },
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);
