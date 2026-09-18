import i18n from '@dhis2/d2-i18n'
import {
    Button,
    Help,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { formatPeriodDisplayName } from '../period-types/builtInPeriodNames.js'
import LabelField from './LabelField.jsx'
import {
    setPeriodTypeLabel,
    setRelativePeriodLabel,
    useLabelState,
} from './labelStore.js'
import styles from './PeriodLabels.module.css'

const CustomLabelsModal = ({ periodTypeName, family, onClose }) => {
    const labels = useLabelState()
    const displayName = formatPeriodDisplayName(null, periodTypeName)

    return (
        <Modal large position="top" onClose={onClose}>
            <ModalTitle>
                {i18n.t('Custom labels — {{name}}', { name: displayName })}
            </ModalTitle>
            <ModalContent>
                <p className={styles.subhead}>{i18n.t('Period type')}</p>
                <div className={styles.relativeLabelList}>
                    <LabelField
                        name={displayName}
                        value={labels.periodTypes[periodTypeName]?.default || ''}
                        onChange={(next) =>
                            setPeriodTypeLabel(periodTypeName, 'default', next)
                        }
                    />
                </div>
                {family?.relativePeriods?.length > 0 && (
                    <>
                        <p className={styles.subhead}>
                            {i18n.t('Relative periods')}
                        </p>
                        {family.startSetting && (
                            <Help>
                                {i18n.t(
                                    'Relative labels are shared by this group. They apply to the row marked Use for relative.'
                                )}
                            </Help>
                        )}
                        <div className={styles.relativeLabelList}>
                            {family.relativePeriods.map((period) => (
                                <LabelField
                                    key={period.id}
                                    name={period.builtIn}
                                    value={
                                        labels.relativePeriods[period.id]
                                            ?.default || ''
                                    }
                                    onChange={(next) =>
                                        setRelativePeriodLabel(
                                            period.id,
                                            'default',
                                            next
                                        )
                                    }
                                />
                            ))}
                        </div>
                    </>
                )}
            </ModalContent>
            <ModalActions>
                <Button onClick={onClose}>{i18n.t('Done')}</Button>
            </ModalActions>
        </Modal>
    )
}

CustomLabelsModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    family: PropTypes.object,
    periodTypeName: PropTypes.string,
}

export default CustomLabelsModal
