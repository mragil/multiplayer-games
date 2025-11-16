<script lang="ts">
	import { user } from '$lib/stores/user';

	export let connectToRoom: () => void;
</script>

<div class="">
	<form
		action=""
		class="grid gap-5 grid-rows-3 items-center mb-0 mt-6 p-4 sm:p-6 lg:p-8"
		on:submit={connectToRoom}
	>
		<p class="text-center text-7xl font-medium mb-10 text-orange-600">Welcome</p>

		<div>
			<label for="name" class="sr-only">Name</label>
			<div class="relative">
				<input
					type="text"
					class="w-full md:w-96 rounded-lg border-gray-500 border-b-8 p-4 pe-12 text-md bg-transparent"
					placeholder="Enter your name"
					required
					bind:value={$user.name}
				/>
			</div>
		</div>

		<div>
			<label for="text" class="sr-only">Room</label>

			<div class="relative">
				<input
					type="text"
					class="w-full md:w-96 rounded-lg border-gray-500 border-b-8 p-4 pe-12 text-md bg-transparent"
					placeholder="Enter room"
					required
					bind:value={$user.room}
				/>
			</div>
		</div>

		<button type="submit" class="w-12 mx-auto my-auto">
			<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M21.4086 9.35258C23.5305 10.5065 23.5305 13.4935 21.4086 14.6474L8.59662 21.6145C6.53435 22.736 4 21.2763 4 18.9671L4 5.0329C4 2.72368 6.53435 1.26402 8.59661 2.38548L21.4086 9.35258Z"
					fill="rgb(34 197 94)"
				/>
			</svg>
		</button>
	</form>
</div>
