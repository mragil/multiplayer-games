import { ServerWebSocket } from "bun";
import Room from "./Room";

interface ClientData {
  username: string;
  room: string;
  genre: Genre;
}

type Pick = "Rock" | "Paper" | "Scissor";

interface GameRPS {
  [key: string]: Pick;
}

interface NGList {
  [key: string]: number[];
}

interface GameNG {
  player: NGList;
  targetNumber: number;
}

interface Score {
  [key: string]: number;
}

interface Result {
  score: Score;
  game?: GameRPS | GameNG;
}

interface Rooms {
  [key: string | number]: Room;
}

type Message = {
  type:
    | "INFO"
    | "MODAL-INFO"
    | "CHAT"
    | "GAME"
    | "PLAYER_TURN"
    | "END_PLAYER_TURN"
    | "OPPONENT"
    | "TIMER"
    | "RESET"
    | "REPLAY"
    | "OPPONENT-LEFT";
  text: string | Buffer;
}

type ResultMessage = {
  type: "RESULT";
  text: string | Buffer;
  data: Result;
}

type Genre = "ROCK_PAPER_SCISSOR" | "NUMBER_GUESSER";

export {
  ClientData, GameNG, GameRPS, Genre,
  Message,
  Pick,
  ResultMessage,
  Rooms,
  Score,
  ServerWebSocket
};

