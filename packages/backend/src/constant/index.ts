const LIMIT = 2;
const PORT = process.env.PORT || 3000;

const FIRST_PLAYER = 0;
const TARGET_LIMIT = 100;

const GAME_GENRE = {
  "/number-guesser": "NUMBER_GUESSER",
  "/rock-paper-scissor": "ROCK_PAPER_SCISSOR",
};

export { FIRST_PLAYER, LIMIT, PORT, TARGET_LIMIT, GAME_GENRE };
