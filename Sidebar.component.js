import React from 'react';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import TextField from 'material-ui/lib/text-field';
import settingsActions from './settingsActions.js';
/* eslint react/no-multi-comp: 0 */

const MyListItem = React.createClass({
    propTypes: {
        label: React.PropTypes.string.isRequired,
        listStyle: React.PropTypes.object,
        settingsActions: React.PropTypes.object.isRequired,
        categoryKey: React.PropTypes.string.isRequired,
    },

    render() {
        const label = this.props.label;
        return (
            <ListItem
                primaryText={label}
                style={this.props.listStyle}
                onClick={this.setCategory}/>
        );
    },

    setCategory() {
        this.props.settingsActions.setCategory(this.props.categoryKey);
    },
});

const Sidebar = React.createClass({
    propTypes: {
        categories: React.PropTypes.object.isRequired,
        categoryOrder: React.PropTypes.array.isRequired,
        settingsActions: React.PropTypes.object.isRequired,
        d2: React.PropTypes.object.isRequired,
        currentCategory: React.PropTypes.oneOfType([
            React.PropTypes.object,
            React.PropTypes.string,
        ]).isRequired,
    },

    contextTypes: {
        muiTheme: React.PropTypes.object,
    },

    getInitialState() {
        return {
            searchValue: '',
        };
    },

    render() {
        const d2 = this.props.d2;
        const categories = this.props.categories;
        const categoryOrder = this.props.categoryOrder;
        const currentCategory = this.props.currentCategory;
        const theme = this.context.muiTheme;
        return (
            <div style={{backgroundColor: theme.sideBar.backgroundColor}} className="left-bar">
                <div style={{padding: '0 1rem'}}>
                    <TextField hintText={d2.i18n.getTranslation('search')} style={{width: '100%'}}
                               onChange={this.search}/>
                </div>
                <List style={{backgroundColor: 'transparent'}}>
                    {
                        categoryOrder
                            .filter(categoryKey => !(categories[categoryKey].authority && !d2.currentUser.authorities.has(categories[categoryKey].authority)))
                            .filter(() => !this.state.searchValue)
                            .map((categoryKey) => {
                                return (
                                    <MyListItem
                                        key={categoryKey}
                                        label={d2.i18n.getTranslation(categories[categoryKey].label)}
                                        categoryKey={categoryKey}
                                        settingsActions={this.props.settingsActions}
                                        listStyle={{
                                            backgroundColor: categoryKey === currentCategory ? theme.sideBar.backgroundColorItemActive : theme.sideBar.backgroundColorItem,
                                            color: categoryKey === currentCategory ? theme.sideBar.textColorActive : theme.sideBar.textColor,
                                            fontSize: 15,
                                        }}
                                        />
                                );
                            })
                    }
                </List>
            </div>
        );
    },

    search(event) {
        this.setState({
            searchValue: event.target.value,
        });
        settingsActions.searchSettings(event.target.value);
    },
});

export default Sidebar;
