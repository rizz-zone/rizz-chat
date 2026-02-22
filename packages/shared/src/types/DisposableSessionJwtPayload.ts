import { ms } from 'ms'
import { number, object, refine, uuidv7, type z } from 'zod/mini'

export const DisposableSessionJwtPayloadSchema = object({
	iat: number().check(refine((num) => num < (Date.now() + ms('28d')) / 1000)),
	sessionId: uuidv7()
})

export type DisposableSessionJwtPayload = z.infer<
	typeof DisposableSessionJwtPayloadSchema
>

export const isDisposableSessionJwtPayload = (
	value: unknown
): value is DisposableSessionJwtPayload =>
	DisposableSessionJwtPayloadSchema.safeParse(value).success
