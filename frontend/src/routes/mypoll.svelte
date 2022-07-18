<script lang="ts">
	import Poll, { type PollState } from '$lib/component/poll.svelte';
	import type { PollDto } from '$lib/model/pollDto';
	import { onMount } from 'svelte';
	import { toasts } from 'svelte-toasts';

	let pollStates: PollState[] = [];

	onMount(() => {
		loadPolls();
	});

	const loadPolls = async () => {
		const token = localStorage.getItem('token');

		const response = await fetch(`${import.meta.env.VITE_API_URL}/me/poll`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
		const data = await response.json();

		const loadedStates = data.items.map((item: PollDto) => {
			return {
				poll: item,
				isAlreadyVoting: false
			};
		});

		pollStates = [...pollStates, ...loadedStates];
	};

	const removePoll = async (pollId: string) => {
		const token = localStorage.getItem('token');

		const response = await fetch(`${import.meta.env.VITE_API_URL}/poll/${pollId}`, {
			headers: {
				Authorization: `Bearer ${token}`
			},
			method: 'DELETE'
		});

		if (response.ok) {
			const index = pollStates.findIndex((state) => state.poll.id === pollId);
			pollStates.splice(index, 1);
			pollStates = pollStates;

			toasts.add({
				title: 'Success',
				description: 'Vote deleted',
				duration: 5000,
				type: 'success',
				theme: 'light'
			});
		} else {
			const data = await response.json();

			toasts.add({
				title: 'Error',
				description: data.error,
				duration: 5000,
				type: 'error',
				theme: 'light'
			});
		}
	};
</script>

<div class="grid grid-cols-1 divide-y">
	{#each pollStates as state}
		<Poll {state} enableDelete={true} remove={() => removePoll(state.poll.id)} />
	{/each}
</div>
