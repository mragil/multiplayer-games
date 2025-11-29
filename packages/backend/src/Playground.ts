import { ClientData, Genre, Rooms, ServerWebSocket } from "./type";

import Room from "./Room";
import { LIMIT } from "./constant";
import { RedisClient } from "bun";

class Playground {
  private rooms: Rooms;
  private redis: RedisClient;

  public constructor(redis: RedisClient) {
    this.rooms = {};
    this.redis = redis;
  }

  public initializeRoom(
    room: string,
    ws: ServerWebSocket<ClientData>,
    genre: Genre
  ) {
    this.rooms[room] = new Room(this.redis, ws, genre);
  }

  public isRoomExist(room: string) {
    return !!this.rooms[room];
  }

  public getRoom(room: string) {
    if (!this.isRoomExist(room)) {
      throw new Error("Room not found!");
    }
    return this.rooms[room];
  }

  public deleteRoom(room: string) {
    delete this.rooms[room];
  }

  public getRooms() {
    const roomNames = Object.keys(this.rooms);
    const data = roomNames.map((name) => {
      return {
        name,
        isFull: this.getRoom(name).getMemberCount() === LIMIT,
        member: this.getRoom(name).getMemberName(),
        game: this.getRoom(name).getGameName(),
      };
    });
    return data;
  }
}

export default Playground;
