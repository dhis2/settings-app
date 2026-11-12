import Store from 'd2-ui/lib/store/Store.js'
import { useState, useEffect } from 'react'

// PROTOTYPE: localStorage-backed label store. Replace this file to move to a
// real endpoint — nothing outside it knows where labels are kept.

const STORAGE_KEY = 'settings-app-prototype-period-labels'

const emptyState = {
    // Locale ids the user has added as columns, e.g. ['nb']
    languages: [],
    // { [periodTypeName]: { default: string, [localeId]: string } }
    periodTypes: {},
    // { [relativePeriodId]: { default: string, [localeId]: string } }
    relativePeriods: {},
}

const read = () => {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        return raw ? { ...emptyState, ...JSON.parse(raw) } : emptyState
    } catch (error) {
        console.error('Could not read prototype labels', error)
        return emptyState
    }
}

const labelStore = Store.create()
labelStore.setState(read())

const persist = (state) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        labelStore.setState(state)
    } catch (error) {
        console.error('Could not persist prototype labels', error)
    }
}

// Empty and whitespace-only are the same thing: no custom label.
const clean = (value) => (value || '').trim()

const setIn = ({ group, id, languageKey, value }) => {
    const state = labelStore.getState()
    const entry = { ...(state[group][id] || {}) }

    if (clean(value)) {
        entry[languageKey] = value
    } else {
        delete entry[languageKey]
    }

    // The entry is kept even when empty. In section 2 an empty entry is what
    // holds a row on screen while the user is still deciding what to type.
    persist({ ...state, [group]: { ...state[group], [id]: entry } })
}

export const setPeriodTypeLabel = (name, languageKey, value) =>
    setIn({ group: 'periodTypes', id: name, languageKey, value })

export const setRelativePeriodLabel = (id, languageKey, value) =>
    setIn({ group: 'relativePeriods', id, languageKey, value })

// Adds an empty row so a period type can be named. Stored as an empty object
// until the user types, which is what keeps section 2 additive.
export const addPeriodType = (name) => {
    const state = labelStore.getState()
    if (state.periodTypes[name]) {
        return
    }
    persist({
        ...state,
        periodTypes: { ...state.periodTypes, [name]: {} },
    })
}

export const removePeriodType = (name) => {
    const state = labelStore.getState()
    const periodTypes = { ...state.periodTypes }
    delete periodTypes[name]
    persist({ ...state, periodTypes })
}

export const addLanguage = (localeId) => {
    const state = labelStore.getState()
    if (state.languages.includes(localeId)) {
        return
    }
    persist({ ...state, languages: [...state.languages, localeId] })
}

export const removeLanguage = (localeId) => {
    const state = labelStore.getState()
    persist({
        ...state,
        languages: state.languages.filter((id) => id !== localeId),
    })
}

export const clearRelativePeriodSet = (relativePeriodIds) => {
    const state = labelStore.getState()
    const relativePeriods = { ...state.relativePeriods }
    relativePeriodIds.forEach((id) => delete relativePeriods[id])
    persist({ ...state, relativePeriods })
}

// Read-only snapshot access for code that only needs to look up a label
// (e.g. resolveLabel.js) without needing to mutate anything. Deliberately
// does not expose the raw store (see the removed default export) — this
// only ever returns getState()'s current value.
export const getLabelStoreState = () => labelStore.getState()

export const useLabelState = () => {
    const [state, setState] = useState(() => labelStore.getState())

    useEffect(() => {
        const subscription = labelStore.subscribe((next) => setState(next))
        return () => subscription.unsubscribe()
    }, [])

    return state
}
