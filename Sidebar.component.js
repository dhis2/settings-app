import React from 'react';

// Material UI

import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import RaisedButton from 'material-ui/lib/raised-button';
import Color from 'material-ui/lib/styles/colors';

const MyListItem = React.createClass({
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
    },

    render() {
        const d2 = this.props.d2;
        const categories = this.props.categories;
        const categoryOrder = this.props.categoryOrder;
        const currentCategory = this.props.currentCategory;
        return (
            <div className="left-bar">
                <List>
                {
                    categoryOrder.map((categoryKey) => {
                        if (categories[categoryKey].authority && !d2.currentUser.authorities.has(categories[categoryKey].authority)) {
                            return (<span></span>);
                        }

                        return (
                            <MyListItem
                                key={categoryKey}
                                label={d2.i18n.getTranslation(categories[categoryKey].label)}
                                categoryKey={categoryKey}
                                settingsActions={this.props.settingsActions}
                                listStyle={{
                                    backgroundColor: categoryKey === currentCategory ? Color.blue900 : Color.white,
                                    color: categoryKey === currentCategory ? Color.white : Color.black,
                                }}
                                />
                        );
                    })
                }
                </List>
                <RaisedButton
                    onClick={this.reload}
                    label="Refresh settings"
                    style={{marginLeft: 'auto', marginRight: 'auto'}}
                    />
            </div>
        );
    },

    reload() {
        this.props.settingsActions.load(true);
    },
});

export default Sidebar;
