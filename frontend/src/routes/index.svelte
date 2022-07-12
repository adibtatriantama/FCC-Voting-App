<script lang="ts">
	import Poll from '$lib/component/poll.svelte';
	import type { PollDto } from '$lib/model/pollDto';
	import { loadUser, userStore } from '$lib/store/authStore';
	import { onMount } from 'svelte';

	let polls: PollDto[] = [];

	onMount(() => {
		loadPolls();
	});

	const loadPolls = async () => {
		const response = await fetch(`${import.meta.env.VITE_API_URL}/poll`);
		const data = await response.json();

		polls = [...polls, ...data.items];
	};
</script>

<div class="grid grid-cols-1 divide-y">
	{#each polls as poll}
		<Poll {poll} />
	{/each}
</div>
