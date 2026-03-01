import i18n from '@dhis2/d2-i18n'
import Sidebar from 'd2-ui/lib/sidebar/Sidebar.component.js'
import createHistory from 'history/createHashHistory.js'
import Snackbar from 'material-ui/Snackbar'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider.js'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './App.module.css'
import configOptionStore from './configOptionStore.js'
import settingsActions from './settingsActions.js'
import {
    categoryOrder,
    categories,
    filterCategoryOrderByApiVersion,
    filterCategoriesByApiVersion,
    filterSettingsByApiVersion,
} from './settingsCategories.js'
import SettingsFields from './settingsFields.component.jsx'
import appTheme from './theme.js'

class AppComponent extends React.Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            category: categoryOrder[0],
            currentSettings: filterSettingsByApiVersion({
                settings: categories[categoryOrder[0]].settings.map(
                    (s) => s.setting
                ),
                apiVersion: props.apiVersion,
            }),
            snackbarMessage: '',
            showSnackbar: false,
            formValidator: undefined,
            filteredCategoryOrder: [],
            filteredCategories: {},
        }

        this.sidebarRef = React.createRef()
    }

    getChildContext() {
        return {
            d2: this.props.d2,
            muiTheme: appTheme,
        }
    }

    componentDidMount() {
        settingsActions.load({ apiVersion: this.props.apiVersion })
        this.subscriptions = []

        this.subscriptions.push(
            configOptionStore.subscribe(() => {
                // Must force update here in order to redraw form fields that require config options
                // TODO: Replace this with async select fields
                this.forceUpdate()
            })
        )

        this.subscriptions.push(
            settingsActions.setCategory.subscribe((arg) => {
                const category = arg.data.key || arg.data || categoryOrder[0]
                const searchResult = arg.data.settings || []
                const currentSettings =
                    category === 'search'
                        ? searchResult
                        : categories[category].settings

                if (category !== 'search') {
                    this.sidebarRef.current.clearSearchBox()
                }

                const pathname = `/${category}`
                const search =
                    category === 'search'
                        ? `?${encodeURIComponent(
                              arg.data.searchTerms.join(' ')
                          )}`
                        : ''

                if (
                    pathname !== this.history.location.pathname ||
                    search !== this.history.location.search
                ) {
                    this.history.push({ pathname, search })
                }

                this.setState({
                    category,
                    currentSettings: filterSettingsByApiVersion({
                        settings: currentSettings,
                        apiVersion: this.props.apiVersion,
                    }),
                    searchText:
                        category === 'search' ? this.state.searchText : '',
                })
            })
        )

        this.subscriptions.push(
            settingsActions.showSnackbarMessage.subscribe((params) => {
                const message = params.data
                this.setState({
                    snackbarMessage: message,
                    showSnackbar: !!message,
                })
            })
        )

        // Filter categories based on apiVersion
        const { apiVersion } = this.props
        const filteredCategoryOrder = filterCategoryOrderByApiVersion({
            categoryOrder,
            categories,
            apiVersion,
        })

        const filteredCategories = filterCategoriesByApiVersion({
            categories,
            apiVersion,
        })

        this.setState({
            filteredCategoryOrder,
            filteredCategories,
            category: filteredCategoryOrder[0],
            currentSettings: filterSettingsByApiVersion({
                settings: filteredCategories[filteredCategoryOrder[0]].settings,
                apiVersion: apiVersion,
            }),
        })

        // Helper function for setting app state based on location using filtered categories
        const navigate = (location) => {
            const section = location.pathname.substr(1)
            if (location.pathname === '/search') {
                const search = decodeURIComponent(location.search.substr(1))
                this.doSearch(search)
            } else if (Object.keys(filteredCategories).includes(section)) {
                settingsActions.setCategory(section)
            } else {
                this.history.replace(`/${filteredCategoryOrder[0]}`)
                settingsActions.setCategory(filteredCategoryOrder[0])
            }
        }

        // Listen for location changes and update app state as necessary
        this.history = createHistory()
        this.unlisten = this.history.listen((location, action) => {
            if (action === 'POP') {
                navigate(location)
            }
        })

        // Set initial app state based on current location
        navigate(this.history.location)
    }

    componentWillUnmount() {
        this.subscriptions.forEach((sub) => {
            sub.unsubscribe()
        })

        if (typeof this.unlisten === 'function') {
            this.unlisten()
        }
    }

    closeSnackbar = () => {
        this.setState({ showSnackbar: false })
    }

    doSearch = (searchText) => {
        this.setState({ searchText })
        settingsActions.searchSettings(searchText)
    }

    render() {
        const { filteredCategoryOrder, filteredCategories } = this.state

        const sections = filteredCategoryOrder.map((category) => {
            const key = category
            const label = filteredCategories[category].label
            const icon = filteredCategories[category].icon
            return { key, label, icon }
        })

        return (
            <MuiThemeProvider muiTheme={appTheme}>
                <div>
                    <Snackbar
                        message={this.state.snackbarMessage || ''}
                        autoHideDuration={1250}
                        open={this.state.showSnackbar}
                        onRequestClose={this.closeSnackbar}
                    />
                    <div className={styles.contentWrap}>
                        <Sidebar
                            sections={sections}
                            onChangeSection={settingsActions.setCategory}
                            currentSection={this.state.category}
                            showSearchField
                            searchFieldLabel={i18n.t('Search settings')}
                            ref={this.sidebarRef}
                            onChangeSearchText={this.doSearch}
                            searchText={this.state.searchText}
                        />
                        <form autoComplete="off" className={styles.contentArea}>
                            <SettingsFields
                                category={this.state.category}
                                currentSettings={this.state.currentSettings}
                                apiVersion={this.props.apiVersion}
                            />
                        </form>
                    </div>
                </div>
            </MuiThemeProvider>
        )
    }
}

AppComponent.propTypes = {
    apiVersion: PropTypes.number.isRequired,
    d2: PropTypes.object.isRequired,
}
AppComponent.contextTypes = { muiTheme: PropTypes.object }
AppComponent.childContextTypes = {
    d2: PropTypes.object,
    muiTheme: PropTypes.object,
}

export default AppComponent
