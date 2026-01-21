<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/chat');
	});
</script>

<div class="flex h-screen items-center justify-center bg-surface-base">
	<p class="text-text-secondary">Loading...</p>
</div>
