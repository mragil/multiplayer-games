<script lang="ts">
	type Pick = 'Rock' | 'Paper' | 'Scissor';

	import game from '$lib/stores/rock-paper-scissor';
	import rock from '$lib/assets/rock.svg';
	import paper from '$lib/assets/paper.svg';
	import scissor from '$lib/assets/scissor.svg';

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
		class={`w-56 p-4 text-yellow-400 ${
			active === 'Scissor' && 'rounded-full border-8 border-red-700'
		}`}
		on:click={() => choosePick('Scissor')}
		title="Scissor"
	>
		<img src={scissor} alt="Scissor Sign"/>
	</button>

	<button
		disabled={!isOppReady}
		class={`w-52 p-4 text-yellow-400 ${
			active === 'Paper' && 'rounded-full border-8 border-red-700'
		}`}
		on:click={() => choosePick('Paper')}
		title="Paper"
	>
		<img src={paper} alt="Paper Sign"/>
	</button>

	<button
		disabled={!isOppReady}
		class={`w-52 p-4 text-yellow-400 ${
			active === 'Rock' && 'rounded-full border-8 border-red-700'
		}`}
		on:click={() => choosePick('Rock')}
		title="Rock"
		>
			<img src={rock} alt="Rock Sign"/>
	</button>
</div>
