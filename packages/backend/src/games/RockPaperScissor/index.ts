import { ServerWebSocket } from "bun";

import Room from "../../Room";
import { gamePickSchema } from "../../schema";
import { ClientData, GameRPS, Message, ResultMessage, Score } from "../../type";
import calculateGame from "./calculateGame";

class RockPaperScissor {
  private room: Room;
  private game: GameRPS;
  private replay: string[];
  private scores: Score;
  private counter: number;
  private timer?: Timer;

  constructor(room: Room) {
    this.room = room;
    this.game = {};
    this.counter = 15;
    this.replay = [];
    this.scores = this.room.getMember().reduce(
      (acc, member) => ({
        ...acc,
        [member.data.username]: 0,
      }),
      {}
    );

    this.informGameStart();
  }

  public getGameName() {
    return "ROCK_PAPER_SCISSOR";
  }

  private resetTimer() {
    clearInterval(this.timer);
    this.counter = 15;
    this.timer = undefined;
  }

  private resetGame() {
    this.game = {};
    this.replay = [];
    this.resetTimer();
    this.room.broadcastMessage({ type: "REPLAY", text: `Lets Play Again` });
  }

  private informGameStart() {
    const members = this.room.getMember();
    members.forEach((member, idx) => {
      this.room.sendMessage(member, {
        type: "OPPONENT",
        text: `${members[(idx + 1) % members.length].data.username}`,
      });
    });
  }

  public playerTurn(ws: ServerWebSocket<ClientData>, message: Message) {
    const { username } = ws.data;
    const pick = gamePickSchema.parse(message.text);
    //When Player Pick Before Opponent is present (only 1 player in room)
    if (this.room.getMember().length !== 2) {
      return;
    }
    this.game[username] = pick;

    //TIMER
    if (!this.timer) {
      this.timer = setInterval(() => {
        if (this.counter === 0) {
          this.room.broadcastMessage({
            type: "TIMER",
            text: `TIME OUT`,
          });

          const winner = username;
          this.scores[winner] = this.scores[winner] + 1;

          this.room.broadcastMessage({
            type: "RESULT",
            text: `${winner}`,
            data: {
              game: this.game,
              score: this.scores,
            },
          });
          this.resetTimer();
        } else {
          this.room.broadcastMessage({
            type: "TIMER",
            text: `${this.counter} second left`,
          });
        }
        this.counter = this.counter - 1;
      }, 1000);
    }

    //2 Player Already Pick
    if (Object.keys(this.game).length === 2) {
      const winner = calculateGame(this.game);
      if (winner !== "DRAW" && winner !== undefined) {
        this.scores[winner] = this.scores[winner] + 1;
      }
      const resultMsg: ResultMessage = {
        type: "RESULT",
        text: `${winner}`,
        data: {
          game: this.game,
          score: this.scores,
        },
      };
      this.room.broadcastMessage(resultMsg);
      this.resetTimer();
    }
  }
  public handleReplay(ws: ServerWebSocket<ClientData>) {
    if (this.room.getMember().length !== 2) {
      return;
    }

    if (this.timer || Object.keys(this.game).length !== 2) {
      return;
    }

    this.replay.push(ws.data.username);
    if (this.replay.length !== 2) {
      const msg: Message = {
        type: "INFO",
        text: "Waiting for other player...",
      };
      this.room.sendMessage(ws, msg);
      return;
    }
    this.resetGame();
  }
  public handlePlayerLeave(username: string) {
    this.counter = 15;
    this.replay = [];
    delete this.scores[username];
    delete this.game[username];
    this.scores[Object.keys(this.scores)[0]] = 0;
    this.resetTimer();
  }
}

export default RockPaperScissor;
