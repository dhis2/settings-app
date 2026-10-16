import i18n from '@dhis2/d2-i18n'
import { IconEdit16, IconUndo16 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { setPeriodTypeLabel, useLabelState } from './labelStore.js'
import styles from './PeriodLabels.module.css'
import RenamePeriodModal from './RenamePeriodModal.jsx'

// A period type's name where it is shown: struck-through built-in name once
// renamed, a pencil that opens the rename modal, and a quiet reset back to
// the built-in name. `relativePeriods` are included in the modal when this
// period type seeds them.
const PeriodNameEditor = ({
    periodTypeName,
    builtInName,
    editable,
    relativePeriods,
}) => {
    const labels = useLabelState()
    const customLabel = (
        labels.periodTypes[periodTypeName]?.default || ''
    ).trim()
    const [modalOpen, setModalOpen] = useState(false)

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
                    onClick={() => setModalOpen(true)}
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
            {modalOpen && (
                <RenamePeriodModal
                    periodTypeName={periodTypeName}
                    builtInName={builtInName}
                    relativePeriods={relativePeriods}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    )
}

PeriodNameEditor.propTypes = {
    builtInName: PropTypes.string.isRequired,
    periodTypeName: PropTypes.string.isRequired,
    // Disabled period types show their name but can't be renamed.
    editable: PropTypes.bool,
    relativePeriods: PropTypes.array,
}

PeriodNameEditor.defaultProps = {
    editable: true,
    relativePeriods: [],
}

export default PeriodNameEditor
