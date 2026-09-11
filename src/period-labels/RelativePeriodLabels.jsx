import React from 'react'
import DefaultRelativePeriod from './DefaultRelativePeriod.jsx'
import styles from './PeriodLabels.module.css'
import RelativePeriodSet from './RelativePeriodSet.jsx'
import { RELATIVE_PERIOD_SETS } from './relativePeriodSets.js'

const RelativePeriodLabels = () => (
    <div className={styles.sectionBody}>
        <DefaultRelativePeriod />
        {RELATIVE_PERIOD_SETS.map((set) => (
            <RelativePeriodSet key={set.id} set={set} />
        ))}
    </div>
)

export default RelativePeriodLabels
