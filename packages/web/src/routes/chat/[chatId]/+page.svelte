<script lang="ts">
	import type { PageProps } from './$types'
	import { engine as engine } from '$lib/sync'
	import { TransitionAction } from '@rizz-zone/chat-shared'
	import { TransitionImpact } from 'ground0'
	import { authClient } from '$lib/auth_client'

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
<button onclick={() => authClient.signIn.social({ provider: 'google' })}
	>Sign in with Google</button
>
<button onclick={() => authClient.signIn.social({ provider: 'discord' })}
	>Sign in with Discord</button
>
<button onclick={() => authClient.signIn.social({ provider: 'twitter' })}
	>Sign in with X</button
>
