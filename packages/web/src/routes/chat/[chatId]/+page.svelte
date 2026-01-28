<script lang="ts">
	import type { PageProps } from './$types'
	import { engine as engine } from '$lib/sync'
	import { TransitionAction } from '@rizz-zone/chat-shared'
	import { TransitionImpact } from 'ground0'

	let { data: _data }: PageProps = $props()

	const successfullySentMessages = engine.path('successfulySentMessages')
</script>

<p>So far, {$successfullySentMessages} messages have been sent successfully.</p>
<button
	onclick={() =>
		engine.transition({
			action: TransitionAction.SendMessage,
			impact: TransitionImpact.OptimisticPush,
			data: { message: 'Hello, world!' }
		})}>Send Message</button
>
