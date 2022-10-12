<script lang="ts">
	import Poll, { type PollState } from '$lib/component/poll.svelte';
	import type { PollDto } from '$lib/model/pollDto';
	import { onMount } from 'svelte';

	let pollStates: PollState[] = [];

	onMount(() => {
		loadPolls();
	});

	const loadPolls = async () => {
		const response = await fetch(`${import.meta.env.VITE_API_URL}/poll`);
		const data = await response.json();

		const loadedStates = data.items.map((item: PollDto) => {
			return {
				poll: item,
				isAlreadyVoting: false
			};
		});

		pollStates = [...pollStates, ...loadedStates];
	};
</script>

<div class="grid grid-cols-1 divide-y">
	{#each pollStates as state}
		<Poll {state} />
	{/each}
</div>
