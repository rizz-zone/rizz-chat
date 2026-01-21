<script lang="ts">
	import type { Chat } from '$lib/stores/chat.svelte';
	import MessageInput from '$lib/components/MessageInput.svelte';

	interface Props {
		chat: Chat | null;
		onSendMessage?: (content: string) => void;
	}

	let { chat, onSendMessage }: Props = $props();

	let messagesContainer: HTMLDivElement | undefined = $state();

	function scrollToBottom() {
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}

	$effect(() => {
		if (chat?.messages) {
			// Small delay to ensure DOM is updated
			setTimeout(scrollToBottom, 0);
		}
	});
</script>

<div class="relative flex h-full flex-col bg-surface-chat">
	{#if chat}
		<!-- Messages Area -->
		<div bind:this={messagesContainer} class="flex-1 overflow-y-auto pb-40">
			<div class="mx-auto max-w-3xl px-4 py-8">
				{#each chat.messages as message (message.id)}
					<div class="mb-6">
						{#if message.role === 'user'}
							<!-- User Message -->
							<div class="flex justify-end">
								<div
									class="max-w-[85%] rounded-2xl rounded-br-md bg-surface-elevated px-4 py-3 text-text-primary"
								>
									<p class="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
								</div>
							</div>
						{:else}
							<!-- Assistant Message -->
							<div class="flex justify-start">
								<div class="max-w-[85%] py-2">
									<p class="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
										{message.content}
									</p>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Floating Input Area -->
		<div class="absolute inset-x-0 bottom-0 px-4 pb-6 pt-4">
			<div
				class="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-surface-chat to-transparent"
			></div>
			<div class="relative mx-auto max-w-3xl">
				<MessageInput {onSendMessage} />
			</div>
		</div>
	{:else}
		<!-- Empty State -->
		<div class="flex flex-1 flex-col items-center justify-center px-4">
			<div class="mb-8 text-center">
				<h2 class="mb-2 text-2xl font-semibold tracking-tight text-text-primary">rizz chat</h2>
				<p class="text-text-secondary">Start a new conversation</p>
			</div>
			<div class="w-full max-w-2xl">
				<MessageInput {onSendMessage} />
			</div>
		</div>
	{/if}
</div>
