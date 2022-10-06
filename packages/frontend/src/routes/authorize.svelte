<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import * as queryString from 'query-string';
	import { saveToken } from '$lib/store/authStore';
	import { goto } from '$app/navigation';

	let text = 'Authenticating';

	onMount(async () => {
		const parsedHash = queryString.parse($page.url.hash);

		const accessToken = parsedHash.access_token;

		if (typeof accessToken === 'string') {
			saveToken(accessToken);
		}

		goto('/');
	});
</script>

<h1 class="text-3xl">{text}</h1>
