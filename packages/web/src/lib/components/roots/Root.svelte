<script lang="ts">
	import { page } from '$app/state'
	import type { Prefills } from '$lib/types/Prefills'
	import type { Views } from '$lib/types/shallow_routing/Views'
	import PrimaryRoot from './PrimaryRoot.svelte'

	const {
		prefills,
		initialViews
	}: {
		prefills: Prefills
		initialViews: Views
	} = $props()

	const view = $derived({
		...initialViews,
		...('view' in page.state && typeof page.state.views !== 'undefined'
			? page.state.views
			: {})
	})
</script>

<PrimaryRoot {prefills} page={view.primary.page} />

<!-- TODO: Secondary views -->
