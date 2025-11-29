import { RedisClient } from "bun";

import { LIMIT } from "./constant";
import NumberGuesser from "./games/NumberGuesser";
import RockPaperScissor from "./games/RockPaperScissor";
import {
  ClientData,
  Genre,
  Message,
  ResultMessage,
  ServerWebSocket,
} from "./type";

class Room {
  private member: ServerWebSocket<ClientData>[];
  private game?: NumberGuesser | RockPaperScissor;
  private genre: Genre;
  private redis: RedisClient;

  constructor(redis: RedisClient, ws: ServerWebSocket<ClientData>, genre: Genre) {
    this.redis = redis;
    this.member = [];
    this.addMember(ws);
    this.game = undefined;
    this.genre = genre;
  }

  public getMemberCount() {
    return this.member.length;
  }

  public getMemberName() {
    return this.member.map((ws) => ws.data.username);
  }

  public getMember() {
    return this.member;
  }

  public getGameName() {
    return this.game?.getGameName();
  }

  public getSerializableState() {
    return this.game;
  }

  public isUserInRoom(username: string) {
    const existingUsername = this.member.find(
      (client) => client.data.username === username
    );
    return !!existingUsername;
  }

  public async addMember(ws: ServerWebSocket<ClientData>) {
    this.member.push(ws);
    await this.redis.set(
      `${ws.data.room}-members`,
      JSON.stringify(this.member.map(client => client.data.username)),
      'EX',
      900
    );
    if (this.member.length === LIMIT) {
      if(this.game) {
        this.game.continueGame();
      } else {
        this.game =
          this.genre === "NUMBER_GUESSER"
            ? new NumberGuesser(this)
            : new RockPaperScissor(this);
      }
    }
  }

  public broadcastMessage(message: Message | ResultMessage) {
    this.member.forEach((client) => {
      client.send(JSON.stringify(message));
    });
  }

  public sendMessage(ws: ServerWebSocket<ClientData>, message: Message) {
    ws.send(JSON.stringify(message));
  }

  public handleGamePlay(ws: ServerWebSocket<ClientData>, message: Message) {
    this.game?.playerTurn(ws, message);
  }

  public handleReplay(ws: ServerWebSocket<ClientData>) {
    this.game?.handleReplay(ws);
  }

  public async handleLeave(ws: ServerWebSocket<ClientData>, disableReconnect: boolean = false) {
    const { username } = ws.data;
    this.member = this.member.filter((client) => client != ws);

    if (this.member.length === 0) {
      await this.redis.del(`${ws.data.room}-members`);
      return;
    }

    const rawCachedMembers = await this.redis.get(`${ws.data.room}-members`);
    if(rawCachedMembers && !disableReconnect) {
      const parsedMembers = JSON.parse(rawCachedMembers) as string[];
      const isUserInRoom = parsedMembers.find(member => member === username);
      if (isUserInRoom) {
        // Handle game reconnection logic
        this.game?.preparePlayerReconnect(ws);
        return;
      };
    }

    await this.redis.set(
      `${ws.data.room}-members`,
      JSON.stringify(this.member.map(client => client.data.username)),
      'EX',
      900
    );

    const msg: Message = {
      type: "OPPONENT-LEFT",
      text: `${username} has left the room`,
    };
    this.broadcastMessage(msg);

    this.game?.handlePlayerLeave(username);
  }
}

export default Room;
