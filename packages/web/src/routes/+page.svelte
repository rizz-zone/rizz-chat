<script lang="ts">
	import type { PageProps } from './$types'
	import { engine } from '$lib/sync'
	import { TransitionAction } from '@rizz-zone/chat-shared'
	import { TransitionImpact } from 'ground0'
	import Root from '$lib/components/roots/Root.svelte'
	import { PrimaryViewCategory } from '$lib/types/shallow_routing/PrimaryViewCategory'

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

<Root
	prefills={data.chatPrefills}
	initialViews={{ primary: { category: PrimaryViewCategory.Chat, page: undefined } }}
/>
