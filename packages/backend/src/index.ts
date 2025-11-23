import { ClientData } from "./type";

import websocketHandler from "./websocketHandler";
import fetchHandler from "./fetchHandler";
import Playground from "./Playground";
import { GAME_GENRE, LIMIT, PORT } from "./constant";

const PlaygroundNG = new Playground();

const server = Bun.serve<ClientData>({
  fetch: fetchHandler(PlaygroundNG),
  port: PORT,
  websocket: websocketHandler(PlaygroundNG),
});

console.log(`Listening on ${server.hostname}:${server.port}`);