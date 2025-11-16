import { browser } from '$app/environment';
import { writable } from 'svelte/store';

interface Result {
	game: Game;
	score: Score;
}

interface Message {
	type:
		| 'INFO'
		| 'CHAT'
		| 'GAME'
		| 'OPPONENT'
		| 'TIMER'
		| 'RESULT'
		| 'RESET'
		| 'REPLAY'
		| 'OPPONENT-LEFT'
		| 'PLAYER_TURN';
	text: string;
	data?: Result;
}

type Pick = 'Rock' | 'Paper' | 'Scissor';

interface Game {
	[key: string]: Pick;
}

interface Score {
	[key: string]: number;
}

type GameState = {
	timer: string | null;
	isFinish: boolean;
	userPick: Pick | null;
	gameData: Game;
	scores: Score;
	opponent: string;
	winner: string;
	info: string;
	isConnected: boolean;
};

const store = () => {
	const gameState: GameState = {
		timer: null,
		isFinish: false,
		userPick: null,
		opponent: '',
		winner: '',
		gameData: {},
		scores: {},
		info: '',
		isConnected: false
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
				if (message.type === 'RESULT') {
					update((state) => ({
						...state,
						isFinish: true,
						winner: message.text,
						gameData: message.data!.game,
						scores: message.data!.score
					}));
				}
				if (message.type === 'INFO') {
					update((state) => ({ ...state, info: message.text }));
				}
				if (message.type === 'REPLAY') {
					update((state) => ({ ...state, info: '', isFinish: false }));
				}
				if (message.type === 'OPPONENT-LEFT') {
					update((state) => {
						const updatedGameData = { ...state.gameData };
						delete updatedGameData[state.opponent];

						const updatedScores = { ...state.scores };
						delete updatedScores[state.opponent];
						updatedScores[Object.keys(updatedScores)[0]] = 0;

						return {
							...state,
							timer: null,
							isFinish: false,
							userPick: null,
							opponent: '',
							winner: '',
							gameData: updatedGameData,
							scores: updatedScores,
							info: ''
						};
					});
				}
			});
		}
	};

	const sendPick = (socket: WebSocket, pick: Pick) => {
		update((state) => ({ ...state, userPick: pick }));
		const msg: Message = {
			type: 'PLAYER_TURN',
			text: pick
		};
		socket.send(JSON.stringify(msg));
	};

	const resetGame = (socket: WebSocket) => {
		const msg: Message = {
			type: 'REPLAY',
			text: ''
		};
		update((state) => ({ ...state, userPick: null, timer: null }));
		socket.send(JSON.stringify(msg));
	};

	return {
		subscribe,
		connectToRoom,
		sendPick,
		resetGame
	};
};

export default store();
