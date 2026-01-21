<script lang="ts">
	import type { Snippet } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ChevronLeft from 'svelte-bootstrap-icons/lib/ChevronLeft.svelte';
	import ChevronRight from 'svelte-bootstrap-icons/lib/ChevronRight.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	// Get current chat ID from URL
	const currentChatId = $derived(page.params.chatId ?? null);

	// Sidebar collapsed state
	let sidebarCollapsed = $state(false);

	function handleSelectChat(chatId: string) {
		goto(`/chat/${chatId}`, { replaceState: false });
	}

	function handleNewChat() {
		goto('/chat', { replaceState: false });
	}

	function toggleSidebar() {
		sidebarCollapsed = !sidebarCollapsed;
	}
</script>

<div class="relative flex h-screen overflow-hidden bg-surface-base">
	<Sidebar
		onSelectChat={handleSelectChat}
		onNewChat={handleNewChat}
		selectedChatId={currentChatId}
		collapsed={sidebarCollapsed}
	/>

	<!-- Sidebar Toggle Button -->
	<button
		onclick={toggleSidebar}
		class="absolute top-4 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-border-default bg-surface-sidebar text-text-secondary transition-all duration-200 hover:bg-surface-hover hover:text-text-primary {sidebarCollapsed
			? 'left-2'
			: 'left-[252px]'}"
	>
		{#if sidebarCollapsed}
			<ChevronRight width={12} height={12} />
		{:else}
			<ChevronLeft width={12} height={12} />
		{/if}
	</button>

	<main class="relative flex-1 overflow-hidden">
		{@render children()}
	</main>
</div>
