import type { UUID } from '@rizz-zone/chat-shared/types'
import type { SettingsPage } from './pages/SettingsPage'
import type { PrimaryViewCategory } from './PrimaryViewCategory'
import type { SecondaryViewCategory } from './SecondaryViewCategory'
import type { ViewCategory } from './ViewCategory'

type EffectiveCategory<
	CategoryEnum extends ViewCategory,
	SelectedCategory extends CategoryEnum
> = [SelectedCategory] extends [never] ? CategoryEnum : SelectedCategory

export type ViewID<
	CategoryEnum extends ViewCategory,
	SelectedCategory extends CategoryEnum
> = {
	category: CategoryEnum
	page: CategoryEnum extends SecondaryViewCategory
		? EffectiveCategory<
				CategoryEnum,
				SelectedCategory
			> extends SecondaryViewCategory.Settings
			? SettingsPage
			: string
		: CategoryEnum extends PrimaryViewCategory
			? EffectiveCategory<
					CategoryEnum,
					SelectedCategory
				> extends PrimaryViewCategory.Chat
				? UUID | undefined
				: string
			: never
}
