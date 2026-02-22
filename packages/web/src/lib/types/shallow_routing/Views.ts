import type { PrimaryViewCategory } from './PrimaryViewCategory'
import type { SecondaryViewCategory } from './SecondaryViewCategory'
import type { ViewID } from './ViewID'

export type Views = {
	primary: ViewID<PrimaryViewCategory, never>
	secondary?: ViewID<SecondaryViewCategory, never>
}
