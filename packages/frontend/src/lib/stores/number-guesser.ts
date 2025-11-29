import { browser } from '$app/environment';
import { writable } from 'svelte/store';

interface Result {
	game: Game;
	score: Score;
}

interface Message {
	type:
		| 'INFO'
		| 'MODAL-INFO'
		| 'CHAT'
		| 'GAME'
		| 'OPPONENT'
		| 'TIMER'
		| 'RESULT'
		| 'RESET'
		| 'REPLAY'
		| 'OPPONENT-LEFT'
		| 'PLAYER_TURN'
		| 'CURRENT_SCORE';
	text: string;
	data?: Result;
}

interface PlayerGuess {
	[key: string]: number[];
}

interface Game {
	targetNumber: number;
	player: PlayerGuess;
}

interface Score {
	[key: string]: number;
}

type GameState = {
	timer: string | null;
	isFinish: boolean;
	userGuessed: number | null;
	gameData: Game;
	scores: Score;
	opponent: string;
	winner: string;
	info: string;
	modalInfo: string;
	isConnected: boolean;
	minRange: number;
	maxRange: number;
};

const store = () => {
	const gameState: GameState = {
		timer: null,
		isFinish: false,
		userGuessed: null,
		opponent: '',
		winner: '',
		gameData: { player: {}, targetNumber: 0 },
		scores: {},
		info: '',
		modalInfo: '',
		isConnected: false,
		minRange: 0,
		maxRange: 0
	};

	const { update, subscribe } = writable(gameState);

	const connectToRoom = (socket: WebSocket) => {
		if (browser) {
			socket.addEventListener('open', (event) => {
				update((state) => ({ ...state, isConnected: true }));
				console.log('[websocket] connection open', event);
			});
			socket.addEventListener('close', (event) => {
				update(() => gameState);
				console.log('[websocket] connection closed', event);
			});
			socket.addEventListener('message', (event) => {
				console.log('[websocket] message received', event);
				const message: Message = JSON.parse(event.data);
				if (message.type === 'OPPONENT') {
					update((state) => ({ ...state, opponent: message.text }));
				}
				if (message.type === 'TIMER') {
					update((state) => ({ ...state, timer: message.text }));
				}
				if (message.type === 'CURRENT_SCORE') {
					update((state) => ({ ...state, scores: message.data!.score }));
				}
				if (message.type === 'RESULT') {
					update((state) => ({
						...state,
						isFinish: true,
						winner: message.text,
						gameData: message.data!.game,
						scores: message.data!.score
					}));
				}
				if (message.type === 'GAME') {
					const [minRange, maxRange] = message.text.split('-');
					update((state) => ({ ...state, minRange: Number(minRange), maxRange: Number(maxRange) }));
				}
				if (message.type === 'INFO') {
					update((state) => ({ ...state, info: message.text }));
				}
				if (message.type === 'MODAL-INFO') {
					update((state) => ({ ...state, modalInfo: message.text }));
				}
				if (message.type === 'REPLAY') {
					update((state) => ({ ...state, info: '', isFinish: false }));
				}
				if (message.type === 'OPPONENT-LEFT') {
					update((state) => {
						const updatedGameData = { ...state.gameData };
						delete updatedGameData.player![state.opponent];

						const updatedScores = { ...state.scores };
						delete updatedScores[state.opponent];
						updatedScores[Object.keys(updatedScores)[0]] = 0;

						return {
							...state,
							timer: null,
							isFinish: false,
							userGuessed: null,
							opponent: '',
							winner: '',
							gameData: updatedGameData,
							scores: updatedScores,
							info: '',
							modalInfo: '',
							minRange: 0,
							maxRange: 0
						};
					});
				}
			});
		}
	};

	const playerTurn = (socket: WebSocket, userGuessed: number) => {
		update((state) => ({
			...state,
			userGuessed,
			timer: null,
			info: '',
			modalInfo: ''
		}));
		const msg: Message = {
			type: 'PLAYER_TURN',
			text: userGuessed.toString()
		};
		socket.send(JSON.stringify(msg));
	};

	const resetGame = (socket: WebSocket) => {
		const msg: Message = {
			type: 'REPLAY',
			text: ''
		};
		update((state) => ({
			...state,
			userGuessed: null,
			timer: null,
			info: '',
			modalInfo: '',
			minRange: 0,
			maxRange: 0
		}));
		socket.send(JSON.stringify(msg));
	};

	return {
		subscribe,
		connectToRoom,
		sendGuess: playerTurn,
		resetGame
	};
};

export default store();
