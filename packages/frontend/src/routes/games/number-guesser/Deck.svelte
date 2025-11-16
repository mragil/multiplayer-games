<script lang="ts">
	export let minRange: number;
	export let maxRange: number;
	let numberGuessed: number;
	export let sendGuess: (guess: number) => void;

	const isValidGuess = () => {
		if (numberGuessed > maxRange || numberGuessed < minRange) {
			return false;
		}
		return true;
	};
</script>

{#if !isValidGuess}
	<p>You must guess number between {minRange} - {maxRange}</p>
{/if}

<form
	on:submit|preventDefault={() => {
		sendGuess(numberGuessed);
	}}
	class="flex flex-col gap-5 items-center"
>
	<input
		class="w-24 aspect-square rounded-md text-center"
		type="number"
		name="number-guessed"
		bind:value={numberGuessed}
	/>
	<button type="submit" class="aspect-square w-fit p-1 border-4 rounded-full border-black"
		>Guess</button
	>
</form>
