<script lang="ts">
	import type { PollDto } from '$lib/model/pollDto';
	import { toasts } from 'svelte-toasts';
	import Pie from 'svelte-chartjs/src/Pie.svelte';
	import * as d3 from 'd3';

	const chartJsOptions = {
		responsive: true,
		maintainAspectRatio: false,
		layout: {
			padding: 20
		}
	};

	export let poll: PollDto;

	type VoteOptionState = 'existing' | 'new';
	let voteOptionState: VoteOptionState = 'existing';
	let isAlreadyVoting = false;
	let isLoading = false;
	let isStatisticLoaded = false;

	let optionInputNew: string;
	let optionExisting: string;
	let pieData: any;

	const toggleVoteOptionState = () => {
		if (voteOptionState === 'existing') {
			voteOptionState = 'new';
		} else {
			voteOptionState = 'existing';
		}
	};

	const vote = async () => {
		if (!isLoading) {
			isLoading = true;

			const token = localStorage.getItem('token');

			const response = await fetch(`${import.meta.env.VITE_API_URL}/poll/${poll.id}/vote`, {
				method: 'POST',
				body: JSON.stringify({
					option: getOption()
				}),
				headers: {
					'Content-type': 'application/json; charset=UTF-8',
					Authorization: `Bearer ${token}`
				}
			});

			const data = await response.json();

			if (response.ok) {
				poll = data;
				generatePieData();

				isAlreadyVoting = true;
				voteOptionState = 'existing';

				toasts.add({
					title: 'Success',
					description: 'Vote added',
					duration: 5000,
					type: 'success',
					theme: 'light'
				});
			} else {
				toasts.add({
					title: 'Error',
					description: data.error,
					duration: 5000,
					type: 'error',
					theme: 'light'
				});
			}
			isLoading = false;
		}
	};

	const getOption = (): string => {
		if (voteOptionState === 'existing') {
			return optionExisting;
		} else {
			return optionInputNew;
		}
	};

	const generatePieData = () => {
		const colorScale = d3
			.scaleSequential()
			.interpolator(d3.interpolateCool)
			.domain([0, poll.options.length]);

		const labels = poll.options;
		const data = labels.map((option) => {
			if (poll.voteCountPerOption) {
				return poll.voteCountPerOption[option];
			}
		});
		const color = [];

		for (let i = 1; i <= labels.length; i++) {
			color.push(colorScale(i));
		}

		pieData = {
			labels,
			datasets: [
				{
					data: data,
					backgroundColor: color,
					hoverBackgroundColor: color
				}
			]
		};

		isStatisticLoaded = true;
	};
</script>

<div class="text-gray-600 body-font">
	<div class="container px-5 mx-auto flex flex-wrap">
		<div class="flex flex-wrap -mx-4 mt-auto mb-auto lg:w-1/2 sm:w-2/3 content-start sm:pr-10">
			<div class="w-full sm:p-4 px-4 mb-6">
				<label class="font-medium text-xl text-gray-700" for="poll1">
					{`${poll.name}:`}
				</label>
				<p class="text-sm mb-4 text-gray-700">Created by {poll.author}</p>
				{#if voteOptionState === 'existing'}
					<div>
						<select name="poll1" id="poll1" bind:value={optionExisting}>
							{#each poll.options as option}
								<option value={option}>{option}</option>
							{/each}
						</select>
						{#if isAlreadyVoting !== true}
							<button class="ml-2 hover:underline text-sm" on:click={toggleVoteOptionState}
								>or other option</button
							>
						{/if}
					</div>
				{:else}
					<div>
						<form class="inline" on:submit|preventDefault={vote}>
							<input placeholder="type your other option" type="text" bind:value={optionInputNew} />
						</form>
						<button class="ml-2 hover:underline text-sm" on:click={toggleVoteOptionState}
							>back to existing option</button
						>
					</div>
				{/if}

				{#if isAlreadyVoting}
					<p class="text-sm text-gray-700">You already voted</p>
				{/if}

				{#if isLoading}
					<div
						class="mt-10 inline-flex text-white bg-gray-300 border-0 py-2 px-6 focus:outline-none rounded text-lg"
					>
						Loading...
					</div>
				{:else if isAlreadyVoting !== true}
					<button
						class="mt-10 inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
						on:click={vote}
					>
						Vote
					</button>

					{#if isStatisticLoaded === false}
						<button class="ml-2 hover:underline text-sm" on:click={generatePieData}
							>see statistic</button
						>
					{/if}
				{/if}
			</div>
		</div>
		<div class="lg:w-1/2 sm:w-1/3 w-full rounded-lg overflow-hidden mt-6 sm:mt-0">
			<Pie data={pieData} options={chartJsOptions} />
		</div>
	</div>
</div>
