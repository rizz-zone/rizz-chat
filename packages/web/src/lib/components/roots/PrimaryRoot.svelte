<script lang="ts">
	import type { Prefills } from '$lib/types/Prefills'
	import type { PrimaryViewCategory } from '$lib/types/shallow_routing/PrimaryViewCategory'
	import type { ViewID } from '$lib/types/shallow_routing/ViewID'
	import Sidebar from '../layout/Sidebar.svelte'

	const {
		prefills,
		page
	}: {
		prefills: Prefills
		page: ViewID<PrimaryViewCategory, PrimaryViewCategory.Chat>['page']
	} = $props()
</script>

<Sidebar />
