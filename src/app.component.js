import React from 'react';

// Material UI
import Snackbar from 'material-ui/lib/snackbar';

// D2 UI
import HeaderBarComponent from 'd2-ui/lib/app-header/HeaderBar';
import headerBarStore$ from 'd2-ui/lib/app-header/headerBar.store';
import withStateFrom from 'd2-ui/lib/component-helpers/withStateFrom';
import Sidebar from 'd2-ui/lib/sidebar/Sidebar.component';

// App
import SettingsFields from './settingsFields.component.js';
import MuiThemeMixin from './mui-theme.mixin.js';
import AppTheme from './theme';

import settingsActions from './settingsActions';
import { categoryOrder, categories } from './settingsCategories';
import configOptionStore from './configOptionStore';


const HeaderBar = withStateFrom(headerBarStore$, HeaderBarComponent);

const styles = {
    header: {
        fontSize: 24,
        fontWeight: 300,
        color: AppTheme.rawTheme.palette.textColor,
        padding: '24px 0 12px 16px',
    },
    card: {
        marginTop: 8,
        marginRight: '1rem',
        padding: '0 1rem',
    },
    cardTitle: {
        background: AppTheme.rawTheme.palette.primary2Color,
        height: 62,
    },
    cardTitleText: {
        fontSize: 28,
        fontWeight: 100,
        color: AppTheme.rawTheme.palette.alternateTextColor,
    },
    noHits: {
        padding: '1rem',
        marginTop: '1rem',
        fontWeight: 300,
    },
    userSettingsOverride: {
        color: AppTheme.rawTheme.palette.accent1Color,
        marginTop: -6,
        fontSize: '0.8rem',
        fontWeight: 400,
    },
    menuIcon: {
        color: '#757575',
    },
    menuLabel: {
        position: 'relative',
        top: -6,
        marginLeft: 16,
    },
};

// TODO: Rewrite as ES6 class
/* eslint-disable react/prefer-es6-class */
export default React.createClass({
    propTypes: {
        d2: React.PropTypes.object.isRequired,
    },

    childContextTypes: {
        d2: React.PropTypes.object,
    },

    mixins: [MuiThemeMixin],

    getInitialState() {
        return {
            category: categoryOrder[0],
            currentSettings: categories[categoryOrder[0]].settings,
            snackbarMessage: '',
            showSnackbar: false,
            formValidator: undefined,
        };
    },

    getChildContext() {
        return {
            d2: this.props.d2,
        };
    },

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
            this.setState({ category, currentSettings });
        }));
        /* eslint-enable complexity */

        this.subscriptions.push(settingsActions.showSnackbarMessage.subscribe(params => {
            const message = params.data;
            this.setState({ snackbarMessage: message, showSnackbar: !!message });
        }));
    },

    componentWillUnmount() {
        this.subscriptions.forEach(sub => {
            sub.dispose();
        });
    },

    closeSnackbar() {
        this.setState({ showSnackbar: false });
    },

    render() {
        const sections = Object.keys(categories).map(category => {
            const key = category;
            const label = this.props.d2.i18n.getTranslation(categories[category].label);
            const icon = categories[category].icon;
            return { key, label, icon };
        });
        const setSidebar = (ref) => {
            this.sidebar = ref;
        };

        return (
            <div className="app">
                <HeaderBar />
                <Snackbar
                    message={this.state.snackbarMessage || ''}
                    autoHideDuration={1250}
                    open={this.state.showSnackbar}
                    onRequestClose={this.closeSnackbar}
                    style={{ left: 24, right: 'inherit' }}
                />
                <Sidebar
                    sections={sections}
                    onChangeSection={settingsActions.setCategory}
                    currentSection={this.state.category}
                    showSearchField
                    searchFieldLabel={this.props.d2.i18n.getTranslation('search_settings')}
                    ref={setSidebar}
                    onChangeSearchText={settingsActions.searchSettings}
                />

                <SettingsFields category={this.state.category} currentSettings={this.state.currentSettings} />
            </div>
        );
    },
});
