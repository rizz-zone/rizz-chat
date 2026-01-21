<script lang="ts">
	import ChatView from '$lib/components/root/ChatView.svelte';
	import { chatStore } from '$lib/stores/chat.svelte';
	import { page } from '$app/state';

	const chatId = $derived(page.params.chatId);
	const chat = $derived(chatStore.chats.find((c) => c.id === chatId) ?? null);

	function handleSendMessage(content: string) {
		if (!chatId) return;

		chatStore.addMessage(chatId, content, 'user');

		// Simulate assistant response
		setTimeout(() => {
			chatStore.addMessage(
				chatId,
				"Thanks for your message! This is a demo response. In a real implementation, this would connect to an AI backend.",
				'assistant'
			);
		}, 500);
	}
</script>

<ChatView {chat} onSendMessage={handleSendMessage} />
