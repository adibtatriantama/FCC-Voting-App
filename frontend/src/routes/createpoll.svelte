<script lang="ts">
	import { goto } from '$app/navigation';

	import { toasts } from 'svelte-toasts';

	let pollName = '';
	let options: string[] = ['', ''];
	let isLoading = false;

	const addNewOption = () => {
		options = [...options, ''];
	};

	const createPoll = async () => {
		const sanitizedOptions = sanitizeOptions();

		if (!isLoading) {
			isLoading = true;

			const token = localStorage.getItem('token');

			const response = await fetch(`${import.meta.env.VITE_API_URL}/poll`, {
				method: 'POST',
				body: JSON.stringify({
					name: pollName,
					options: sanitizedOptions
				}),
				headers: {
					'Content-type': 'application/json; charset=UTF-8',
					Authorization: `Bearer ${token}`
				}
			});

			const data = await response.json();

			if (response.ok) {
				toasts.add({
					title: 'Success',
					description: 'Poll added',
					duration: 5000,
					type: 'success',
					theme: 'light'
				});

				goto('/mypoll');
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

	const sanitizeOptions = (): string[] => {
		return options.filter((option) => option.length > 0);
	};
</script>

<div class="mt-8">
	<h1 class="text-3xl">Create Poll</h1>

	<form action="#" method="POST">
		<div class="sm:overflow-hidden">
			<div class="px-4 py-5 bg-white space-y-6 sm:p-6">
				<div class="grid grid-cols-3 gap-6">
					<div class="col-span-3 sm:col-span-2">
						<label for="poll-name" class="block font-medium text-gray-700"> Poll Name </label>
						<div class="mt-1 flex rounded-md shadow-sm">
							<input
								bind:value={pollName}
								type="text"
								name="poll-name"
								id="poll-name"
								class="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
							/>
						</div>
					</div>
				</div>

				<div>
					<label for="options" class="block font-medium text-gray-700"> Options </label>
					<div class="mt-1">
						{#each options as option, i}<label
								for="option-{i + 1}"
								class="block text-sm font-medium text-gray-700"
							>
								Option {i + 1}
							</label>
							<div class="mt-1 flex rounded-md shadow-sm">
								<input
									bind:value={option}
									type="text"
									name="option-{i + 1}"
									id="option-{i + 1}"
									class="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block rounded-md sm:text-sm border-gray-300"
								/>
							</div>
						{/each}
						<button
							on:click|preventDefault={addNewOption}
							class=" mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
							>Add new Option
						</button>
					</div>
				</div>

				<div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
					<button
						on:click|preventDefault={createPoll}
						class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>Save</button
					>
				</div>
			</div>
		</div>
	</form>
</div>
