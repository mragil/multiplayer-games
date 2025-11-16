import { z } from "zod";

import {
  ClientData,
  GameNG,
  Message,
  Score,
  ServerWebSocket,
} from "../../type";

import Room from "../../Room";
import { TARGET_LIMIT } from "../../constant";

class NumberGuesser {
  private name: string;
  private room: Room;
  private game: GameNG;
  private currentPlayer: ServerWebSocket<ClientData>;
  private targetNumber: number;
  private minLimit: number;
  private maxLimit: number;
  private scores: Score;
  private counter: number;
  private timerPlayer?: Timer;
  private replay: string[];

  constructor(room: Room) {
    this.name = "NUMBER_GUESSER";
    this.room = room;
    this.targetNumber = 0;
    this.counter = 15;
    this.game = {
      targetNumber: 0,
      player: this.room.getMember().reduce(
        (acc, member) => ({
          ...acc,
          [member.data.username]: [],
        }),
        {}
      ),
    };
    this.replay = [];
    this.scores = this.room.getMember().reduce(
      (acc, member) => ({
        ...acc,
        [member.data.username]: 0,
      }),
      {}
    );
    this.currentPlayer = this.room.getMember()[0];
    this.minLimit = 0;
    this.maxLimit = 0;

    this.informGameStart();
  }

  public getGameName() {
    return "NUMBER_GUESSER";
  }

  private findNextPlayer() {
    return this.room
      .getMember()
      .find((player) => player !== this.currentPlayer)!;
  }

  private calculateTargetNumberRange = (
    numberGuessed: number,
    targetNumber: number
  ) => {
    let result = "";

    if (numberGuessed < targetNumber) {
      result = `${numberGuessed}-${this.maxLimit}`;
      this.minLimit = numberGuessed;
    }
    if (numberGuessed > targetNumber) {
      result = `${this.minLimit}-${numberGuessed}`;
      this.maxLimit = numberGuessed;
    }
    return result;
  };

  private resetTimer() {
    clearInterval(this.timerPlayer);
    this.counter = 15;
    this.timerPlayer = undefined;
  }

  private resetGame() {
    this.replay = [];
    this.resetTimer();
    Object.keys(this.game.player).forEach(
      (username) => (this.game.player[username] = [])
    );
    this.room.broadcastMessage({ type: "REPLAY", text: `Lets Play Again` });
  }

  private informPlayerTurn() {
    const msg: Message = {
      type: "PLAYER_TURN",
      text: `${this.currentPlayer.data.username}}`,
    };
    this.room.broadcastMessage(msg);

    //TIMER
    if (!this.timerPlayer) {
      this.timerPlayer = setInterval(() => {
        if (this.counter === 0) {
          this.room.broadcastMessage({
            type: "TIMER",
            text: `X`,
          });

          const winner = this.findNextPlayer().data.username;
          this.scores[winner] = this.scores[winner] + 1;

          this.room.broadcastMessage({
            type: "RESULT",
            text: `${winner}`,
            data: {
              score: this.scores,
              game: this.game,
            },
          });
          this.resetTimer();
        } else {
          this.room.sendMessage(this.currentPlayer, {
            type: "TIMER",
            text: `${this.counter}`,
          });
        }
        this.counter = this.counter - 1;
      }, 1000);
    }
  }

  private informGameStart() {
    this.targetNumber = Math.floor(Math.random() * TARGET_LIMIT) + 1;
    this.game.targetNumber = this.targetNumber;
    this.minLimit = 1;
    this.maxLimit = TARGET_LIMIT;

    const members = this.room.getMember();
    members.forEach((member, idx) => {
      this.room.sendMessage(member, {
        type: "OPPONENT",
        text: `${members[(idx + 1) % members.length].data.username}`,
      });
    });

    // Inform target number range to all player
    this.room.broadcastMessage({
      type: "GAME",
      text: `${this.minLimit}-${this.maxLimit}`,
    });

    //Inform Player 1 turn
    this.informPlayerTurn();
  }

  public playerTurn(ws: ServerWebSocket<ClientData>, message: Message) {
    const numberGuessed = z.coerce.number().parse(message.text);
    const { username } = ws.data;

    if (
      numberGuessed < this.minLimit ||
      numberGuessed > this.maxLimit ||
      numberGuessed === this.minLimit ||
      numberGuessed === this.maxLimit
    ) {
      this.room.sendMessage(ws, {
        type: "INFO",
        text: `The number you guessed must be bigger than ${this.minLimit} and less than ${this.maxLimit}`,
      });
      return;
    }

    this.resetTimer();

    if (username !== this.currentPlayer.data.username) {
      return;
    }

    this.game.player[username].push(numberGuessed);

    if (numberGuessed === this.targetNumber) {
      this.scores[username] = this.scores[username] + 1;
      this.room.broadcastMessage({
        type: "RESULT",
        text: username,
        data: {
          game: this.game,
          score: this.scores,
        },
      });
      this.resetTimer();
      return;
    }

    this.room.broadcastMessage({
      type: "GAME",
      text: this.calculateTargetNumberRange(numberGuessed, this.targetNumber),
    });

    this.currentPlayer = this.findNextPlayer();
    this.informPlayerTurn();
  }

  public handleReplay(ws: ServerWebSocket<ClientData>) {
    if (this.room.getMember().length !== 2) {
      return;
    }

    if (this.timerPlayer) {
      return;
    }

    this.replay.push(ws.data.username);
    if (this.replay.length !== 2) {
      const msg: Message = {
        type: "MODAL-INFO",
        text: "Waiting for other player...",
      };
      this.room.sendMessage(ws, msg);
      return;
    }
    this.resetGame();

    this.currentPlayer = this.findNextPlayer();
    this.informGameStart();
  }

  public handlePlayerLeave(username: string) {
    this.counter = 15;
    this.replay = [];
    delete this.scores[username];
    delete this.game.player[username];
    this.scores[Object.keys(this.scores)[0]] = 0;
    this.game.player[Object.keys(this.game.player)[0]] = [];
    this.resetTimer();
  }
}

export default NumberGuesser;
