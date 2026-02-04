import {
	createTransitionSchema,
	TransitionImpact,
	UpdateImpact,
	type Update
} from 'ground0'
import { discriminatedUnion, literal, object, string, type z } from 'zod/mini'

export enum TransitionAction {
	SendMessage
}
export enum UpdateAction {
	InitLatestThreads
}

// AppTransition
export const sourceSchema = discriminatedUnion('action', [
	object({
		action: literal(TransitionAction.SendMessage),
		impact: literal(TransitionImpact.OptimisticPush),
		data: object({ message: string() })
	})
])
export type AppTransition = z.infer<typeof sourceSchema>
// Without this sort of redundant type annotation, tsdown complains that it
// would need to refer to a specific node_modules path for inference
export const appTransitionSchema: ReturnType<
	typeof createTransitionSchema<AppTransition>
> = createTransitionSchema(sourceSchema)

// AppUpdate (none exist yet)
export type AppUpdate = Update & {
	action: UpdateAction.InitLatestThreads
	impact: UpdateImpact.Unreliable
}
