import i18n from '@dhis2/d2-i18n'
import {
    IconEdit16,
    IconWarning16,
    SingleSelect,
    SingleSelectOption,
    Switch,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import settingsActions from '../settingsActions.js'
import { seedState, seedValueFor } from './periodGroups.js'
import styles from './PeriodTypes.module.css'

const relativeNoun = {
    weekly: () => i18n.t('Relative weeks'),
    financialYear: () => i18n.t('Relative financial years'),
}

const SeedChoice = ({ group, allowedSet, settings, displayName }) => {
    const { family } = group
    const { status, seedType, enabledSeedable } = seedState(
        group,
        allowedSet,
        settings
    )
    const noun = relativeNoun[family.id]?.() || i18n.t('Relative periods')
    const builtInOf = (name) =>
        group.types.find((type) => type.name === name)?.builtIn || name

    if (status === 'noneEnabled') {
        return (
            <div className={styles.seedRow}>
                <p className={styles.seedWarning} role="status">
                    <IconWarning16 />
                    {i18n.t(
                        '{{relative}} are not shown in analytics apps: none of the available types can be used for them.',
                        { relative: noun }
                    )}
                </p>
            </div>
        )
    }

    if (status === 'ok' && enabledSeedable.length === 1) {
        return (
            <p className={[styles.seedRow, styles.seedNote].join(' ')}>
                {i18n.t('{{relative}} are based on {{periodType}}.', {
                    relative: noun,
                    periodType: displayName(seedType),
                })}
            </p>
        )
    }

    // A seed pointing at an unavailable type stays selected (the server keeps
    // it), so it is listed too, marked, until the admin picks another.
    const options =
        status === 'disabled' && seedType
            ? [...enabledSeedable, { name: seedType, unavailable: true }]
            : enabledSeedable

    return (
        <div className={styles.seedRow}>
            <SingleSelect
                dense
                prefix={i18n.t('{{relative}} based on', { relative: noun })}
                selected={seedType || ''}
                onChange={({ selected }) =>
                    settingsActions.saveKey(
                        family.startSetting,
                        seedValueFor(family, selected)
                    )
                }
            >
                {options.map((type) => (
                    <SingleSelectOption
                        key={type.name}
                        value={type.name}
                        label={
                            type.unavailable
                                ? i18n.t('{{periodType}} (not available)', {
                                      periodType: builtInOf(type.name),
                                  })
                                : displayName(type.name)
                        }
                    />
                ))}
            </SingleSelect>
            {status === 'disabled' && (
                <p className={styles.seedWarning} role="status">
                    <IconWarning16 />
                    {i18n.t(
                        '{{relative}} are not shown in analytics apps until they are based on an available period type.',
                        { relative: noun }
                    )}
                </p>
            )}
        </div>
    )
}

SeedChoice.propTypes = {
    allowedSet: PropTypes.instanceOf(Set).isRequired,
    displayName: PropTypes.func.isRequired,
    group: PropTypes.object.isRequired,
    settings: PropTypes.object,
}

const TypeRow = ({
    type,
    enabled,
    customLabel,
    disabled,
    onToggle,
    onRename,
}) => (
    <div className={[styles.row, enabled ? styles.rowOn : ''].join(' ')}>
        <span className={styles.rowName}>
            {customLabel ? (
                <>
                    <s className={styles.builtInStruck}>{type.builtIn}</s>
                    <span className={styles.customName}>{customLabel}</span>
                </>
            ) : (
                type.builtIn
            )}
            {enabled && (
                <button
                    type="button"
                    className={styles.pencil}
                    aria-label={i18n.t('Rename {{periodType}}', {
                        periodType: type.builtIn,
                    })}
                    title={i18n.t('Rename')}
                    onClick={onRename}
                >
                    <IconEdit16 />
                </button>
            )}
        </span>
        <Switch
            dense
            label={
                <span className={styles.srOnly}>
                    {i18n.t('{{periodType}} available for analysis', {
                        periodType: type.builtIn,
                    })}
                </span>
            }
            checked={enabled}
            disabled={disabled || type.mandatory}
            onChange={() => onToggle(type.name, enabled)}
        />
    </div>
)

TypeRow.propTypes = {
    enabled: PropTypes.bool.isRequired,
    type: PropTypes.object.isRequired,
    onRename: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
    customLabel: PropTypes.string,
    disabled: PropTypes.bool,
}

const AvailabilityTable = ({
    groups,
    allowedSet,
    settings,
    labels,
    updating,
    onToggle,
    onRename,
}) => {
    const customLabel = (name) =>
        (labels.periodTypes[name]?.default || '').trim()
    const displayName = (name) =>
        customLabel(name) ||
        groups.flatMap((g) => g.types).find((t) => t.name === name)?.builtIn ||
        name

    const renderGroup = (group) => (
        <div
            key={group.family.id}
            role="group"
            aria-label={group.family.label}
            className={styles.group}
        >
            {group.types.map((type) => (
                <TypeRow
                    key={type.name}
                    type={type}
                    enabled={allowedSet.has(type.name)}
                    customLabel={customLabel(type.name)}
                    disabled={updating}
                    onToggle={onToggle}
                    onRename={() => onRename(`t:${type.name}`)}
                />
            ))}
            {group.family.startSetting &&
                group.types.some((t) => allowedSet.has(t.name)) && (
                    <SeedChoice
                        group={group}
                        allowedSet={allowedSet}
                        settings={settings}
                        displayName={displayName}
                    />
                )}
        </div>
    )

    // Two columns, split where the row counts balance; families never break.
    const rowCount = (group) =>
        group.types.length + (group.family.startSetting ? 1 : 0)
    const half = groups.reduce((sum, g) => sum + rowCount(g), 0) / 2
    const columns = [[], []]
    let seen = 0
    groups.forEach((group) => {
        columns[seen < half ? 0 : 1].push(group)
        seen += rowCount(group)
    })

    return (
        <div className={styles.columns}>
            {columns
                .filter((column) => column.length > 0)
                .map((column, index) => (
                    <div key={index} className={styles.table}>
                        {column.map(renderGroup)}
                    </div>
                ))}
        </div>
    )
}

AvailabilityTable.propTypes = {
    allowedSet: PropTypes.instanceOf(Set).isRequired,
    groups: PropTypes.array.isRequired,
    labels: PropTypes.object.isRequired,
    onRename: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
    settings: PropTypes.object,
    updating: PropTypes.bool,
}

export default AvailabilityTable
