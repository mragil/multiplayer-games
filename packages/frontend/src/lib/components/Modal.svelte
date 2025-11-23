<script lang="ts">
	export let isOpen: boolean;
	export let closeHandler: () => void;

	let dialog: HTMLDialogElement;

	$: if (dialog && isOpen) dialog.showModal();
	$: if (dialog && !isOpen) dialog.close();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
	bind:this={dialog}
	on:close={() => (isOpen = false)}
	on:click|self={() => dialog.close()}
	class="rounded-lg backdrop:bg-black backdrop:opacity-50 my-auto mx-auto"
>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation class="bg-green-400 p-8 shadow-2xl">
		<slot name="header" />

		<slot name="content" />

		<div class="mt-4">
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<svelte:element
				this={'modal-button-action'}
				on:click={() => {
					closeHandler();
					dialog.close();
				}}><slot name="button-action-footer" /></svelte:element
			>
		</div>
	</div>
</dialog>
