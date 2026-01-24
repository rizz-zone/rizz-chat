import { WorkerEntrypoint } from 'cloudflare:workers'

export default class DOBackend extends WorkerEntrypoint {
	public override fetch() {
		return new Response('secret string...')
	}
	public rpcTest() {
		return 'secret string2...'
	}
}
