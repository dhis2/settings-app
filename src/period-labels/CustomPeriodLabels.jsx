import { Help } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import React from 'react'
import PeriodLabelFamily from './PeriodLabelFamily.jsx'
import { PERIOD_FAMILIES } from './periodFamilies.js'
import styles from './PeriodLabels.module.css'

const CustomPeriodLabels = () => (
    <div className={styles.sectionBody}>
        <Help>
            {i18n.t(
                'Rename the periods shown in analytics apps. Only enabled period types appear here.'
            )}
        </Help>
        {PERIOD_FAMILIES.map((family) => (
            <PeriodLabelFamily key={family.id} family={family} />
        ))}
    </div>
)

export default CustomPeriodLabels
