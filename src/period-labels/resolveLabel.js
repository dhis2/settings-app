// PROTOTYPE. `kind` picks the namespace: 'periodTypes' keys on a period type
// name (WeeklySunday), 'relativePeriods' on a relative period id (LAST_WEEK).
// The two do not share ids.
import { getLabelStoreState } from './labelStore.js'

export const getCustomLabel = (kind, id, languageKey = 'default') =>
    getLabelStoreState()?.[kind]?.[id]?.[languageKey] || ''

// Only takes the 'default' (non-localized) label — none of this prototype's
// call sites need a per-language variant here, and a 4th languageKey param
// would trip the max-params lint rule.
export const resolveLabel = (kind, id, builtIn) => {
    const custom = getCustomLabel(kind, id)
    return custom ? `${builtIn} (${custom})` : builtIn
}
