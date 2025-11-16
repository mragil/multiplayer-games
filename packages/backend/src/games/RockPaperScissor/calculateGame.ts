import { GameRPS as Game } from "../../type";

const calculateGame = (input: Game) => {
  const [p1, p2] = Object.keys(input);
  if (input[p1] === input[p2]) {
    return "DRAW";
  }
  if (input[p1] === "Rock") {
    if (input[p2] === "Scissor") {
      return p1;
    } else {
      //If P2 === Paper
      return p2;
    }
  }
  if (input[p1] === "Paper") {
    if (input[p2] === "Rock") {
      return p1;
    } else {
      // If P2 === Scissor
      return p2;
    }
  }
  if (input[p1] === "Scissor") {
    if (input[p2] === "Paper") {
      return p1;
    } else {
      // If P2 === Rock
      return p2;
    }
  }
};

export default calculateGame;
