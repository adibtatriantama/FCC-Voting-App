<script>
	import Header from '$lib/component/header.svelte';
	import { loadUser } from '$lib/store/authStore';
	import { onMount } from 'svelte';
	import { ToastContainer, FlatToast } from 'svelte-toasts';
	import '../app.css';

	onMount(() => {
		loadUser();
	});
</script>

<Header />

<div class="max-w-7xl mx-auto px-8 sm:px-6">
	<slot />
</div>

<ToastContainer placement="bottom-right" let:data>
	<FlatToast {data} />
</ToastContainer>
