# Custom analytics period labels — prototype implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build sections 2 and 3 of the period labels design — custom period type names and relative period labels, both with translations — as a throwaway prototype for exploring the UI.

**Architecture:** Everything new lives in `src/period-labels/`, a directory that can be deleted in one command. State is held in a `d2-ui` Store backed by `localStorage`, matching the app's existing store idiom, so no backend endpoint is needed. The one piece that is *not* throwaway is extracting built-in period name formatting out of `PeriodTypes.component.jsx`, which lands in `src/period-types/` and survives deletion of the prototype.

**Tech Stack:** React (function components + hooks), `@dhis2/ui`, `@dhis2/d2-i18n`, `d2-ui` Store, CSS modules.

---

## Prototype ground rules

This deviates from the usual TDD workflow, deliberately, because this is a throwaway prototype for exploring UI ideas.

- **No unit tests.** Each task ends with running the app and looking at it. If any of this is kept, tests get written then.
- **Persistence is `localStorage`, not an API.** The real endpoints are unknown (open dependency 1 in the spec) and would change nothing about the UI questions being explored. All persistence sits behind `labelStore.js`; swapping it for the DHIS2 dataStore or the real endpoints is a change to that one file.
- **No API version gating.** The prototype assumes a recent instance.
- **Commit per task anyway** so individual ideas can be reverted while demoing.

To remove the prototype entirely: `rm -rf src/period-labels` and revert the marked blocks in `settingsKeyMapping.js`, `settingsFields.component.jsx` and `settingsCategories.js`.

## File structure

**Permanent (survives prototype deletion):**

| File | Responsibility |
|---|---|
| `src/period-types/builtInPeriodNames.js` | Built-in display name for a period type. Extracted from `PeriodTypes.component.jsx`; needed by all three sections. The spec calls this `periodLabels.js`; renamed here because it sits in `period-types/` and holds only built-in names, not custom ones. |

**Prototype (deletable):**

| File | Responsibility |
|---|---|
| `src/period-labels/labelStore.js` | All label state and persistence. The only file that knows where labels live. |
| `src/period-labels/relativePeriodSets.js` | Static definition of the two relative period families, their start settings and their relative periods. |
| `src/period-labels/LanguageColumns.jsx` | The label × language table used by both sections. |
| `src/period-labels/LanguageColumns.module.css` | Styles for the above. |
| `src/period-labels/CustomPeriodNames.jsx` | Section 2. |
| `src/period-labels/RelativePeriodSet.jsx` | One family card for section 3. |
| `src/period-labels/RelativePeriodLabels.jsx` | Section 3, renders one card per family. |
| `src/period-labels/PeriodLabels.module.css` | Styles for sections 2 and 3. |

**Modified:**

| File | Change |
|---|---|
| `src/period-types/PeriodTypes.component.jsx` | Import formatting instead of defining it; show custom names as secondary labels. |
| `src/settingsKeyMapping.js` | Two new field types; custom label in the relative period dropdown. |
| `src/settingsFields.component.jsx` | Two new `switch` cases. |
| `src/settingsCategories.js` | Place the new sections; drop the two standalone start settings. |

---

## Task 1: Extract built-in period name formatting

Sections 2 and 3 both need to show the built-in name of a period type. That logic currently lives inside the section 1 component. Move it out unchanged.

**Files:**
- Create: `src/period-types/builtInPeriodNames.js`
- Modify: `src/period-types/PeriodTypes.component.jsx`

- [ ] **Step 1: Create the module and move the code**

Create `src/period-types/builtInPeriodNames.js`. Move these declarations out of `PeriodTypes.component.jsx` **verbatim**, in this order, keeping the `import i18n from '@dhis2/d2-i18n'` at the top:

`monthMap`, `dayMap`, `simpleLabels`, `formatWeeklyPeriod`, `formatPeriodWithMonth`, `formatFinancialPeriod`, `formatSixMonthlyPeriod`, `formatQuarterlyPeriod`, `formatNameBasedPeriod`, `formatDisplayNameFallback`, `formatPeriodDisplayName`.

Then add at the end of the new file:

```js
export { formatPeriodDisplayName }
```

- [ ] **Step 2: Import it back into the section 1 component**

In `src/period-types/PeriodTypes.component.jsx`, delete the moved declarations and add this import alongside the other relative imports:

```js
import { formatPeriodDisplayName } from './builtInPeriodNames.js'
```

`getGroupKey`, `getGroupLabel`, `groupSortOrder`, `periodTypeOrder`, `groupByFrequency` and `mandatoryPeriodTypes` stay where they are — they are section 1's concern, not naming.

- [ ] **Step 3: Verify nothing changed**

Run:

```bash
yarn lint:js && yarn start
```

Open Analytics settings. The period types section must look exactly as it did before this task: `Weekly (start Sunday)`, `Quarterly (start November)`, and separate `Yearly` and `Financial year` groups.

- [ ] **Step 4: Commit**

```bash
git add src/period-types/builtInPeriodNames.js src/period-types/PeriodTypes.component.jsx
git commit -m "refactor: extract built-in period name formatting"
```

---

## Task 2: Label store

**Files:**
- Create: `src/period-labels/labelStore.js`

- [ ] **Step 1: Write the store**

```js
// PROTOTYPE: localStorage-backed label store. Replace this file to move to a
// real endpoint — nothing outside it knows where labels are kept.
import Store from 'd2-ui/lib/store/Store.js'

const STORAGE_KEY = 'settings-app-prototype-period-labels'

const emptyState = {
    // Locale ids the user has added as columns, e.g. ['nb']
    languages: [],
    // { [periodTypeName]: { default: string, [localeId]: string } }
    periodTypes: {},
    // { [relativePeriodId]: { default: string, [localeId]: string } }
    relativePeriods: {},
}

const read = () => {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        return raw ? { ...emptyState, ...JSON.parse(raw) } : emptyState
    } catch (error) {
        console.error('Could not read prototype labels', error)
        return emptyState
    }
}

const labelStore = Store.create()
labelStore.setState(read())

const persist = (state) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
        console.error('Could not persist prototype labels', error)
    }
    labelStore.setState(state)
}

// Empty and whitespace-only are the same thing: no custom label.
const clean = (value) => (value || '').trim()

const setIn = (group, id, languageKey, value) => {
    const state = labelStore.getState()
    const entry = { ...(state[group][id] || {}) }

    if (clean(value)) {
        entry[languageKey] = value
    } else {
        delete entry[languageKey]
    }

    // The entry is kept even when empty. In section 2 an empty entry is what
    // holds a row on screen while the user is still deciding what to type.
    persist({ ...state, [group]: { ...state[group], [id]: entry } })
}

export const setPeriodTypeLabel = (name, languageKey, value) =>
    setIn('periodTypes', name, languageKey, value)

export const setRelativePeriodLabel = (id, languageKey, value) =>
    setIn('relativePeriods', id, languageKey, value)

// Adds an empty row so a period type can be named. Stored as an empty object
// until the user types, which is what keeps section 2 additive.
export const addPeriodType = (name) => {
    const state = labelStore.getState()
    if (state.periodTypes[name]) {
        return
    }
    persist({
        ...state,
        periodTypes: { ...state.periodTypes, [name]: {} },
    })
}

export const removePeriodType = (name) => {
    const state = labelStore.getState()
    const periodTypes = { ...state.periodTypes }
    delete periodTypes[name]
    persist({ ...state, periodTypes })
}

export const addLanguage = (localeId) => {
    const state = labelStore.getState()
    if (state.languages.includes(localeId)) {
        return
    }
    persist({ ...state, languages: [...state.languages, localeId] })
}

export const removeLanguage = (localeId) => {
    const state = labelStore.getState()
    persist({
        ...state,
        languages: state.languages.filter((id) => id !== localeId),
    })
}

export const clearRelativePeriodSet = (relativePeriodIds) => {
    const state = labelStore.getState()
    const relativePeriods = { ...state.relativePeriods }
    relativePeriodIds.forEach((id) => delete relativePeriods[id])
    persist({ ...state, relativePeriods })
}

export default labelStore
```

- [ ] **Step 2: Write the hook in the same file**

Append to `src/period-labels/labelStore.js`:

```js
import { useState, useEffect } from 'react'

export const useLabelState = () => {
    const [state, setState] = useState(() => labelStore.getState())

    useEffect(() => {
        const subscription = labelStore.subscribe((next) => setState(next))
        return () => subscription.unsubscribe()
    }, [])

    return state
}
```

Move the `useState`/`useEffect` import to the top of the file with the others so lint passes.

- [ ] **Step 3: Verify**

```bash
yarn lint:js
```

Expected: no errors for `src/period-labels/labelStore.js`.

- [ ] **Step 4: Commit**

```bash
git add src/period-labels/labelStore.js
git commit -m "feat: prototype label store"
```

---

## Task 3: Relative period set definitions

**Files:**
- Create: `src/period-labels/relativePeriodSets.js`

- [ ] **Step 1: Write the definitions**

```js
import i18n from '@dhis2/d2-i18n'

// The two relative period families that have a start setting seeding them.
// startToPeriodType mirrors the maps in settingsKeyMapping.js; duplicated here
// so the prototype stays self-contained and deletable.
export const RELATIVE_PERIOD_SETS = [
    {
        id: 'weekly',
        label: i18n.t('Weekly'),
        startSetting: 'analyticsWeeklyStart',
        startLabel: i18n.t('Weeks start'),
        startOptions: [
            { value: 'WEEKLY', label: i18n.t('Monday') },
            { value: 'WEEKLY_WEDNESDAY', label: i18n.t('Wednesday') },
            { value: 'WEEKLY_THURSDAY', label: i18n.t('Thursday') },
            { value: 'WEEKLY_FRIDAY', label: i18n.t('Friday') },
            { value: 'WEEKLY_SATURDAY', label: i18n.t('Saturday') },
            { value: 'WEEKLY_SUNDAY', label: i18n.t('Sunday') },
        ],
        startToPeriodType: {
            WEEKLY: 'Weekly',
            WEEKLY_WEDNESDAY: 'WeeklyWednesday',
            WEEKLY_THURSDAY: 'WeeklyThursday',
            WEEKLY_FRIDAY: 'WeeklyFriday',
            WEEKLY_SATURDAY: 'WeeklySaturday',
            WEEKLY_SUNDAY: 'WeeklySunday',
        },
        relativePeriods: [
            { id: 'THIS_WEEK', builtIn: i18n.t('This week') },
            { id: 'LAST_WEEK', builtIn: i18n.t('Last week') },
            { id: 'LAST_4_WEEKS', builtIn: i18n.t('Last 4 weeks') },
            { id: 'LAST_12_WEEKS', builtIn: i18n.t('Last 12 weeks') },
            { id: 'LAST_52_WEEKS', builtIn: i18n.t('Last 52 weeks') },
        ],
    },
    {
        id: 'financialYear',
        label: i18n.t('Financial year'),
        startSetting: 'analyticsFinancialYearStart',
        startLabel: i18n.t('Financial years start'),
        startOptions: [
            { value: 'FINANCIAL_YEAR_FEBRUARY', label: i18n.t('February') },
            { value: 'FINANCIAL_YEAR_APRIL', label: i18n.t('April') },
            { value: 'FINANCIAL_YEAR_JULY', label: i18n.t('July') },
            { value: 'FINANCIAL_YEAR_AUGUST', label: i18n.t('August') },
            { value: 'FINANCIAL_YEAR_SEPTEMBER', label: i18n.t('September') },
            { value: 'FINANCIAL_YEAR_OCTOBER', label: i18n.t('October') },
        ],
        startToPeriodType: {
            FINANCIAL_YEAR_FEBRUARY: 'FinancialFeb',
            FINANCIAL_YEAR_APRIL: 'FinancialApril',
            FINANCIAL_YEAR_JULY: 'FinancialJuly',
            FINANCIAL_YEAR_AUGUST: 'FinancialAug',
            FINANCIAL_YEAR_SEPTEMBER: 'FinancialSep',
            FINANCIAL_YEAR_OCTOBER: 'FinancialOct',
        },
        relativePeriods: [
            { id: 'THIS_FINANCIAL_YEAR', builtIn: i18n.t('This financial year') },
            { id: 'LAST_FINANCIAL_YEAR', builtIn: i18n.t('Last financial year') },
            {
                id: 'LAST_5_FINANCIAL_YEARS',
                builtIn: i18n.t('Last 5 financial years'),
            },
        ],
    },
]

export const ALL_RELATIVE_PERIOD_IDS = RELATIVE_PERIOD_SETS.flatMap((set) =>
    set.relativePeriods.map((period) => period.id)
)
```

- [ ] **Step 2: Verify and commit**

```bash
yarn lint:js && git add src/period-labels/relativePeriodSets.js && git commit -m "feat: relative period set definitions"
```

---

## Task 4: Language columns table

The shared primitive: rows down, languages across, with the built-in name as each input's placeholder so an empty field visibly means "falls back".

**Files:**
- Create: `src/period-labels/LanguageColumns.jsx`
- Create: `src/period-labels/LanguageColumns.module.css`

- [ ] **Step 1: Write the component**

```jsx
import i18n from '@dhis2/d2-i18n'
import { Input, Button, SingleSelect, SingleSelectOption } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import configOptionStore from '../configOptionStore.js'
import styles from './LanguageColumns.module.css'

const DEFAULT_KEY = 'default'

const localeName = (localeId) => {
    const locales = configOptionStore.getState()?.uiLocales || []
    return locales.find((locale) => locale.id === localeId)?.displayName || localeId
}

const LanguageColumns = ({
    rows,
    values,
    languages,
    rowHeader,
    onChange,
    onAddLanguage,
    onRemoveLanguage,
    onRemoveRow,
}) => {
    const [adding, setAdding] = useState(false)
    const available = (configOptionStore.getState()?.uiLocales || []).filter(
        (locale) => !languages.includes(locale.id)
    )

    const columns = [DEFAULT_KEY, ...languages]
    const gridTemplate = `minmax(140px, 1.2fr) repeat(${columns.length}, minmax(120px, 1fr)) 28px`

    return (
        <div className={styles.wrapper}>
            <div className={styles.grid} style={{ gridTemplateColumns: gridTemplate }}>
                <span className={styles.head}>{rowHeader}</span>
                <span className={styles.head}>{i18n.t('Default')}</span>
                {languages.map((localeId) => (
                    <span key={localeId} className={styles.head}>
                        {localeName(localeId)}
                        <button
                            type="button"
                            className={styles.removeLanguage}
                            onClick={() => onRemoveLanguage(localeId)}
                            title={i18n.t('Remove this language')}
                        >
                            ×
                        </button>
                    </span>
                ))}
                <span className={styles.head} />

                {rows.map((row) => (
                    <React.Fragment key={row.id}>
                        <span className={styles.rowLabel}>{row.label}</span>
                        {columns.map((languageKey) => (
                            <Input
                                key={languageKey}
                                dense
                                value={values[row.id]?.[languageKey] || ''}
                                placeholder={row.builtIn}
                                onChange={({ value }) =>
                                    onChange(row.id, languageKey, value)
                                }
                            />
                        ))}
                        <span className={styles.rowAction}>
                            {onRemoveRow && (
                                <button
                                    type="button"
                                    className={styles.removeRow}
                                    onClick={() => onRemoveRow(row.id)}
                                    title={i18n.t('Remove this custom name')}
                                >
                                    ×
                                </button>
                            )}
                        </span>
                    </React.Fragment>
                ))}
            </div>

            <p className={styles.hint}>
                {i18n.t(
                    'An empty field falls back to the built-in name shown in grey.'
                )}
            </p>

            {adding ? (
                <div className={styles.addLanguage}>
                    <SingleSelect
                        dense
                        placeholder={i18n.t('Choose a language')}
                        onChange={({ selected }) => {
                            onAddLanguage(selected)
                            setAdding(false)
                        }}
                    >
                        {available.map((locale) => (
                            <SingleSelectOption
                                key={locale.id}
                                value={locale.id}
                                label={locale.displayName}
                            />
                        ))}
                    </SingleSelect>
                    <Button small secondary onClick={() => setAdding(false)}>
                        {i18n.t('Cancel')}
                    </Button>
                </div>
            ) : (
                <Button small secondary onClick={() => setAdding(true)}>
                    {i18n.t('Add a language')}
                </Button>
            )}
        </div>
    )
}

LanguageColumns.propTypes = {
    languages: PropTypes.arrayOf(PropTypes.string).isRequired,
    rowHeader: PropTypes.string.isRequired,
    rows: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            builtIn: PropTypes.string,
        })
    ).isRequired,
    values: PropTypes.object.isRequired,
    onAddLanguage: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onRemoveLanguage: PropTypes.func.isRequired,
    onRemoveRow: PropTypes.func,
}

export default LanguageColumns
```

- [ ] **Step 2: Write the styles**

```css
.wrapper {
    width: 100%;
}

.grid {
    display: grid;
    gap: 6px 10px;
    align-items: center;
}

.head {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--colors-grey700);
    display: flex;
    align-items: center;
    gap: 4px;
}

.rowLabel {
    font-size: 13px;
    color: var(--colors-grey900);
    min-width: 0;
}

.rowAction {
    display: flex;
    justify-content: center;
}

.removeRow,
.removeLanguage {
    border: none;
    background: none;
    cursor: pointer;
    color: var(--colors-grey600);
    font-size: 14px;
    line-height: 1;
    padding: 2px 4px;
}

.removeRow:hover,
.removeLanguage:hover {
    color: var(--colors-grey900);
}

.hint {
    font-size: 12px;
    color: var(--colors-grey600);
    margin: 10px 0 8px;
}

.addLanguage {
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: 340px;
}
```

- [ ] **Step 3: Verify and commit**

```bash
yarn lint:js && git add src/period-labels/LanguageColumns.jsx src/period-labels/LanguageColumns.module.css && git commit -m "feat: language columns table"
```

---

## Task 5: Section 2 — custom period names

**Files:**
- Create: `src/period-labels/CustomPeriodNames.jsx`
- Create: `src/period-labels/PeriodLabels.module.css`
- Modify: `src/settingsKeyMapping.js`
- Modify: `src/settingsFields.component.jsx`
- Modify: `src/settingsCategories.js`

- [ ] **Step 1: Write the section 2 component**

```jsx
import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Button, SingleSelect, SingleSelectOption } from '@dhis2/ui'
import React, { useState, useEffect } from 'react'
import configOptionStore from '../configOptionStore.js'
import { formatPeriodDisplayName } from '../period-types/builtInPeriodNames.js'
import LanguageColumns from './LanguageColumns.jsx'
import styles from './PeriodLabels.module.css'
import {
    useLabelState,
    setPeriodTypeLabel,
    addPeriodType,
    removePeriodType,
    addLanguage,
    removeLanguage,
} from './labelStore.js'

const query = {
    periodTypes: {
        resource: 'periodTypes',
        params: { fields: 'name,displayName' },
    },
}

const names = (list) =>
    (list || []).map((entry) => (typeof entry === 'string' ? entry : entry.name))

const CustomPeriodNames = () => {
    const { data } = useDataQuery(query)
    const labels = useLabelState()
    const [adding, setAdding] = useState(false)
    // Section 1 writes the enabled set here as the user ticks boxes, so this
    // list stays in step without a reload.
    const [enabled, setEnabled] = useState(() =>
        names(configOptionStore.getState()?.dataOutputPeriodTypes)
    )

    useEffect(() => {
        const subscription = configOptionStore.subscribe((state) =>
            setEnabled(names(state?.dataOutputPeriodTypes))
        )
        return () => subscription.unsubscribe()
    }, [])

    const allPeriodTypes = data?.periodTypes?.periodTypes || []
    const displayName = (name) => {
        const periodType = allPeriodTypes.find((entry) => entry.name === name)
        return formatPeriodDisplayName(periodType?.displayName, name)
    }

    const namedTypes = Object.keys(labels.periodTypes)
    const addable = enabled.filter((name) => !namedTypes.includes(name))

    const rows = namedTypes.map((name) => ({
        id: name,
        label: displayName(name),
        builtIn: displayName(name),
    }))

    return (
        <div className={styles.section}>
            <p className={styles.sectionLabel}>{i18n.t('Custom period names')}</p>
            <p className={styles.sectionHelp}>
                {i18n.t(
                    'Give a period type a different name in analytics apps. Only the period types you name appear here.'
                )}
            </p>

            {rows.length === 0 ? (
                <p className={styles.empty}>
                    {i18n.t(
                        'No custom names. Period types use their built-in names.'
                    )}
                </p>
            ) : (
                <LanguageColumns
                    rowHeader={i18n.t('Period type')}
                    rows={rows}
                    values={labels.periodTypes}
                    languages={labels.languages}
                    onChange={setPeriodTypeLabel}
                    onAddLanguage={addLanguage}
                    onRemoveLanguage={removeLanguage}
                    onRemoveRow={removePeriodType}
                />
            )}

            {adding ? (
                <div className={styles.addRow}>
                    <SingleSelect
                        dense
                        placeholder={i18n.t('Choose a period type')}
                        onChange={({ selected }) => {
                            addPeriodType(selected)
                            setAdding(false)
                        }}
                    >
                        {addable.map((name) => (
                            <SingleSelectOption
                                key={name}
                                value={name}
                                label={displayName(name)}
                            />
                        ))}
                    </SingleSelect>
                    <Button small secondary onClick={() => setAdding(false)}>
                        {i18n.t('Cancel')}
                    </Button>
                </div>
            ) : (
                <div className={styles.addRow}>
                    <Button
                        small
                        onClick={() => setAdding(true)}
                        disabled={addable.length === 0}
                    >
                        {i18n.t('Add a custom name')}
                    </Button>
                </div>
            )}
        </div>
    )
}

export default CustomPeriodNames
```

- [ ] **Step 2: Write the shared section styles**

Create `src/period-labels/PeriodLabels.module.css`:

```css
.section {
    width: 100%;
    padding: 8px 0 16px;
}

.sectionLabel {
    font-size: 15px;
    color: var(--colors-grey900);
    margin: 0 0 2px;
}

.sectionHelp {
    font-size: 12px;
    color: var(--colors-grey600);
    margin: 0 0 12px;
}

.empty {
    font-size: 13px;
    color: var(--colors-grey600);
    font-style: italic;
    margin: 0 0 12px;
}

.addRow {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    max-width: 340px;
}

.card {
    border: 1px solid var(--colors-grey300);
    border-radius: 4px;
    padding: 12px 14px;
    margin-bottom: 12px;
}

.cardHeader {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
}

.cardTitle {
    font-size: 14px;
    color: var(--colors-grey900);
}

.cardMeta {
    font-size: 12px;
    color: var(--colors-grey600);
}

.customName {
    font-size: 12px;
    background: var(--colors-blue050);
    color: var(--colors-blue800);
    border-radius: 3px;
    padding: 2px 7px;
}

.startSelect {
    max-width: 180px;
}

.warning {
    margin-top: 12px;
}
```

- [ ] **Step 3: Register the field type**

In `src/settingsKeyMapping.js`, add this entry next to `dataOutputPeriodTypes`:

```js
    customPeriodNames: {
        type: 'customPeriodNames',
        searchLabels: [
            i18n.t('Custom period names'),
            i18n.t('Period labels'),
        ],
    },
```

- [ ] **Step 4: Render it**

In `src/settingsFields.component.jsx`, add the import alongside the other component imports:

```js
import CustomPeriodNames from './period-labels/CustomPeriodNames.jsx'
```

and add this case immediately after the existing `case 'periodTypes':` block:

```js
            case 'customPeriodNames':
                return {
                    ...fieldBase,
                    component: CustomPeriodNames,
                }
```

- [ ] **Step 5: Place it on the page**

In `src/settingsCategories.js`, in the `analytics` category, insert directly after the `dataOutputPeriodTypes` entry:

```js
            {
                setting: 'customPeriodNames',
                minimumApiVersion: 43,
            },
```

- [ ] **Step 6: Verify in the browser**

```bash
yarn start
```

On Analytics settings, below the period types grid:

1. The section shows the empty state.
2. **Add a custom name** offers only enabled period types. Pick `Weekly (start Sunday)`, type `EPI week`. Reload the page — it is still there.
3. **Add a language**, choose one, type a translation, reload — still there.
4. Untick a period type in section 1; it disappears from the **Add a custom name** list without a reload.
5. Remove the row with `×`; the section returns to its empty state.

- [ ] **Step 7: Commit**

```bash
git add src/period-labels src/settingsKeyMapping.js src/settingsFields.component.jsx src/settingsCategories.js
git commit -m "feat: custom period names section"
```

---

## Task 6: Section 3 — relative period labels

**Files:**
- Create: `src/period-labels/RelativePeriodSet.jsx`
- Create: `src/period-labels/RelativePeriodLabels.jsx`
- Modify: `src/settingsKeyMapping.js`
- Modify: `src/settingsFields.component.jsx`
- Modify: `src/settingsCategories.js`

- [ ] **Step 1: Write the family card**

```jsx
import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { SingleSelect, SingleSelectOption } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { formatPeriodDisplayName } from '../period-types/builtInPeriodNames.js'
import LanguageColumns from './LanguageColumns.jsx'
import styles from './PeriodLabels.module.css'
import {
    useLabelState,
    setRelativePeriodLabel,
    addLanguage,
    removeLanguage,
} from './labelStore.js'
import settingsActions from '../settingsActions.js'
import settingsStore from '../settingsStore.js'

const query = {
    periodTypes: {
        resource: 'periodTypes',
        params: { fields: 'name,displayName' },
    },
}

const RelativePeriodSet = ({ set }) => {
    const { data } = useDataQuery(query)
    const labels = useLabelState()

    const startValue = settingsStore.state?.[set.startSetting] || ''
    const periodTypeName = set.startToPeriodType[startValue]
    const allPeriodTypes = data?.periodTypes?.periodTypes || []
    const periodType = allPeriodTypes.find(
        (entry) => entry.name === periodTypeName
    )
    const builtInName = formatPeriodDisplayName(
        periodType?.displayName,
        periodTypeName
    )
    const customName = labels.periodTypes[periodTypeName]?.default

    const handleStartChange = ({ selected }) => {
        settingsActions.saveKey(set.startSetting, selected)
    }

    const rows = set.relativePeriods.map((period) => ({
        id: period.id,
        label: period.builtIn,
        builtIn: period.builtIn,
    }))

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>{set.label}</span>
                <span className={styles.cardMeta}>{set.startLabel}</span>
                <div className={styles.startSelect}>
                    <SingleSelect
                        dense
                        selected={startValue}
                        onChange={handleStartChange}
                    >
                        {set.startOptions.map((option) => (
                            <SingleSelectOption
                                key={option.value}
                                value={option.value}
                                label={option.label}
                            />
                        ))}
                    </SingleSelect>
                </div>
                <span className={styles.cardMeta}>
                    {periodTypeName ? builtInName : i18n.t('Not set')}
                </span>
                {customName && (
                    <span className={styles.customName}>{customName}</span>
                )}
            </div>

            <LanguageColumns
                rowHeader={i18n.t('Relative period')}
                rows={rows}
                values={labels.relativePeriods}
                languages={labels.languages}
                onChange={setRelativePeriodLabel}
                onAddLanguage={addLanguage}
                onRemoveLanguage={removeLanguage}
            />
        </div>
    )
}

RelativePeriodSet.propTypes = {
    set: PropTypes.object.isRequired,
}

export default RelativePeriodSet
```

- [ ] **Step 2: Write the section wrapper**

```jsx
import i18n from '@dhis2/d2-i18n'
import React from 'react'
import styles from './PeriodLabels.module.css'
import RelativePeriodSet from './RelativePeriodSet.jsx'
import { RELATIVE_PERIOD_SETS } from './relativePeriodSets.js'

const RelativePeriodLabels = () => (
    <div className={styles.section}>
        <p className={styles.sectionLabel}>{i18n.t('Relative periods')}</p>
        <p className={styles.sectionHelp}>
            {i18n.t(
                'Choose which period each relative set is based on, and what those relative periods are called.'
            )}
        </p>
        {RELATIVE_PERIOD_SETS.map((set) => (
            <RelativePeriodSet key={set.id} set={set} />
        ))}
    </div>
)

export default RelativePeriodLabels
```

- [ ] **Step 3: Register and render the field type**

In `src/settingsKeyMapping.js`, next to `customPeriodNames`:

```js
    relativePeriodLabels: {
        type: 'relativePeriodLabels',
        searchLabels: [
            i18n.t('Relative periods'),
            i18n.t('Relative period labels'),
            i18n.t('Weekly relative period start day'),
            i18n.t('Financial year relative period start month'),
        ],
    },
```

In `src/settingsFields.component.jsx`, add the import:

```js
import RelativePeriodLabels from './period-labels/RelativePeriodLabels.jsx'
```

and the case after `customPeriodNames`:

```js
            case 'relativePeriodLabels':
                return {
                    ...fieldBase,
                    component: RelativePeriodLabels,
                }
```

- [ ] **Step 4: Replace the standalone start settings**

In `src/settingsCategories.js`, in the `analytics` category, **delete** these two entries:

```js
            {
                setting: 'analyticsWeeklyStart',
                minimumApiVersion: 43,
            },
            {
                setting: 'analyticsFinancialYearStart',
            },
```

and in their place put:

```js
            {
                setting: 'relativePeriodLabels',
                minimumApiVersion: 43,
            },
```

Leave the `analyticsWeeklyStart` and `analyticsFinancialYearStart` definitions in `settingsKeyMapping.js` — `settingsActions.saveKey` reads them to know how to save.

- [ ] **Step 5: Verify in the browser**

```bash
yarn start
```

1. The two standalone start dropdowns are gone; two cards appear instead.
2. Each card header shows the current start value, the built-in period type name, and — for `Weekly (start Sunday)` if you named it in task 5 — an `EPI week` chip.
3. Changing the weekly start dropdown saves (snackbar appears) and the header's period type name updates.
4. Type `Last EPI week` against `Last week`, reload, and it is still there.

- [ ] **Step 6: Commit**

```bash
git add src/period-labels src/settingsKeyMapping.js src/settingsFields.component.jsx src/settingsCategories.js
git commit -m "feat: relative period labels section"
```

---

## Task 7: Drift warning

Fires when the start setting changes while custom relative labels exist for that family, naming the variant being left behind.

**Files:**
- Modify: `src/period-labels/RelativePeriodSet.jsx`

- [ ] **Step 1: Add the warning state and handler**

In `src/period-labels/RelativePeriodSet.jsx`, extend the imports:

```jsx
import { SingleSelect, SingleSelectOption, NoticeBox, Button } from '@dhis2/ui'
import React, { useState } from 'react'
```

and add `clearRelativePeriodSet` to the `labelStore.js` import list.

Replace `handleStartChange` with:

```jsx
    const [driftedFrom, setDriftedFrom] = useState(null)

    const hasCustomLabels = set.relativePeriods.some(
        (period) =>
            Object.keys(labels.relativePeriods[period.id] || {}).length > 0
    )

    const handleStartChange = ({ selected }) => {
        if (hasCustomLabels && selected !== startValue) {
            setDriftedFrom(builtInName)
        }
        settingsActions.saveKey(set.startSetting, selected)
    }

    const handleClearAll = () => {
        clearRelativePeriodSet(set.relativePeriods.map((period) => period.id))
        setDriftedFrom(null)
    }
```

`builtInName` must be computed before `handleStartChange`, which it already is.

- [ ] **Step 2: Render the notice**

Immediately after the `<LanguageColumns .../>` element, inside the card:

```jsx
            {driftedFrom && (
                <div className={styles.warning}>
                    <NoticeBox warning title={i18n.t('Labels may no longer fit')}>
                        <p>
                            {i18n.t(
                                'These labels were written for {{previous}}. Review them, or clear them so the built-in names are used.',
                                { previous: driftedFrom }
                            )}
                        </p>
                        <Button small onClick={handleClearAll}>
                            {i18n.t('Clear all')}
                        </Button>
                        <Button
                            small
                            secondary
                            onClick={() => setDriftedFrom(null)}
                        >
                            {i18n.t('Keep them')}
                        </Button>
                    </NoticeBox>
                </div>
            )}
```

- [ ] **Step 3: Verify in the browser**

```bash
yarn start
```

1. With no custom relative labels, changing the weekly start day shows **no** warning.
2. Type `Last EPI week` against `Last week`, then change the start day from Sunday to Friday. The warning appears and names `Weekly (start Sunday)`.
3. **Clear all** empties every weekly relative field and dismisses the warning.
4. **Keep them** dismisses the warning and leaves the fields alone.
5. Reload after step 2 — no warning on load, and the header still contradicts the fields. That is the adjacency mechanism doing the remaining work, as designed.

- [ ] **Step 4: Commit**

```bash
git add src/period-labels/RelativePeriodSet.jsx
git commit -m "feat: relative period drift warning"
```

---

## Task 8: Show custom labels elsewhere in the settings app

The spec's rule: the settings app shows built-in names first, custom labels alongside.

**Files:**
- Create: `src/period-labels/resolveLabel.js`
- Modify: `src/period-types/PeriodTypes.component.jsx`
- Modify: `src/period-types/PeriodTypes.module.css`
- Modify: `src/settingsKeyMapping.js`

- [ ] **Step 1: Write the resolver**

```js
// PROTOTYPE. `kind` picks the namespace: 'periodTypes' keys on a period type
// name (WeeklySunday), 'relativePeriods' on a relative period id (LAST_WEEK).
// The two do not share ids.
import labelStore from './labelStore.js'

export const getCustomLabel = (kind, id, languageKey = 'default') =>
    labelStore.getState()?.[kind]?.[id]?.[languageKey] || ''

export const resolveLabel = (kind, id, builtIn, languageKey = 'default') => {
    const custom = getCustomLabel(kind, id, languageKey)
    return custom ? `${builtIn} (${custom})` : builtIn
}
```

- [ ] **Step 2: Show custom names in the section 1 grid**

In `src/period-types/PeriodTypes.component.jsx`, add:

```js
import { getCustomLabel } from '../period-labels/resolveLabel.js'
```

Inside the `group.periodTypes.map` callback, after `const isMandatory = ...`, add:

```js
                                const customName = getCustomLabel(
                                    'periodTypes',
                                    periodType.name
                                )
```

and replace the `<Checkbox ... />` element's closing so it is followed by the custom name. That is, change:

```jsx
                                        <Checkbox
```

…through the end of that element, to be wrapped as:

```jsx
                                        <Checkbox
                                            checked={isEnabled}
                                            disabled={updating || isMandatory}
                                            label={formatPeriodDisplayName(
                                                periodType.displayName,
                                                periodType.name
                                            )}
                                            onChange={() =>
                                                handlePeriodTypeToggle(
                                                    periodType.name,
                                                    isEnabled
                                                )
                                            }
                                        />
                                        {customName && (
                                            <span
                                                className={styles.customName}
                                            >
                                                {customName}
                                            </span>
                                        )}
```

- [ ] **Step 3: Style it**

Append to `src/period-types/PeriodTypes.module.css`:

```css
.customName {
    font-size: 12px;
    background: var(--colors-blue050);
    color: var(--colors-blue800);
    border-radius: 3px;
    padding: 1px 6px;
    margin-left: 6px;
    white-space: nowrap;
}
```

- [ ] **Step 4: Show custom labels in the default relative period dropdown**

In `src/settingsKeyMapping.js`, add near the top with the other imports:

```js
import { resolveLabel } from './period-labels/resolveLabel.js'
```

Then change `keyAnalysisRelativePeriod`'s `options` from a plain object to a function, keeping every existing entry and wrapping the eight that can carry a custom label. Replace these eight lines:

```js
            THIS_WEEK: i18n.t('This week'),
            LAST_WEEK: i18n.t('Last week'),
            LAST_4_WEEKS: i18n.t('Last 4 weeks'),
            LAST_12_WEEKS: i18n.t('Last 12 weeks'),
            LAST_52_WEEKS: i18n.t('Last 52 weeks'),
```

and

```js
            THIS_FINANCIAL_YEAR: i18n.t('This financial year'),
            LAST_FINANCIAL_YEAR: i18n.t('Last financial year'),
            LAST_5_FINANCIAL_YEARS: i18n.t('Last 5 financial years'),
```

with, respectively:

```js
            THIS_WEEK: resolveLabel('relativePeriods', 'THIS_WEEK', i18n.t('This week')),
            LAST_WEEK: resolveLabel('relativePeriods', 'LAST_WEEK', i18n.t('Last week')),
            LAST_4_WEEKS: resolveLabel('relativePeriods', 'LAST_4_WEEKS', i18n.t('Last 4 weeks')),
            LAST_12_WEEKS: resolveLabel('relativePeriods', 'LAST_12_WEEKS', i18n.t('Last 12 weeks')),
            LAST_52_WEEKS: resolveLabel('relativePeriods', 'LAST_52_WEEKS', i18n.t('Last 52 weeks')),
```

and

```js
            THIS_FINANCIAL_YEAR: resolveLabel('relativePeriods', 'THIS_FINANCIAL_YEAR', i18n.t('This financial year')),
            LAST_FINANCIAL_YEAR: resolveLabel('relativePeriods', 'LAST_FINANCIAL_YEAR', i18n.t('Last financial year')),
            LAST_5_FINANCIAL_YEARS: resolveLabel('relativePeriods', 'LAST_5_FINANCIAL_YEARS', i18n.t('Last 5 financial years')),
```

Note the prototype limitation: this object is evaluated at module load, so the dropdown picks up new labels on reload rather than immediately. That is acceptable for exploring the idea; production would resolve at render time.

- [ ] **Step 5: Verify in the browser**

```bash
yarn lint:js && yarn start
```

1. Name `Weekly (start Sunday)` as `EPI week` in section 2. The section 1 grid row shows an `EPI week` chip next to the checkbox.
2. Type `Last EPI week` against `Last week` in section 3, reload, and open **Default relative period for analysis** — the option reads `Last week (Last EPI week)`.
3. Clear the label, reload, and the option reads `Last week` again.

- [ ] **Step 6: Commit**

```bash
git add src/period-labels/resolveLabel.js src/period-types src/settingsKeyMapping.js
git commit -m "feat: show custom labels across the settings app"
```

---

## Not in this plan

Carried from the spec's open dependencies, and out of scope while this is a prototype:

- **Real persistence.** Replace `labelStore.js` once the endpoints are known.
- **What unticking a period type does to a label.** The prototype keeps the label and simply removes the type from the **Add a custom name** list. Whether that matches the API is unresolved.
- **API version gating.** The new sections use `minimumApiVersion: 43` to match `dataOutputPeriodTypes`; the real minimum is unknown.
- **Tests.** None, by design.
