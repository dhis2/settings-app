# Analytics Period Types — Section 1 Rework & i18n Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the i18n extraction bug in the period-type label formatters, split the "Years" checkbox group into "Yearly" and "Financial year", and migrate the period-type checkboxes from legacy `material-ui` to `@dhis2/ui`, in `src/period-types/PeriodTypes.component.jsx`.

**Architecture:** All three changes live entirely inside the existing `PeriodTypes.component.jsx` (and its CSS module) — no new files, no other components touched. The i18n fix replaces a shared "template string passed through a variable" pattern with literal `i18n.t()` calls at each call site, keeping the month-parsing logic shared via a callback instead of a string. The group split changes the grouping key from `frequencyOrder` alone to a key that special-cases `frequencyOrder === 365` (Yearly vs. Financial). The Checkbox migration is a like-for-like swap (`CheckboxMaterial` → `@dhis2/ui`'s `Checkbox`; `onCheck` → `onChange`), followed by a CSS tidy pass now that the control's box model has changed.

**Tech Stack:** React 18, `@dhis2/app-runtime` (`useDataQuery`), `@dhis2/d2-i18n`, `@dhis2/ui`, CSS modules, `@dhis2/cli-app-scripts` (`d2-app-scripts i18n extract`).

---

## Scope note

This plan implements only the two pieces of `docs/superpowers/specs/2026-09-10-analytics-period-custom-labels-design.md` that the design doc's own "Sequencing" section marks as unblocked today: the i18n extraction bug fix, and Section 1's structural/visual rework (splitting the "Years" group, moving to `@dhis2/ui`'s Checkbox, tidying spacing). It does **not** implement Section 2 (custom period names), Section 3 (relative period labels), `resolveLabel`, or `periodLabels.js` — those are blocked on the design doc's three "Open dependencies" (unticking behavior, label endpoint shape, minimum API version), which are backend/API decisions this repo doesn't control. Building those now would mean writing plan steps against an API that doesn't exist yet, which this plan does not do.

## Testing note

There is currently no jest/testing-library or Cypress coverage anywhere in this repo for `PeriodTypes.component.jsx` (confirmed: no `.test.*`/`.spec.*` files exist under `src/`, and `d2-app-scripts test` has no test infra wired up beyond bare jest). The design doc's own "Testing" section scopes automated tests (`resolveLabel`, `periodLabels.js`, Section 2, Section 3, Cypress) to the labels feature — the part explicitly out of scope here. Introducing a new test framework/dependency for a "structural fixes and visual craft only" slice would be scope creep beyond what either the design doc or this plan calls for. Verification here is therefore: (a) regenerating `i18n/en.pot` and checking the expected strings appear, and (b) running the app in a browser and visually confirming the grouping and checkbox behavior, per this project's standard practice for UI changes.

---

### Task 1: Fix the i18n extraction bug in `formatPeriodWithMonth`

**Files:**
- Modify: `src/period-types/PeriodTypes.component.jsx:74-108`
- Modify: `i18n/en.pot` (regenerated, not hand-edited)

**Context:** `formatPeriodWithMonth` receives a translation template through a variable (`options.template`) and calls `i18n.t(template, { month })` at line 83. The extractor (`i18next-scanner`, a plain-text/regex scan for literal `i18n.t('...')` calls — see `node_modules/@dhis2/cli-app-scripts/src/lib/i18n/extract.js`) cannot resolve a variable there, so `"Quarterly (start {{month}})"` and `"Six-monthly (start {{month}})"` never reach `i18n/en.pot` (confirmed absent via `grep -n "Quarterly (start\|Six-monthly (start" i18n/en.pot`). `"Financial year (start {{month}})"` is present in `i18n/en.pot` today only by accident, because it also appears as a literal call in `formatDisplayNameFallback` (line 134).

- [ ] **Step 1: Replace the shared `template` string with a `format` callback so every `i18n.t()` call is literal at its call site**

Replace `src/period-types/PeriodTypes.component.jsx:74-108`:

```jsx
const formatPeriodWithMonth = (name, options) => {
    const { prefix, template, defaultLabel } = options
    const monthAbbrev = name.replace(prefix, '')
    if (!monthAbbrev) {
        return defaultLabel
            ? simpleLabels[defaultLabel] || i18n.t(defaultLabel)
            : null
    }
    const month = monthMap[monthAbbrev] || monthAbbrev
    return i18n.t(template, { month })
}

const formatFinancialPeriod = (name) => {
    return formatPeriodWithMonth(name, {
        prefix: 'Financial',
        template: 'Financial year (start {{month}})',
        defaultLabel: null,
    })
}

const formatSixMonthlyPeriod = (name) => {
    return formatPeriodWithMonth(name, {
        prefix: 'SixMonthly',
        template: 'Six-monthly (start {{month}})',
        defaultLabel: 'SixMonthly',
    })
}

const formatQuarterlyPeriod = (name) => {
    return formatPeriodWithMonth(name, {
        prefix: 'Quarterly',
        template: 'Quarterly (start {{month}})',
        defaultLabel: 'Quarterly',
    })
}
```

with:

```jsx
const formatPeriodWithMonth = (name, options) => {
    const { prefix, format, defaultLabel } = options
    const monthAbbrev = name.replace(prefix, '')
    if (!monthAbbrev) {
        return defaultLabel
            ? simpleLabels[defaultLabel] || i18n.t(defaultLabel)
            : null
    }
    const month = monthMap[monthAbbrev] || monthAbbrev
    return format(month)
}

const formatFinancialPeriod = (name) => {
    return formatPeriodWithMonth(name, {
        prefix: 'Financial',
        format: (month) =>
            i18n.t('Financial year (start {{month}})', { month }),
        defaultLabel: null,
    })
}

const formatSixMonthlyPeriod = (name) => {
    return formatPeriodWithMonth(name, {
        prefix: 'SixMonthly',
        format: (month) =>
            i18n.t('Six-monthly (start {{month}})', { month }),
        defaultLabel: 'SixMonthly',
    })
}

const formatQuarterlyPeriod = (name) => {
    return formatPeriodWithMonth(name, {
        prefix: 'Quarterly',
        format: (month) => i18n.t('Quarterly (start {{month}})', { month }),
        defaultLabel: 'Quarterly',
    })
}
```

- [ ] **Step 2: Regenerate `i18n/en.pot` and confirm the two previously-missing strings now appear**

Run:

```bash
node_modules/.bin/d2-app-scripts i18n extract
```

Then check:

```bash
grep -n "Quarterly (start\|Six-monthly (start" i18n/en.pot
```

Expected: two `msgid`/`msgstr` pairs are printed — `"Quarterly (start {{month}})"` and `"Six-monthly (start {{month}})"` — where before this step neither line matched.

- [ ] **Step 3: Review the `i18n/en.pot` diff and confirm nothing unrelated changed**

Run:

```bash
git diff i18n/en.pot
```

Expected: only the `POT-Creation-Date`/`PO-Revision-Date` header lines change, plus the two new `msgid`/`msgstr` pairs added (matching the pattern of prior commits that touched this file, e.g. `git show --stat 98b13eb`). No existing strings should be removed or reordered unexpectedly.

- [ ] **Step 4: Commit**

```bash
git add src/period-types/PeriodTypes.component.jsx i18n/en.pot
git commit -m "fix(period-types): make quarterly and six-monthly labels translatable

i18n.t() was called with a variable template, which the extractor
cannot see through, so these two labels never reached en.pot."
```

---

### Task 2: Split the "Years" group into "Yearly" and "Financial year"

**Files:**
- Modify: `src/period-types/PeriodTypes.component.jsx:160-224` (label/grouping logic)
- Modify: `src/period-types/PeriodTypes.component.jsx:325` (render key)
- Modify: `i18n/en.pot` (regenerated, not hand-edited)

**Context:** Today, `getGroupLabel` maps API `frequencyOrder` values to a group label, and `frequencyOrder === 365` covers 8 period types: `Yearly` plus the 7 `Financial*` variants (`FinancialFeb`, `FinancialApril`, `FinancialJuly`, `FinancialAug`, `FinancialSep`, `FinancialOct`, `FinancialNov` — see `periodTypeOrder`, lines 175-199). `frequencyOrder` alone can't distinguish "Yearly" from "Financial year", since both carry the same value. The `Yearly` string is already extracted (`simpleLabels.Yearly`, line 59); `"Financial year"` as a standalone string (no parenthetical) does not exist yet — confirmed via `grep -n '^msgid "Financial year"$' i18n/en.pot` (no match), while `"Financial year (start {{month}})"` and `"Financial year relative period start month"` already do.

- [ ] **Step 1: Change the grouping key so Yearly and Financial variants split into two groups**

Replace `src/period-types/PeriodTypes.component.jsx:160-224`:

```jsx
const getGroupLabel = (frequencyOrder) => {
    const labels = {
        1: i18n.t('Days'),
        7: i18n.t('Weeks'),
        14: i18n.t('Bi-weeks'),
        30: i18n.t('Months'),
        60: i18n.t('Bi-months'),
        61: i18n.t('Bi-months'),
        91: i18n.t('Quarters'),
        182: i18n.t('Six months'),
        365: i18n.t('Years'),
    }
    return labels[frequencyOrder] || i18n.t('Other')
}

const periodTypeOrder = {
    Daily: 1,
    Weekly: 1,
    WeeklyWednesday: 2,
    WeeklyThursday: 3,
    WeeklyFriday: 4,
    WeeklySaturday: 5,
    WeeklySunday: 6,
    BiWeekly: 1,
    Monthly: 1,
    BiMonthly: 1,
    Quarterly: 1,
    QuarterlyNov: 2,
    SixMonthly: 1,
    SixMonthlyApril: 2,
    SixMonthlyNov: 3,
    Yearly: 1,
    FinancialFeb: 2,
    FinancialApril: 3,
    FinancialJuly: 4,
    FinancialAug: 5,
    FinancialSep: 6,
    FinancialOct: 7,
    FinancialNov: 8,
}

const groupByFrequency = (periodTypes) => {
    const groups = {}
    periodTypes.forEach((pt) => {
        const freq = pt.frequencyOrder
        if (!groups[freq]) {
            groups[freq] = {
                label: getGroupLabel(freq),
                frequencyOrder: freq,
                periodTypes: [],
            }
        }
        groups[freq].periodTypes.push(pt)
    })
    const sorted = Object.values(groups).sort(
        (a, b) => a.frequencyOrder - b.frequencyOrder
    )
    sorted.forEach((group) => {
        group.periodTypes.sort(
            (a, b) =>
                (periodTypeOrder[a.name] || 0) - (periodTypeOrder[b.name] || 0)
        )
    })
    return sorted
}
```

with:

```jsx
const getGroupKey = (periodType) => {
    if (periodType.frequencyOrder !== 365) {
        return String(periodType.frequencyOrder)
    }
    return periodType.name === 'Yearly' ? 'yearly' : 'financialYear'
}

const getGroupLabel = (groupKey, frequencyOrder) => {
    if (groupKey === 'yearly') {
        return i18n.t('Yearly')
    }
    if (groupKey === 'financialYear') {
        return i18n.t('Financial year')
    }
    const labels = {
        1: i18n.t('Days'),
        7: i18n.t('Weeks'),
        14: i18n.t('Bi-weeks'),
        30: i18n.t('Months'),
        60: i18n.t('Bi-months'),
        61: i18n.t('Bi-months'),
        91: i18n.t('Quarters'),
        182: i18n.t('Six months'),
    }
    return labels[frequencyOrder] || i18n.t('Other')
}

// Yearly and Financial year both carry frequencyOrder 365; this keeps
// Yearly sorted directly before Financial year, where "Years" used to sit.
const groupSortOrder = {
    yearly: 365,
    financialYear: 365.5,
}

const periodTypeOrder = {
    Daily: 1,
    Weekly: 1,
    WeeklyWednesday: 2,
    WeeklyThursday: 3,
    WeeklyFriday: 4,
    WeeklySaturday: 5,
    WeeklySunday: 6,
    BiWeekly: 1,
    Monthly: 1,
    BiMonthly: 1,
    Quarterly: 1,
    QuarterlyNov: 2,
    SixMonthly: 1,
    SixMonthlyApril: 2,
    SixMonthlyNov: 3,
    Yearly: 1,
    FinancialFeb: 2,
    FinancialApril: 3,
    FinancialJuly: 4,
    FinancialAug: 5,
    FinancialSep: 6,
    FinancialOct: 7,
    FinancialNov: 8,
}

const groupByFrequency = (periodTypes) => {
    const groups = {}
    periodTypes.forEach((pt) => {
        const groupKey = getGroupKey(pt)
        if (!groups[groupKey]) {
            groups[groupKey] = {
                groupKey,
                label: getGroupLabel(groupKey, pt.frequencyOrder),
                sortOrder: groupSortOrder[groupKey] ?? pt.frequencyOrder,
                periodTypes: [],
            }
        }
        groups[groupKey].periodTypes.push(pt)
    })
    const sorted = Object.values(groups).sort(
        (a, b) => a.sortOrder - b.sortOrder
    )
    sorted.forEach((group) => {
        group.periodTypes.sort(
            (a, b) =>
                (periodTypeOrder[a.name] || 0) - (periodTypeOrder[b.name] || 0)
        )
    })
    return sorted
}
```

- [ ] **Step 2: Update the render key, which used `group.frequencyOrder` (no longer unique between the two new groups)**

Modify `src/period-types/PeriodTypes.component.jsx:325`:

```jsx
                {groupedPeriodTypes.map((group) => (
                    <div key={group.frequencyOrder} className={styles.group}>
```

to:

```jsx
                {groupedPeriodTypes.map((group) => (
                    <div key={group.groupKey} className={styles.group}>
```

- [ ] **Step 3: Trace the grouping logic by hand to confirm correctness before running the app**

Confirm: for the 8 period types with `frequencyOrder === 365` (`Yearly`, `FinancialFeb`, `FinancialApril`, `FinancialJuly`, `FinancialAug`, `FinancialSep`, `FinancialOct`, `FinancialNov`), `getGroupKey` returns `'yearly'` only for `Yearly` and `'financialYear'` for the other 7. `groupSortOrder` places `'yearly'` (365) immediately before `'financialYear'` (365.5), so the "Yearly" group renders directly above "Financial year", preserving the original position of the combined "Years" group relative to "Six months" and any group after 365. Within "Financial year", `periodTypeOrder` (unchanged) still sorts `FinancialFeb` through `FinancialNov` in calendar order.

- [ ] **Step 4: Regenerate `i18n/en.pot` and confirm the new standalone "Financial year" string appears**

Run:

```bash
node_modules/.bin/d2-app-scripts i18n extract
grep -n '^msgid "Financial year"$' i18n/en.pot
```

Expected: one match, immediately followed by `msgstr "Financial year"`.

- [ ] **Step 5: Commit**

```bash
git add src/period-types/PeriodTypes.component.jsx i18n/en.pot
git commit -m "feat(period-types): split Years group into Yearly and Financial year

The combined group conflated a period-type family (Yearly) with seven
financial-year start-month variants under one 'Years' label."
```

---

### Task 3: Migrate from `material-ui` to `@dhis2/ui` Checkbox

**Files:**
- Modify: `src/period-types/PeriodTypes.component.jsx:1-8` (imports)
- Modify: `src/period-types/PeriodTypes.component.jsx:347-360` (JSX)

**Context:** `@dhis2/ui@10.1.11` (already a dependency) exports a `Checkbox` (`node_modules/@dhis2-ui/checkbox/build/cjs/checkbox/checkbox.js`). Its relevant props are `checked`, `disabled`, `label` (`node`), and `onChange` — called as `onChange(payload, event)` where `payload` is `{ checked, name, value }`. The existing handler doesn't need the payload (it closes over `isEnabled` and `periodType.name` already), so the call site only needs `onCheck` renamed to `onChange`; no other prop changes are required. No other file in this repo imports `@dhis2/ui`'s `Checkbox` yet, so there's no existing in-repo convention to match beyond the library's own prop names.

- [ ] **Step 1: Swap the import**

Modify `src/period-types/PeriodTypes.component.jsx:1-8`:

```jsx
import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { CenteredContent, CircularLoader } from '@dhis2/ui'
import CheckboxMaterial from 'material-ui/Checkbox'
import React, { useState, useEffect } from 'react'
```

to:

```jsx
import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { CenteredContent, CircularLoader, Checkbox } from '@dhis2/ui'
import React, { useState, useEffect } from 'react'
```

- [ ] **Step 2: Swap the JSX usage**

Modify `src/period-types/PeriodTypes.component.jsx:347-360`:

```jsx
                                        <CheckboxMaterial
                                            checked={isEnabled}
                                            disabled={updating || isMandatory}
                                            label={formatPeriodDisplayName(
                                                periodType.displayName,
                                                periodType.name
                                            )}
                                            onCheck={() =>
                                                handlePeriodTypeToggle(
                                                    periodType.name,
                                                    isEnabled
                                                )
                                            }
                                        />
```

to:

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
```

- [ ] **Step 3: Commit**

```bash
git add src/period-types/PeriodTypes.component.jsx
git commit -m "refactor(period-types): migrate checkboxes from material-ui to @dhis2/ui"
```

---

### Task 4: Tidy checkbox grid spacing and visually verify all three changes together

**Files:**
- Modify: `src/period-types/PeriodTypes.module.css:29-40`

**Context:** `@dhis2/ui`'s `Checkbox` renders as a single `<label>` with its own inline styles (`display:flex; align-items:center; font-size:14px; line-height:19px`, no external margin — see `node_modules/@dhis2-ui/checkbox/build/cjs/checkbox/checkbox.js`), unlike `material-ui`'s taller control with its own internal padding that the original `6px` row gap and `font-size: 15px` override were tuned against. With the swap in Task 3, that `font-size: 15px` override on `.checkboxItem` is now redundant (the label sets its own 14px) and the tighter row gap may look cramped against the slimmer control.

- [ ] **Step 1: Update the grid spacing**

Modify `src/period-types/PeriodTypes.module.css:29-40`:

```css
.checkboxList {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 6px 24px;
    padding-left: 8px;
    width: 100%;
}

.checkboxItem {
    min-width: 0;
    font-size: 15px;
}
```

to:

```css
.checkboxList {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 10px 24px;
    padding-left: 8px;
    width: 100%;
}

.checkboxItem {
    display: flex;
    align-items: center;
    min-width: 0;
}
```

- [ ] **Step 2: Run the dev server and visually verify all three changes together**

Run:

```bash
yarn start
```

This requires a running DHIS2 instance to point at; `d2-app-scripts start` will prompt for a server URL (and credentials) on first run if none is configured. If no instance is available in this environment, stop here and ask the user to run `yarn start` themselves and check the Analytics settings page (`#/analytics`) before merging.

In the browser, navigate to the Analytics settings page and confirm:
- The period types list now shows a separate "Yearly" group (containing only "Yearly") and a separate "Financial year" group (containing the 7 financial variants, in Feb → Nov order), where there used to be one combined "Years" group.
- Checkboxes render using `@dhis2/ui`'s style (thinner outline icon, no material-ui ripple), toggle correctly, and the row spacing looks intentional rather than cramped or too sparse — adjust the `gap` value from Step 1 if it doesn't.
- The "Yearly" checkbox is still disabled with the "This period type is always enabled and cannot be disabled" tooltip.
- Toggling a non-mandatory period type still saves (snackbar confirms) and persists after a page reload.

- [ ] **Step 3: Commit**

```bash
git add src/period-types/PeriodTypes.module.css
git commit -m "style(period-types): tidy checkbox grid spacing for @dhis2/ui Checkbox"
```

---

## Self-review

**Spec coverage** (against the design doc's unblocked scope only):
- "Fix the i18n extraction bug" → Task 1.
- "Split the 'Years' group into `Yearly` and `Financial year`" → Task 2.
- "Move to `@dhis2/ui` Checkbox from the legacy `material-ui` component, and tidy spacing and column rhythm" → Tasks 3 and 4.
- "'Financial year' must also be added as a standalone string" → Task 2, Step 4.
- Explicitly out of scope and not planned here: Sections 2 and 3, `resolveLabel`, `periodLabels.js`, the custom-label row on Section 1 (the doc itself says this belongs to the labels feature, not this rework), and all Cypress work (blocked on the same open dependencies).

**Placeholder scan:** no TBD/TODO markers; every step shows complete before/after code or an exact runnable command.

**Type/name consistency:** `groupKey` is used consistently as the object key, sort key, and render `key` prop across Task 2's steps 1–2; `getGroupLabel`'s signature change (`frequencyOrder` → `(groupKey, frequencyOrder)`) is applied at its only call site inside the same edit.
