<script lang="ts">
	import type { PageProps } from './$types'
	import { engine } from '$lib/sync'
	import { TransitionAction } from '@rizz-zone/chat-shared'
	import { TransitionImpact } from 'ground0'

	const { data }: PageProps = $props()

	$effect(() => {
		if (data.chatPrefills) {
			engine.transition({
				action: TransitionAction.SeedPrefetchedThreads,
				impact: TransitionImpact.LocalOnly,
				data: {
					threadNames: [...data.chatPrefills.threads]
						.reverse()
						.map((t) => t.name)
				}
			})
		}
	})
</script>

<h1>Welcome to SvelteKit</h1>
<p>
	Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the
	documentation
</p>
