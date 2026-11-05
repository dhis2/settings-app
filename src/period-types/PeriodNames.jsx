import i18n from '@dhis2/d2-i18n'
import {
    Button,
    Checkbox,
    IconInfo16,
    IconTranslate16,
    Input,
    Tooltip,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import {
    setPeriodTypeLabel,
    setRelativePeriodLabel,
} from '../period-labels/labelStore.js'
import PrototypeTranslationDialog from '../period-labels/PrototypeTranslationDialog.jsx'
import { relativeVisible, seedState } from './periodGroups.js'
import styles from './PeriodTypes.module.css'

// Keeps its own text while typing and saves on blur or Enter, so a trailing
// space isn't trimmed away mid-word.
const NameInput = ({ builtIn, value, onCommit, initialFocus }) => {
    const [text, setText] = useState(value)
    const [focused, setFocused] = useState(false)
    const wrapper = useRef(null)

    // initialFocus focuses on mount without firing onFocus, so select here.
    useEffect(() => {
        if (initialFocus) {
            wrapper.current?.querySelector('input')?.select()
        }
    }, [initialFocus])

    useEffect(() => {
        if (!focused) {
            setText(value)
        }
    }, [value, focused])

    return (
        <span ref={wrapper} className={styles.nameInput}>
            <Input
                dense
                initialFocus={initialFocus}
                value={text}
                placeholder={builtIn}
                onChange={({ value: next }) => setText(next || '')}
                onFocus={(_, event) => {
                    setFocused(true)
                    event.target.select()
                }}
                onBlur={() => {
                    setFocused(false)
                    onCommit(text)
                }}
                onKeyDown={(_, event) => {
                    if (event.key === 'Enter') {
                        onCommit(text)
                    }
                    if (event.key === 'Escape') {
                        setText(value)
                    }
                }}
            />
        </span>
    )
}

NameInput.propTypes = {
    builtIn: PropTypes.string.isRequired,
    onCommit: PropTypes.func.isRequired,
    initialFocus: PropTypes.bool,
    value: PropTypes.string,
}

// Every name an analyst could meet. Relative periods sit under the type
// they follow: the seed for weekly and financial year, else the first type.
const nameRows = ({ groups, allowedSet, settings, labels }) =>
    groups.flatMap((group) => {
        const fixed = group.types.map((type) => ({
            key: `t:${type.name}`,
            group,
            builtIn: type.builtIn,
            custom: labels.periodTypes[type.name]?.default || '',
            save: (next) => setPeriodTypeLabel(type.name, 'default', next),
            hidden: !allowedSet.has(type.name),
        }))
        const relativeHidden = !relativeVisible(group, allowedSet, settings)
        const relative = (group.family.relativePeriods || []).map((rp) => ({
            key: `r:${rp.id}`,
            group,
            child: true,
            builtIn: rp.builtIn,
            custom: labels.relativePeriods[rp.id]?.default || '',
            save: (next) => setRelativePeriodLabel(rp.id, 'default', next),
            hidden: relativeHidden,
        }))
        const { seedType } = seedState(group, allowedSet, settings)
        const anchor = Math.max(
            0,
            fixed.findIndex((row) => row.key === `t:${seedType}`)
        )
        return [
            ...fixed.slice(0, anchor + 1),
            ...relative,
            ...fixed.slice(anchor + 1),
        ]
    })

const PeriodNames = ({ groups, allowedSet, settings, labels, focusKey }) => {
    const [query, setQuery] = useState('')
    const [showHidden, setShowHidden] = useState(false)
    const [translating, setTranslating] = useState(null)

    const q = query.trim().toLowerCase()
    const matches = nameRows({
        groups,
        allowedSet,
        settings,
        labels,
    }).filter(
        (row) =>
            !q ||
            row.builtIn.toLowerCase().includes(q) ||
            row.custom.toLowerCase().includes(q)
    )
    // The pencil's target stays visible even when it is hidden from analysts.
    const shown = showHidden
        ? matches
        : matches.filter((row) => !row.hidden || row.key === focusKey)
    const visibleGroups = groups
        .map((group) => ({
            group,
            rows: shown.filter((row) => row.group === group),
        }))
        .filter((entry) => entry.rows.length > 0)

    return (
        <div className={styles.names}>
            <div className={styles.namesToolbar}>
                <div className={styles.search}>
                    <Input
                        dense
                        placeholder={i18n.t('Filter')}
                        value={query}
                        onChange={({ value }) => setQuery(value || '')}
                    />
                </div>
                <Checkbox
                    dense
                    label={i18n.t('Show unavailable periods')}
                    checked={showHidden}
                    onChange={({ checked }) => setShowHidden(checked)}
                />
            </div>
            <table className={styles.namesTable}>
                <thead>
                    <tr>
                        <th>{i18n.t('Built-in name')}</th>
                        <th>{i18n.t('Custom name')}</th>
                    </tr>
                </thead>
                {visibleGroups.map(({ group, rows }) => (
                    <tbody key={group.family.id}>
                        <tr className={styles.namesGroupRow}>
                            <th colSpan={2}>{group.family.label}</th>
                        </tr>
                        {rows.map((row) => (
                            <tr
                                key={row.key}
                                className={[
                                    row.hidden ? styles.hiddenRow : '',
                                    row.key === focusKey ? styles.focusRow : '',
                                ].join(' ')}
                            >
                                <td
                                    className={
                                        row.child ? styles.childCell : undefined
                                    }
                                >
                                    <span className={styles.builtInCell}>
                                        {row.builtIn}
                                        {row.hidden && (
                                            <Tooltip
                                                content={i18n.t(
                                                    "Not available for analysis, won't be shown in analytics apps"
                                                )}
                                            >
                                                <span
                                                    className={styles.infoIcon}
                                                    tabIndex={0}
                                                    aria-label={i18n.t(
                                                        "Not available for analysis, won't be shown in analytics apps"
                                                    )}
                                                >
                                                    <IconInfo16 />
                                                </span>
                                            </Tooltip>
                                        )}
                                    </span>
                                </td>
                                <td>
                                    <span className={styles.nameCell}>
                                        <NameInput
                                            builtIn={row.builtIn}
                                            value={row.custom}
                                            onCommit={row.save}
                                            initialFocus={row.key === focusKey}
                                        />
                                        <Button
                                            small
                                            icon={<IconTranslate16 />}
                                            title={i18n.t('Translate')}
                                            onClick={() =>
                                                setTranslating(
                                                    row.custom || row.builtIn
                                                )
                                            }
                                        />
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                ))}
            </table>
            {!visibleGroups.length && q && (
                <p className={styles.namesNote}>
                    {i18n.t('No names match "{{query}}".', { query })}
                </p>
            )}
            {translating && (
                <PrototypeTranslationDialog
                    name={translating}
                    onClose={() => setTranslating(null)}
                />
            )}
        </div>
    )
}

PeriodNames.propTypes = {
    allowedSet: PropTypes.instanceOf(Set).isRequired,
    groups: PropTypes.array.isRequired,
    labels: PropTypes.object.isRequired,
    focusKey: PropTypes.string,
    settings: PropTypes.object,
}

export default PeriodNames
