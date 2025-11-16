<script lang="ts">
	type Pick = 'Rock' | 'Paper' | 'Scissor';

	import game from '$lib/stores/rock-paper-scissor';

	export let sendPick: (pick: Pick) => void;
	export let active: Pick | null = null;
	$: isOppReady = $game.opponent === '' ? false : true;

	const choosePick = (input: Pick) => {
		active = input;
		sendPick(input);
	};
</script>

<div class="flex items-center justify-center gap-5 overflow-hidden">
	<button
		disabled={!isOppReady}
		class={`p-4 w-56 text-yellow-400 ${
			active === 'Scissor' && 'border-8 border-red-700 rounded-full'
		}`}
		on:click={() => choosePick('Scissor')}
		title="Scissor"
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
			><path
				fill="currentColor"
				d="M7 19h8v3H7v-3m9.15-7l-3.18-1.66a.49.49 0 0 0-.37.16l-.3.31l.59 2.42l-.98.24l-1.19-4.97l-1.47.68l1.04 4.29l-.97.23l-1-4.11l-.47.21c-.5.2-.85.73-.85 1.34v4.36c0 .8.73 1.5 1.5 1.5H15c.39 0 .74-.16 1-.43l.5-.41s.5-.38.5-.8V13.7s0-1.14-.85-1.7m.79-11c-.54-.09-1.07.25-1.18.8l-1.07 6.17c-.22-.03-.31-.11-.61-.14l-.43.05l-1.24-6.08a1.02 1.02 0 0 0-1.17-.8c-.55.13-.9.66-.79 1.2l1.2 5.91l.35 1.56c.28-.2.61-.33.97-.33h.34l3 1.61l1.41-8.75c.11-.54-.22-1.07-.78-1.2Z"
			/>
		</svg>
	</button>

	<button
		disabled={!isOppReady}
		class={`p-4 w-52 text-yellow-400 ${
			active === 'Paper' && 'border-8 border-red-700 rounded-full'
		}`}
		on:click={() => choosePick('Paper')}
		title="Paper"
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"
			><path
				fill="currentColor"
				d="M216 104v48a88 88 0 0 1-176 0V64a16 16 0 0 1 32 0v56a8 8 0 0 0 16 0V32a16 16 0 0 1 32 0v80a8 8 0 0 0 16 0V48a16 16 0 0 1 32 0v80.67A48.08 48.08 0 0 0 128 176a8 8 0 0 0 16 0a32 32 0 0 1 32-32a8 8 0 0 0 8-8v-32a16 16 0 0 1 32 0Z"
			/>
		</svg>
	</button>

	<button
		disabled={!isOppReady}
		class={`p-4 w-52 text-yellow-400 ${
			active === 'Rock' && 'border-8 border-red-700 rounded-full'
		}`}
		on:click={() => choosePick('Rock')}
		title="Rock"
		><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"
			><path
				fill="currentColor"
				d="M232 120v8a104 104 0 0 1-104.37 104c-54-.19-98-42.06-103.12-94.78a4 4 0 0 1 5.56-4A35.94 35.94 0 0 0 72 122.59a35.92 35.92 0 0 0 53.94 2.33a40.36 40.36 0 0 0 12.87 13A47.94 47.94 0 0 0 120 176a8 8 0 0 0 8.67 8a8.21 8.21 0 0 0 7.33-8.26A32 32 0 0 1 168 144a8 8 0 0 0 8-8.53a8.18 8.18 0 0 0-8.25-7.47H160a24 24 0 0 1-24-24V88h64a32 32 0 0 1 32 32Zm-187.27 0C55.57 119.6 64 110.37 64 99.52v-23C64 65.63 55.57 56.4 44.73 56A20 20 0 0 0 24 76v24a20 20 0 0 0 20.73 20Zm56 0c10.84-.39 19.27-9.62 19.27-20.47v-47c0-10.85-8.43-20.08-19.27-20.47A20 20 0 0 0 80 52v48a20 20 0 0 0 20.73 20ZM176 52a20 20 0 0 0-20.73-20c-10.84.4-19.27 9.63-19.27 20.48V72h36a4 4 0 0 0 4-4Z"
			/>
		</svg>
	</button>
</div>
