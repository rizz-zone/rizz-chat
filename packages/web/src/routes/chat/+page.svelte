<script lang="ts">
	import ChatView from '$lib/components/root/ChatView.svelte';
	import { chatStore } from '$lib/stores/chat.svelte';
	import { goto } from '$app/navigation';

	function handleSendMessage(content: string) {
		// Create a new chat if none selected
		const chat = chatStore.createChat();
		chatStore.addMessage(chat.id, content, 'user');
		// Simulate assistant response
		setTimeout(() => {
			chatStore.addMessage(
				chat.id,
				"Thanks for your message! This is a demo response. In a real implementation, this would connect to an AI backend.",
				'assistant'
			);
		}, 500);
		goto(`/chat/${chat.id}`);
	}
</script>

<ChatView chat={null} onSendMessage={handleSendMessage} />
