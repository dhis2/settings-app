import i18n from '@dhis2/d2-i18n'
import { Button, Input, Label, IconTranslate16 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import styles from './PeriodLabels.module.css'
import PrototypeTranslationDialog from './PrototypeTranslationDialog.jsx'

export const LabelEditor = ({ name, value, onChange }) => {
    const [translateOpen, setTranslateOpen] = useState(false)

    return (
        <>
            <div className={styles.labelEditor}>
                <div className={styles.labelInput}>
                    <Input
                        dense
                        value={value}
                        onChange={({ value: next }) => onChange(next || '')}
                    />
                </div>
                <Button
                    small
                    className={styles.translateButton}
                    icon={<IconTranslate16 />}
                    title={i18n.t('Translate')}
                    onClick={() => setTranslateOpen(true)}
                />
            </div>
            {translateOpen && (
                <PrototypeTranslationDialog
                    name={value || name}
                    onClose={() => setTranslateOpen(false)}
                />
            )}
        </>
    )
}

LabelEditor.propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
}

const LabelField = ({ name, value, onChange }) => (
    <div className={styles.relativeLabelField}>
        <Label>{name}</Label>
        <LabelEditor name={name} value={value} onChange={onChange} />
    </div>
)

LabelField.propTypes = {
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
}

export default LabelField
