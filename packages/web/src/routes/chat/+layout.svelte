<script lang="ts">
	import type { Snippet } from 'svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

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

<div class="flex h-screen overflow-hidden bg-surface-base">
	<Sidebar
		onSelectChat={handleSelectChat}
		onNewChat={handleNewChat}
		selectedChatId={currentChatId}
		collapsed={sidebarCollapsed}
		onToggleCollapse={toggleSidebar}
	/>
	<main class="relative flex-1 overflow-hidden">
		{@render children()}
	</main>
</div>
