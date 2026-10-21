import i18n from '@dhis2/d2-i18n'
import { Checkbox, IconEdit16, IconLock16, Switch } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { PERIOD_FAMILIES } from '../period-labels/periodFamilies.js'
import RenamePeriodModal from '../period-labels/RenamePeriodModal.jsx'
import styles from './PeriodFamilies.module.css'
import SeedSelect from './SeedSelect.jsx'

// Prototype variant E: one switch per period family, with the family's start
// day or start month variants as checkboxes underneath.

const VARIANT_LABELS = {
    Weekly: i18n.t('Monday'),
    WeeklyWednesday: i18n.t('Wednesday'),
    WeeklyThursday: i18n.t('Thursday'),
    WeeklyFriday: i18n.t('Friday'),
    WeeklySaturday: i18n.t('Saturday'),
    WeeklySunday: i18n.t('Sunday'),
    Quarterly: i18n.t('January'),
    QuarterlyNov: i18n.t('November'),
    SixMonthly: i18n.t('January'),
    SixMonthlyApril: i18n.t('April'),
    SixMonthlyNov: i18n.t('November'),
    FinancialFeb: i18n.t('February'),
    FinancialApril: i18n.t('April'),
    FinancialJuly: i18n.t('July'),
    FinancialAug: i18n.t('August'),
    FinancialSep: i18n.t('September'),
    FinancialOct: i18n.t('October'),
    FinancialNov: i18n.t('November'),
}

const familyByPeriodType = PERIOD_FAMILIES.reduce((acc, family) => {
    family.periodTypeNames.forEach((name) => {
        acc[name] = family
    })
    return acc
}, {})

// A name with its custom label after it, e.g. "Wednesday · EPI week".
const NameWithAlias = ({ name, alias }) => (
    <>
        {name}
        {alias && <span className={styles.alias}>· {alias}</span>}
    </>
)

NameWithAlias.propTypes = {
    name: PropTypes.string.isRequired,
    alias: PropTypes.string,
}

const RenameButton = ({ periodType, relativePeriods }) => {
    const [open, setOpen] = useState(false)
    return (
        <>
            <button
                type="button"
                className={styles.renameButton}
                title={i18n.t('Rename')}
                aria-label={i18n.t('Rename {{name}}', {
                    name: periodType.builtInName,
                })}
                onClick={() => setOpen(true)}
            >
                <IconEdit16 />
            </button>
            {open && (
                <RenamePeriodModal
                    periodTypeName={periodType.name}
                    builtInName={periodType.builtInName}
                    relativePeriods={relativePeriods}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    )
}

RenameButton.propTypes = {
    periodType: PropTypes.shape({
        builtInName: PropTypes.string,
        name: PropTypes.string,
    }).isRequired,
    relativePeriods: PropTypes.array,
}

const PeriodFamilies = ({
    periodTypes,
    allowedSet,
    mandatoryPeriodTypes,
    seedGroups,
    settings,
    labels,
    updating,
    relativePeriodsFor,
    onSave,
}) => {
    // Families in table order, each with its variants in table order.
    const families = []
    periodTypes.forEach((periodType) => {
        const family = familyByPeriodType[periodType.name]
        if (!family) {
            return
        }
        let entry = families.find((f) => f.family === family)
        if (!entry) {
            entry = { family, variants: [] }
            families.push(entry)
        }
        entry.variants.push(periodType)
    })

    const aliasOf = (name) => labels.periodTypes[name]?.default?.trim() || ''

    const save = (change) => {
        const next = new Set(allowedSet)
        change(next)
        onSave(next)
    }

    return (
        <div className={styles.families}>
            {families.map(({ family, variants }) => {
                const enabledVariants = variants.filter((v) =>
                    allowedSet.has(v.name)
                )
                const isOn = enabledVariants.length > 0
                const isMandatory = variants.some((v) =>
                    mandatoryPeriodTypes.has(v.name)
                )
                const hasVariants = variants.length > 1
                const single = hasVariants ? null : variants[0]
                const seedGroup = seedGroups.find((g) => g.id === family.id)
                const seedOptions = seedGroup
                    ? enabledVariants.map((v) => ({
                          value: seedGroup.periodTypeToValue[v.name],
                          label: aliasOf(v.name)
                              ? `${VARIANT_LABELS[v.name]} · ${aliasOf(v.name)}`
                              : VARIANT_LABELS[v.name],
                      }))
                    : []

                return (
                    <div
                        key={family.id}
                        className={`${styles.family} ${isOn ? '' : styles.off}`}
                    >
                        <div className={styles.familyHeader}>
                            {isMandatory ? (
                                <span className={styles.lock}>
                                    <IconLock16 />
                                </span>
                            ) : (
                                <Switch
                                    dense
                                    checked={isOn}
                                    disabled={updating}
                                    ariaLabel={family.label}
                                    onChange={() =>
                                        save((next) => {
                                            if (isOn) {
                                                variants.forEach((v) =>
                                                    next.delete(v.name)
                                                )
                                            } else {
                                                next.add(variants[0].name)
                                            }
                                        })
                                    }
                                />
                            )}
                            <span className={styles.familyName}>
                                <NameWithAlias
                                    name={family.label}
                                    alias={single ? aliasOf(single.name) : ''}
                                />
                            </span>
                            {single && isOn && (
                                <RenameButton
                                    periodType={single}
                                    relativePeriods={relativePeriodsFor(
                                        single.name
                                    )}
                                />
                            )}
                            {isMandatory && (
                                <span className={styles.always}>
                                    {i18n.t('Always available')}
                                </span>
                            )}
                        </div>
                        {hasVariants && isOn && (
                            <div className={styles.familyBody}>
                                <div className={styles.legend}>
                                    {family.id === 'weekly'
                                        ? i18n.t('Start day')
                                        : i18n.t('Start month')}
                                </div>
                                <div className={styles.variants}>
                                    {variants.map((variant) => {
                                        const checked = allowedSet.has(
                                            variant.name
                                        )
                                        return (
                                            <span
                                                key={variant.name}
                                                className={styles.variant}
                                            >
                                                <Checkbox
                                                    dense
                                                    checked={checked}
                                                    disabled={updating}
                                                    label={
                                                        <NameWithAlias
                                                            name={
                                                                VARIANT_LABELS[
                                                                    variant.name
                                                                ]
                                                            }
                                                            alias={aliasOf(
                                                                variant.name
                                                            )}
                                                        />
                                                    }
                                                    onChange={() =>
                                                        save((next) =>
                                                            checked
                                                                ? next.delete(
                                                                      variant.name
                                                                  )
                                                                : next.add(
                                                                      variant.name
                                                                  )
                                                        )
                                                    }
                                                />
                                                {checked && (
                                                    <RenameButton
                                                        periodType={variant}
                                                        relativePeriods={relativePeriodsFor(
                                                            variant.name
                                                        )}
                                                    />
                                                )}
                                            </span>
                                        )
                                    })}
                                </div>
                                {seedGroup && seedOptions.length > 0 && (
                                    <div className={styles.relative}>
                                        <span>{seedGroup.selectLabel}</span>
                                        <SeedSelect
                                            group={seedGroup}
                                            options={seedOptions}
                                            settings={settings}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

PeriodFamilies.propTypes = {
    allowedSet: PropTypes.instanceOf(Set).isRequired,
    labels: PropTypes.shape({ periodTypes: PropTypes.object }).isRequired,
    mandatoryPeriodTypes: PropTypes.instanceOf(Set).isRequired,
    periodTypes: PropTypes.arrayOf(
        PropTypes.shape({
            builtInName: PropTypes.string,
            name: PropTypes.string,
        })
    ).isRequired,
    relativePeriodsFor: PropTypes.func.isRequired,
    seedGroups: PropTypes.array.isRequired,
    onSave: PropTypes.func.isRequired,
    settings: PropTypes.object,
    updating: PropTypes.bool,
}

export default PeriodFamilies
