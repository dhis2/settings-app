import i18n from '@dhis2/d2-i18n'
import { IconEdit16, IconUndo16, Input } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import { setPeriodTypeLabel, useLabelState } from './labelStore.js'
import styles from './PeriodLabels.module.css'

// Rename a period type where it is shown: pencil to edit, struck-through
// built-in name once renamed, and a quiet reset back to the built-in name.
const PeriodNameEditor = ({ periodTypeName, builtInName, editable }) => {
    const labels = useLabelState()
    const customLabel = (
        labels.periodTypes[periodTypeName]?.default || ''
    ).trim()
    const [draft, setDraft] = useState(null)
    const isEditing = editable && draft !== null
    // Escape unmounts the input, which can still fire a blur; don't save then.
    const cancelled = useRef(false)

    const startEditing = () => {
        cancelled.current = false
        setDraft(customLabel || builtInName)
    }

    const save = () => {
        if (cancelled.current || draft === null) {
            return
        }
        const next = draft.trim()
        setPeriodTypeLabel(
            periodTypeName,
            'default',
            next === builtInName ? '' : next
        )
        setDraft(null)
    }

    if (isEditing) {
        return (
            <div className={styles.nameEditor}>
                <Input
                    dense
                    initialFocus
                    className={styles.nameInput}
                    value={draft}
                    placeholder={builtInName}
                    onChange={({ value }) => setDraft(value || '')}
                    onBlur={save}
                    onKeyDown={(_, event) => {
                        if (event.key === 'Enter') {
                            save()
                        } else if (event.key === 'Escape') {
                            cancelled.current = true
                            setDraft(null)
                        }
                    }}
                />
            </div>
        )
    }

    return (
        <div className={styles.nameEditor}>
            {customLabel ? (
                <>
                    <s className={styles.replacedName}>{builtInName}</s>
                    <span>{customLabel}</span>
                </>
            ) : (
                <span>{builtInName}</span>
            )}
            {editable && (
                <button
                    type="button"
                    className={styles.nameAction}
                    title={i18n.t('Rename')}
                    aria-label={i18n.t('Rename {{name}}', {
                        name: builtInName,
                    })}
                    onClick={startEditing}
                >
                    <IconEdit16 />
                </button>
            )}
            {editable && customLabel && (
                <button
                    type="button"
                    className={`${styles.nameAction} ${styles.resetAction}`}
                    title={i18n.t('Reset to {{name}}', { name: builtInName })}
                    aria-label={i18n.t('Reset to {{name}}', {
                        name: builtInName,
                    })}
                    onClick={() =>
                        setPeriodTypeLabel(periodTypeName, 'default', '')
                    }
                >
                    <IconUndo16 />
                </button>
            )}
        </div>
    )
}

PeriodNameEditor.propTypes = {
    builtInName: PropTypes.string.isRequired,
    periodTypeName: PropTypes.string.isRequired,
    // Disabled period types show their name but can't be renamed.
    editable: PropTypes.bool,
}

PeriodNameEditor.defaultProps = {
    editable: true,
}

export default PeriodNameEditor
