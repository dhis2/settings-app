import React from 'react';
import PropTypes from 'prop-types';
import createHistory from 'history/createHashHistory';

// Material UI
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Snackbar from 'material-ui/Snackbar';

// D2 UI
import Sidebar from 'd2-ui/lib/sidebar/Sidebar.component';
import HeaderBar from '@dhis2/d2-ui-header-bar';

// App
import SettingsFields from './settingsFields.component';
import appTheme from './theme';

import settingsActions from './settingsActions';
import { categoryOrder, categories } from './settingsCategories';
import configOptionStore from './configOptionStore';


class AppComponent extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            category: categoryOrder[0],
            currentSettings: categories[categoryOrder[0]].settings,
            snackbarMessage: '',
            showSnackbar: false,
            formValidator: undefined,
        };

        this.closeSnackbar = this.closeSnackbar.bind(this);
        this.doSearch = this.doSearch.bind(this);
    }

    getChildContext() {
        return {
            d2: this.props.d2,
            muiTheme: appTheme,
        };
    }

    componentDidMount() {
        this.subscriptions = [];

        this.subscriptions.push(configOptionStore.subscribe(() => {
            // Must force update here in order to redraw form fields that require config options
            // TODO: Replace this with async select fields
            this.forceUpdate();
        }));

        /* eslint-disable complexity */
        this.subscriptions.push(settingsActions.setCategory.subscribe((arg) => {
            const category = arg.data.key || arg.data || categoryOrder[0];
            const searchResult = arg.data.settings || [];
            const currentSettings = category === 'search' ? searchResult : categories[category].settings;

            if (category !== 'search') {
                this.sidebar.clearSearchBox();
            }

            const pathname = `/${category}`;
            const search = category === 'search'
                ? `?${encodeURIComponent(arg.data.searchTerms.join(' '))}`
                : '';

            if (pathname !== this.history.location.pathname || search !== this.history.location.search) {
                this.history.push({ pathname, search });
            }

            this.setState({
                category,
                currentSettings,
                searchText: category === 'search' ? this.state.searchText : '',
            });
        }));
        /* eslint-enable complexity */

        this.subscriptions.push(settingsActions.showSnackbarMessage.subscribe((params) => {
            const message = params.data;
            this.setState({ snackbarMessage: message, showSnackbar: !!message });
        }));

        // Helper function for setting app state based on location
        const navigate = (location) => {
            const section = location.pathname.substr(1);
            if (location.pathname === '/search') {
                const search = decodeURIComponent(location.search.substr(1));
                this.doSearch(search);
            } else if (Object.keys(categories).includes(section)) {
                settingsActions.setCategory(section);
            } else {
                this.history.replace(`/${categoryOrder[0]}`);
                settingsActions.setCategory(categoryOrder[0]);
            }
        };

        // Listen for location changes and update app state as necessary
        this.history = createHistory();
        this.unlisten = this.history.listen((location, action) => {
            if (action === 'POP') {
                navigate(location);
            }
        });

        // Set initial app state based on current location
        navigate(this.history.location);
    }

    componentWillUnmount() {
        this.subscriptions.forEach((sub) => {
            sub.dispose();
        });

        if (typeof this.unlisten === 'function') {
            this.unlisten();
        }
    }

    closeSnackbar() {
        this.setState({ showSnackbar: false });
    }

    doSearch(searchText) {
        this.setState({ searchText });
        settingsActions.searchSettings(searchText);
    }

    render() {
        const sections = Object.keys(categories).map((category) => {
            const key = category;
            const label = this.props.d2.i18n.getTranslation(categories[category].label);
            const icon = categories[category].icon;
            return { key, label, icon };
        });
        const setSidebar = (ref) => {
            this.sidebar = ref;
        };

        return (
            <MuiThemeProvider muiTheme={appTheme}>
                <div className="app">
                    <HeaderBar d2={this.props.d2} />
                    <Snackbar
                        message={this.state.snackbarMessage || ''}
                        autoHideDuration={1250}
                        open={this.state.showSnackbar}
                        onRequestClose={this.closeSnackbar}
                    />
                    <Sidebar
                        sections={sections}
                        onChangeSection={settingsActions.setCategory}
                        currentSection={this.state.category}
                        showSearchField
                        searchFieldLabel={this.props.d2.i18n.getTranslation('search_settings')}
                        ref={setSidebar}
                        onChangeSearchText={this.doSearch}
                        searchText={this.state.searchText}
                    />

                    <SettingsFields category={this.state.category} currentSettings={this.state.currentSettings} />
                </div>
            </MuiThemeProvider>
        );
    }
}

AppComponent.propTypes = { d2: PropTypes.object.isRequired };
AppComponent.contextTypes = { muiTheme: PropTypes.object };
AppComponent.childContextTypes = { d2: PropTypes.object, muiTheme: PropTypes.object };

export default AppComponent;
