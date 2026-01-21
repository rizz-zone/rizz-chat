<script lang="ts">
	import { chatStore, type Chat } from '$lib/stores/chat.svelte';
	import PlusLg from 'svelte-bootstrap-icons/lib/PlusLg.svelte';
	import ChatLeft from 'svelte-bootstrap-icons/lib/ChatLeft.svelte';
	import Gear from 'svelte-bootstrap-icons/lib/Gear.svelte';
	import LayoutSidebar from 'svelte-bootstrap-icons/lib/LayoutSidebar.svelte';

	interface Props {
		onSelectChat?: (chatId: string) => void;
		onNewChat?: () => void;
		selectedChatId?: string | null;
		collapsed?: boolean;
		onToggleCollapse?: () => void;
	}

	let {
		onSelectChat,
		onNewChat,
		selectedChatId = null,
		collapsed = false,
		onToggleCollapse
	}: Props = $props();

	function handleChatClick(chat: Chat) {
		onSelectChat?.(chat.id);
	}

	function handleNewChat() {
		onNewChat?.();
	}
</script>

<aside
	class="flex h-full shrink-0 flex-col bg-surface-sidebar transition-[width] duration-200 ease-out {collapsed
		? 'w-14'
		: 'w-64 border-r border-border-sidebar'}"
>
	{#if collapsed}
		<!-- Collapsed: Icon Bar -->
		<div class="flex flex-col items-center gap-1 p-2">
			<button
				onclick={onToggleCollapse}
				class="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
				title="Expand sidebar"
			>
				<LayoutSidebar width={20} height={20} />
			</button>
			<button
				onclick={handleNewChat}
				class="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
				title="New chat"
			>
				<PlusLg width={20} height={20} />
			</button>
		</div>
	{:else}
		<!-- Expanded: Full Sidebar -->
		<div class="flex h-full w-64 flex-col">
			<!-- Header -->
			<div class="flex items-center gap-2 p-3">
				<button
					onclick={onToggleCollapse}
					class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
					title="Collapse sidebar"
				>
					<LayoutSidebar width={18} height={18} />
				</button>
				<h1 class="text-lg font-semibold tracking-tight text-text-primary">rizz chat</h1>
			</div>

			<!-- New Chat Button -->
			<div class="px-3 pb-3">
				<button
					onclick={handleNewChat}
					class="btn-accent flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium"
				>
					<PlusLg width={16} height={16} />
					New Chat
				</button>
			</div>

			<!-- Chat List -->
			<div class="flex-1 overflow-y-auto px-2">
				{#each chatStore.groupedChats as group}
					<div class="mb-3">
						<div
							class="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-accent-500"
						>
							{group.label}
						</div>
						<ul class="space-y-0.5">
							{#each group.chats as chat}
								<li>
									<button
										onclick={() => handleChatClick(chat)}
										class="group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors {selectedChatId ===
										chat.id
											? 'bg-surface-hover text-text-primary'
											: 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'}"
									>
										<ChatLeft width={14} height={14} class="shrink-0 opacity-40" />
										<span class="truncate">{chat.title}</span>
									</button>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>

			<!-- Footer -->
			<div class="border-t border-border-subtle p-3">
				<button
					class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
				>
					<Gear width={16} height={16} />
					Settings
				</button>
			</div>
		</div>
	{/if}
</aside>
