# Custom labels for analytics period types

Design, 2026-09-10. Settings app, Analytics settings page.

## Problem

Administrators can already choose which period types are available in analytics
apps, and which variant seeds each relative period set. They now need to rename
those periods.

Two examples drive the feature: an implementation that calls
`Weekly (start Sunday)` an **EPI week**, and one that calls
`Financial year (start July)` an **academic year**.

Renaming a period type is not enough on its own. If weekly relative periods are
seeded from a renamed variant, the relative periods need names too — "Last EPI
week", "Last 4 EPI weeks". These cannot be generated from the period type name,
because languages do not share a grammar for the construction. Each phrase is
written by hand, and each needs its own translations.

## Constraints

The backend is fixed. Two facts follow from it and shape everything below.

**Period type labels are keyed per period type.** They cannot go stale: a label
is stored against the thing it names.

**Relative period labels are one shared, unkeyed set per family** — five weekly,
three financial year. Nothing records which variant they were written for. If
an administrator changes the weekly start day from Sunday to Friday, labels
reading "Last EPI week" survive untouched and now describe a Friday week.

| | Storage | Count | Can go stale |
|---|---|---|---|
| Period type labels | Keyed per period type | 23 | No |
| Relative period labels | One shared unkeyed set per family | 5 weekly + 3 financial | **Yes** |

## Decisions taken

**Blank falls back to the built-in name.** No label is ever required, nothing
needs clearing when a variant changes, and "reset" is just emptying a field.
This is what keeps every partial state safe.

**Fields start empty.** No prefilled guess, even a reviewable one — a naive
substitution into the English pattern is wrong in most languages, and a wrong
value that looks deliberate is worse than a blank that falls back. A
whitespace-only value counts as blank and is stored as empty.

**The settings app shows built-in names first, custom labels alongside.**
`Last week (Last EPI week)`. An administrator can always identify what they are
configuring, while still seeing the effect of the customisation. One shared
resolver applies this rule everywhere rather than each control deciding.

**Translations are language columns**, not a locale switcher. Typical
implementations use one to three locales, and a missing translation is the
failure mode worth designing against: as a column, a gap is a visible hole. Past
about four languages the table scrolls horizontally, which is acceptable for a
rare case.

## Default state of `dataOutputPeriodTypes`

Verified against `dhis2-core` master `7b38c692f5` (2026-09-09). This is
load-bearing and non-obvious, so it is recorded here.

The default lives in a Flyway migration, not in Java.
`V2_43_31__add_period_config_table.sql` seeds every period type except
`TwoYearly`, but only inside `if exists (select 1 from configuration)`.

- **Upgraded instance** — a `configuration` row already existed when the 2.43
  migration ran, so the seed inserts all 23. **All 23 enabled.**
- **Fresh install** — no `configuration` row yet, so the seed is skipped. The
  later migrations adding `WeeklyFriday` and the new financial types cross-join
  `configuration` and therefore also insert nothing.
  `DefaultConfigurationService.getConfiguration()` returns a transient
  `new Configuration()` with an empty set, and the GET endpoint returns that raw
  set. **Nothing enabled.**

Three consequences:

1. `Configuration.getDataOutputPeriodTypesOrDefault()`, which encodes "empty
   means all 23", **has no callers**. The intended fallback is not wired up. The
   only production consumer, `AbstractJdbcTableManager.getPeriodTypeColumns()`,
   uses the raw getter.
2. The POST handler always force-adds `Yearly`. Once anything is saved the set
   is permanently non-empty; the minimum reachable state is `[Yearly]`.
3. Empty is ambiguous — it means both "never configured" and, to the dead code
   path, "all of them".

**We design for 23 enabled.** It is the state an existing production instance
arrives in, so it is the state the UI must survive, even though no
implementation wants it.

## Information architecture

Three sections on the Analytics settings page, one per store.

### Section 1 — Period types available in analytics apps

Which period types exist in analytics. Writes `configuration/dataOutputPeriodTypes`.

Scope is **structural fixes and visual craft only**:

- **Split the "Years" group** into `Yearly` and `Financial year`. Today eight
  items sit in one group, conflating a family with seven start points.
- **Fix the i18n extraction bug** described below.
- **Move to `@dhis2/ui` Checkbox** from the legacy `material-ui` component, and
  tidy spacing and column rhythm.
Separately, and belonging to the labels feature rather than this rework: rows
for period types carrying a custom name show it as a quiet secondary label,
connecting this section to section 2. Section 1's rework can therefore ship
before the labels feature without it.

Explicitly **rejected**: splitting labels into a family column plus a start-point
column (`Financial year` | `Feb` `Apr` `Jul`). `"Weekly (start {{day}})"` and
`"Financial year (start {{month}})"` are single translated units. Translators
may reorder them, inflect the month, or drop the parenthetical entirely.
Splitting them across columns assembles meaning from layout position — the exact
failure this feature exists to prevent.

### Section 2 — Custom period names

Per-period-type labels and their translations.

**Additive, not exhaustive.** The section starts empty; `+ Add a custom name`
picks from the enabled types. Rows are period type × language columns, with a
control to remove a row (which clears the label and leaves the type enabled).

Listing every enabled type would mean 23 blank fields in the default state.
Naming is a niche task, so the default state should be empty.

### Section 3 — Relative periods

Absorbs the `analyticsWeeklyStart` and `analyticsFinancialYearStart` settings,
which stop rendering as standalone dropdowns.

One card per family. Each card header pairs the start selector with the current
variant's custom name, shown **read-only** with a link to section 2. Below it,
the relative labels for that family — five weekly, three financial year — as
label × language columns.

The name is editable in exactly one place (section 2). Its appearance here is
context, not a second copy. The phrases below it — "Last **EPI week**" — contain
the name by hand; that repetition is inherent to the requirement, not a
duplicated field.

## Drift

Two mechanisms, deliberately unequal.

**Adjacency, always.** Each card header states the current variant and its
custom name directly above the labels derived from it. When they disagree the
contradiction is on screen, on every visit, with no detection logic.

**A transient warning, at the moment of change.** Changing a start setting while
custom relative labels exist raises a notice naming the variant being left
behind, offering *review* and *clear all*. This needs no storage: the previous
value is known because it was just changed.

It will not catch changes made through the API or by another administrator.
Detecting those would require persisting which variant the labels were authored
for, which the fixed backend has nowhere to hold. Adjacency covers that case
well enough, so we accept the gap rather than inventing storage.

## Components

- `periodLabels.js` — new shared module. `PeriodTypes.component.jsx` currently
  carries about 120 lines of built-in name formatting (`formatWeeklyPeriod`,
  `formatPeriodWithMonth`, the month and day maps) that all three sections need.
  It moves out rather than being imported from a component.
- `resolveLabel(kind, id, locale)` — the single resolution rule. Returns
  `built-in (custom)` where a custom label exists, plain `built-in` otherwise.
  `kind` distinguishes the two namespaces, which do not share ids: a period type
  (`WeeklySunday`) and a relative period (`LAST_WEEK`). Consumed by section 1's
  grid, sections 2 and 3, the `keyAnalysisRelativePeriod` dropdown, and the
  existing disabled-period-type warnings in `settingsKeyMapping.js`.
- `CustomPeriodNames` — section 2.
- `RelativePeriodLabels` — section 3, rendering one `RelativePeriodSet` card per
  family.
- `PeriodTypes.component.jsx` — reduced to section 1 once formatting moves out.

### i18n extraction bug

`formatPeriodWithMonth` receives its template through a variable and calls
`i18n.t(template, { month })`. The extractor cannot see through that, so
`"Quarterly (start {{month}})"` and `"Six-monthly (start {{month}})"` never
reach `en.pot` — those labels are untranslatable in every language today.
`"Weekly (start {{day}})"` and `"Financial year (start {{month}})"` are present
only because they are literal calls.

Fix by using literal `i18n.t()` calls at each site. `"Financial year"` must also
be added as a standalone string for the new group heading; it does not currently
exist on its own.

## Saving and errors

Follows the existing auto-save-and-snackbar pattern. Locale-scoped writes mirror
`saveLocalizedAppearanceSetting` in `settingsActions.js`. A failed save reverts
the field and raises the existing error snackbar. Sections 2 and 3 gate on
`minimumApiVersion`.

## Testing

- `resolveLabel` — fallback when blank, fallback when the locale is missing,
  combined form when a custom label exists, and that whitespace-only counts as
  blank.
- `periodLabels.js` — built-in formatting for every one of the 23 types,
  including the previously untranslatable Quarterly and Six-monthly variants.
- Section 2 — adding a name, removing a row, and that removal leaves the period
  type enabled.
- Section 3 — the drift warning fires only when custom labels exist, and *clear
  all* empties the set.
- Cypress — rename `Weekly (start Sunday)` to "EPI week", add a translation,
  write the weekly relative labels, and confirm they appear where expected.

## Open dependencies

None block the concept; all block implementation.

1. **What unticking a period type does to its label.** Decided by the API.
   Determines whether a section 2 row survives its type being disabled, and
   whether a confirmation step is needed before unticking a named type.
2. **The label endpoints** — shape, and whether translations are locale-scoped
   writes as system settings are.
3. **Minimum API version** for gating sections 2 and 3.

## Sequencing

Section 1's rework is independent of the labels feature and can ship on its own.
The i18n extraction bug is independent of both and should go first, since it is
a live defect in code the rest of this work touches.
