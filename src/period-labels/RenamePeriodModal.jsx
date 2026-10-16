import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { LabelEditor } from './LabelField.jsx'
import {
    getLabelStoreState,
    setPeriodTypeLabel,
    setRelativePeriodLabel,
} from './labelStore.js'
import styles from './PeriodLabels.module.css'

// One row of the rename grid: built-in name on the left, its input on the right.
const NameRow = ({ name, value, onChange }) => (
    <>
        <span className={styles.renameLabel}>{name}</span>
        <LabelEditor name={name} value={value} onChange={onChange} />
    </>
)

NameRow.propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
}

// Rename a period type and, when it seeds relative periods, its relative
// periods too, so the user sees the whole picture at the moment they rename.
// Edits a draft; nothing is saved until Save.
const RenamePeriodModal = ({
    periodTypeName,
    builtInName,
    relativePeriods,
    onClose,
}) => {
    const [draft, setDraft] = useState(() => {
        const state = getLabelStoreState()
        return {
            periodType: state.periodTypes[periodTypeName]?.default || '',
            relativePeriods: Object.fromEntries(
                relativePeriods.map((period) => [
                    period.id,
                    state.relativePeriods[period.id]?.default || '',
                ])
            ),
        }
    })

    const setRelative = (id, value) =>
        setDraft((prev) => ({
            ...prev,
            relativePeriods: { ...prev.relativePeriods, [id]: value },
        }))

    const save = () => {
        setPeriodTypeLabel(periodTypeName, 'default', draft.periodType)
        relativePeriods.forEach((period) =>
            setRelativePeriodLabel(
                period.id,
                'default',
                draft.relativePeriods[period.id]
            )
        )
        onClose()
    }

    return (
        <Modal large position="middle" onClose={onClose}>
            <ModalTitle>
                {i18n.t('Rename {{name}}', { name: builtInName })}
            </ModalTitle>
            <ModalContent>
                <div className={styles.renameGrid}>
                    <NameRow
                        name={builtInName}
                        value={draft.periodType}
                        onChange={(value) =>
                            setDraft((prev) => ({ ...prev, periodType: value }))
                        }
                    />
                    {relativePeriods.length > 0 && (
                        <>
                            <p
                                className={`${styles.subhead} ${styles.renameSection}`}
                            >
                                {i18n.t('Relative periods based on {{name}}', {
                                    name: builtInName,
                                })}
                            </p>
                            {relativePeriods.map((period) => (
                                <NameRow
                                    key={period.id}
                                    name={period.builtIn}
                                    value={draft.relativePeriods[period.id]}
                                    onChange={(value) =>
                                        setRelative(period.id, value)
                                    }
                                />
                            ))}
                        </>
                    )}
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onClose}>
                        {i18n.t('Cancel')}
                    </Button>
                    <Button primary onClick={save}>
                        {i18n.t('Save')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

RenamePeriodModal.propTypes = {
    builtInName: PropTypes.string.isRequired,
    periodTypeName: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    relativePeriods: PropTypes.arrayOf(
        PropTypes.shape({
            builtIn: PropTypes.string.isRequired,
            id: PropTypes.string.isRequired,
        })
    ),
}

RenamePeriodModal.defaultProps = {
    relativePeriods: [],
}

export default RenamePeriodModal
