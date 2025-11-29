import { ClientData, Message } from "./type";
import { GAME_GENRE, LIMIT, PORT } from "./constant";
import Playground from "./Playground";

const _getDataFromQuery = (req: Request, key: string) => {
  return new URL(req.url).searchParams.get(key);
};

const fetchHandler = (playground: Playground) => (req: Request, server: Bun.Server<ClientData>) => {
  const url = new URL(req.url);
  if (url.pathname === "/")
    return Response.json({
      hai: "Hello",
    });
  if (
    url.pathname === "/number-guesser" ||
    url.pathname === "/rock-paper-scissor"
  ) {
    console.log('url: ',url.pathname);
    const genre = GAME_GENRE[url.pathname];
    console.log('genre', genre);
    const username = _getDataFromQuery(req, "userName");
    const room = _getDataFromQuery(req, "roomName");

    if (
      room === null ||
      username === null ||
      room === "" ||
      username === ""
    ) {
      return new Response("Room Name or User Name Cannot Be Empty");
    }

    const isRoomExist = playground.isRoomExist(room);
    if (isRoomExist) {
      const existingRoom = playground.getRoom(room);
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
    const success = server.upgrade(req, { data: { username, room, genre, isRoomExist } });
    return success
      ? undefined
      : new Response("WebSocket upgrade error", { status: 400 });
  }

  if (url.pathname === "/list") {
    return Response.json(playground.getRooms());
  }

  return new Response("Hello world");
}

export default fetchHandler;