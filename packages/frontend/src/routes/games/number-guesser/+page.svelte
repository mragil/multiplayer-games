<script lang="ts">
	interface Result {
		game: Game;
		score: Score;
	}
	interface Message {
		type: 'INFO' | 'CHAT' | 'GAME' | 'OPPONENT' | 'TIMER' | 'RESULT' | 'RESET' | 'REPLAY';
		text: string;
		data?: Result;
	}

	interface Game {
		[key: string]: number[];
	}

	interface Score {
		[key: string]: number;
	}

	import { PUBLIC_WS_HOST } from '$env/static/public';
	import { slide } from 'svelte/transition';

	import Modal from '$lib/components/Modal.svelte';
	import Deck from './Deck.svelte';
	import Intro from './Intro.svelte';

	import game from '$lib/stores/number-guesser';
	import { user } from '$lib/stores/user';

	let socket: WebSocket;
	$: ({ name, room } = $user);
	$: ({
		isConnected,
		info,
		modalInfo,
		timer,
		gameData,
		isFinish,
		userGuessed,
		opponent,
		winner,
		scores,
		minRange,
		maxRange
	} = $game);
	$: opponentText =
		opponent === '' ? 'Waiting for your opponent...' : `Your opponent is ${opponent}`;

	const connectToRoom = () => {
		const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
		socket = new WebSocket(
			`${protocol}://${PUBLIC_WS_HOST}/number-guesser?userName=${name}&roomName=${room}`
		);
		game.connectToRoom(socket);
	};

	const sendGuess = (numberGuessed: number) => {
		game.sendGuess(socket, numberGuessed);
	};

	const showWinner = (winner: string) => {
		if (winner === opponent) {
			return 'You lose, sorry 😢';
		}

		return 'You win, congrats 🥳';
	};

	const resetGame = () => {
		game.resetGame(socket);
	};
</script>

<svelte:head>
	<title>Number Guesser</title>
</svelte:head>

<div class="h-fit p-5 text-center mx-auto my-auto">
	{#if isConnected}
		<Modal bind:isOpen={isFinish} closeHandler={resetGame}>
			<h1 slot="header" class="text-4xl">{showWinner(winner)}</h1>
			<div class="my-5" slot="content">
				{#if Object.values(gameData.player).length > 0}
					<p>Target Number: {gameData.targetNumber}</p>
					<p>Your guesses: {gameData.player[$user.name].toString()}</p>
					<p>{opponent} guesses: {gameData.player[opponent].toString()}</p>
				{/if}
			</div>
			<div slot="button-action-footer">
				{#if modalInfo === '' && isFinish}
					<button class="mx-auto my-auto w-20 text-black"
						><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
							><path
								fill="currentColor"
								d="M12 17q-2.075 0-3.537-1.463Q7 14.075 7 12h1.5q0 1.45 1.025 2.475Q10.55 15.5 12 15.5q1.45 0 2.475-1.025Q15.5 13.45 15.5 12q0-1.45-1.025-2.475Q13.45 8.5 12 8.5h-.075l1.225 1.25l-1.05 1.075l-3-3l3-3L13.175 5.9l-1.1 1.1q2.05.05 3.487 1.5Q17 9.95 17 12q0 2.075-1.462 3.537Q14.075 17 12 17Zm0 5q2.075 0 3.9-.788q1.825-.787 3.175-2.137q1.35-1.35 2.137-3.175Q22 14.075 22 12t-.788-3.9q-.787-1.825-2.137-3.175q-1.35-1.35-3.175-2.138Q14.075 2 12 2t-3.9.787q-1.825.788-3.175 2.138q-1.35 1.35-2.137 3.175Q2 9.925 2 12t.788 3.9q.787 1.825 2.137 3.175q1.35 1.35 3.175 2.137Q9.925 22 12 22Z"
							/></svg
						>
					</button>
				{:else}
					<h1 class="text-3xl">{info}</h1>
				{/if}
			</div>
		</Modal>

		<div class="flex flex-col items-center text-3xl">
			{#if timer}
				<div
					class="aspect-square w-fit p-1 border-4 rounded-full border-black"
					transition:slide={{}}
				>
					<h2 class="">{timer}</h2>
				</div>
			{/if}

			{#if info !== ''}
				<div class="p-5 shadow-md rounded-md mb-8" transition:slide={{}}>
					<h2>{info}</h2>
				</div>
			{/if}

			<div class="p-5 shadow-md rounded-md mb-8" transition:slide={{}}>
				<h2>The number is between: {minRange} - {maxRange}</h2>
			</div>

			<div class="grid grid-rows-2 gap-8 place-content-center" transition:slide={{}}>
				<h1 class={opponent ? '' : 'animate-bounce'}>{opponentText}</h1>
				<h2>Score: {scores[opponent] || 0}</h2>
				<Deck {sendGuess} {minRange} {maxRange} />
				<h1>{timer ? `Your Turn` : ''}</h1>
				<h1>{userGuessed ? `You Guess ${userGuessed}` : ''}</h1>
				<h2>Score: {scores[name] || 0}</h2>
			</div>
		</div>
	{:else}
		<div class="text-center py-20">
			<Intro {connectToRoom} />
		</div>
	{/if}
</div>
