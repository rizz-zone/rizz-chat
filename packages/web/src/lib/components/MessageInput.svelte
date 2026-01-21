<script lang="ts">
	import ArrowUp from 'svelte-bootstrap-icons/lib/ArrowUp.svelte';
	import ChevronDown from 'svelte-bootstrap-icons/lib/ChevronDown.svelte';

	interface Props {
		onSendMessage?: (content: string) => void;
		placeholder?: string;
	}

	let { onSendMessage, placeholder = 'Type your message here...' }: Props = $props();

	let message = $state('');
	let textareaEl: HTMLTextAreaElement | undefined = $state();

	function adjustHeight() {
		if (textareaEl) {
			textareaEl.style.height = 'auto';
			textareaEl.style.height = Math.min(textareaEl.scrollHeight, 200) + 'px';
		}
	}

	function handleSubmit() {
		const trimmed = message.trim();
		if (trimmed && onSendMessage) {
			onSendMessage(trimmed);
			message = '';
			if (textareaEl) {
				textareaEl.style.height = 'auto';
			}
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	}
</script>

<div class="input-floating p-3">
	<!-- Textarea Row -->
	<div class="flex items-end gap-3">
		<textarea
			bind:this={textareaEl}
			bind:value={message}
			oninput={adjustHeight}
			onkeydown={handleKeydown}
			{placeholder}
			rows="1"
			class="max-h-[200px] min-h-[44px] flex-1 resize-none border-0 bg-transparent py-2.5 text-sm leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-0"
		></textarea>

		<button
			onclick={handleSubmit}
			disabled={!message.trim()}
			class="btn-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
		>
			<ArrowUp width={18} height={18} />
		</button>
	</div>

	<!-- Bottom Row: Model picker left, Plan right -->
	<div class="mt-3 flex items-center justify-between border-t border-border-subtle pt-3">
		<!-- Model Picker -->
		<button
			class="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
		>
			<span class="font-medium">Llama 4 Scout</span>
			<ChevronDown width={12} height={12} />
		</button>

		<!-- User Plan -->
		<span class="text-xs text-text-muted">Free</span>
	</div>
</div>
