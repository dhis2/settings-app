import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { CenteredContent, CircularLoader, Tab, TabBar } from '@dhis2/ui'
import React, { useState, useEffect } from 'react'
import configOptionStore from '../configOptionStore.js'
import DefaultRelativePeriod from '../period-labels/DefaultRelativePeriod.jsx'
import { useLabelState } from '../period-labels/labelStore.js'
import settingsActions from '../settingsActions.js'
import settingsStore from '../settingsStore.js'
import AvailabilityTable from './AvailabilityTable.jsx'
import { buildGroups, seedValueFor } from './periodGroups.js'
import PeriodNames from './PeriodNames.jsx'
import styles from './PeriodTypes.module.css'

const query = {
    periodTypes: {
        resource: 'periodTypes',
        params: {
            fields: 'name,displayName,frequencyOrder',
        },
    },
    dataOutputPeriodTypes: {
        resource: 'configuration/dataOutputPeriodTypes',
    },
}

const namesFromList = (list) =>
    (list || []).map((entry) =>
        typeof entry === 'string' ? entry : entry.name
    )

const useStoreState = (store) => {
    const [state, setState] = useState(() => store.getState?.() ?? store.state)

    useEffect(() => {
        const subscription = store.subscribe((next) =>
            setState(next ? { ...next } : { ...store.state })
        )
        return () => subscription.unsubscribe()
    }, [store])

    return state
}

const PeriodTypes = () => {
    const { loading, data } = useDataQuery(query)
    const [allowedPeriodTypes, setAllowedPeriodTypes] = useState([])
    const { baseUrl, apiVersion } = useConfig()
    const [updating, setUpdating] = useState(false)
    const [tab, setTab] = useState('availability')
    // Which name field to focus when Names opens from a pencil.
    const [focusKey, setFocusKey] = useState(null)
    const settings = useStoreState(settingsStore)
    const labels = useLabelState()

    const groups = buildGroups(data?.periodTypes?.periodTypes)
    const allowedSet = new Set(namesFromList(allowedPeriodTypes))

    useEffect(() => {
        if (data?.dataOutputPeriodTypes) {
            setAllowedPeriodTypes(data.dataOutputPeriodTypes)
            configOptionStore.setState({
                ...configOptionStore.state,
                dataOutputPeriodTypes: data.dataOutputPeriodTypes,
            })
        }
    }, [data?.dataOutputPeriodTypes])

    // With exactly one usable type left, relative periods follow it.
    useEffect(() => {
        const allowed = new Set(namesFromList(allowedPeriodTypes))
        groups.forEach(({ family, types }) => {
            if (!family.startSetting) {
                return
            }
            const enabled = types.filter(
                (type) =>
                    allowed.has(type.name) && seedValueFor(family, type.name)
            )
            if (enabled.length !== 1) {
                return
            }
            const onlyValue = seedValueFor(family, enabled[0].name)
            if (settings?.[family.startSetting] !== onlyValue) {
                settingsActions.saveKey(family.startSetting, onlyValue)
            }
        })
        // groups is derived from data on every render; data is the real dependency.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allowedPeriodTypes, settings, data])

    const openTab = (next) => {
        setFocusKey(null)
        setTab(next)
    }

    const handlePeriodTypeToggle = async (
        periodTypeName,
        isCurrentlyEnabled
    ) => {
        const currentAllowedSet = new Set(namesFromList(allowedPeriodTypes))

        if (isCurrentlyEnabled) {
            currentAllowedSet.delete(periodTypeName)
        } else {
            currentAllowedSet.add(periodTypeName)
        }

        const updatedPeriodTypes = Array.from(currentAllowedSet).map(
            (name) => ({
                name,
            })
        )

        setUpdating(true)
        try {
            const response = await fetch(
                `${baseUrl}/api/${apiVersion}/configuration/dataOutputPeriodTypes`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(updatedPeriodTypes),
                }
            )

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            setAllowedPeriodTypes(updatedPeriodTypes)
            configOptionStore.setState({
                ...configOptionStore.state,
                dataOutputPeriodTypes: updatedPeriodTypes,
            })
            settingsActions.showSnackbarMessage(i18n.t('Settings updated'))
        } catch (error) {
            console.error('Failed to update period types:', error)
            settingsActions.showSnackbarMessage(
                i18n.t(
                    'There was a problem updating settings. Changes have not been saved.'
                )
            )
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }

    return (
        <div className={styles.wrapper}>
            <TabBar>
                <Tab
                    selected={tab === 'availability'}
                    onClick={() => openTab('availability')}
                >
                    {i18n.t('Availability for analysis')}
                </Tab>
                <Tab
                    selected={tab === 'names'}
                    onClick={() => openTab('names')}
                >
                    {i18n.t('Display names')}
                </Tab>
            </TabBar>
            <div className={styles.tabBody}>
                {tab === 'availability' ? (
                    <>
                        <AvailabilityTable
                            groups={groups}
                            allowedSet={allowedSet}
                            settings={settings}
                            labels={labels}
                            updating={updating}
                            onToggle={handlePeriodTypeToggle}
                            onRename={(key) => {
                                setFocusKey(key)
                                setTab('names')
                            }}
                        />
                        <div className={styles.defaultRelative}>
                            <DefaultRelativePeriod />
                        </div>
                    </>
                ) : (
                    <PeriodNames
                        groups={groups}
                        allowedSet={allowedSet}
                        settings={settings}
                        labels={labels}
                        focusKey={focusKey}
                    />
                )}
            </div>
        </div>
    )
}

export default PeriodTypes
