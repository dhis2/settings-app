import React from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import MuiThemeMixin from '../mui-theme.mixin';

export default React.createClass({
    propTypes: {
        defaultValue: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number,
            React.PropTypes.bool,
        ]),
        value: React.PropTypes.string.isRequired,
        onFocus: React.PropTypes.func,
        onBlur: React.PropTypes.func,
        onChange: React.PropTypes.func,
        menuItems: React.PropTypes.oneOfType([
            React.PropTypes.array,
            React.PropTypes.object,
        ]),
        includeEmpty: React.PropTypes.bool,
        emptyLabel: React.PropTypes.string,
        noOptionsLabel: React.PropTypes.string,
    },

    mixins: [MuiThemeMixin],

    getDefaultProps() {
        return {
            includeEmpty: false,
            emptyLabel: '',
        };
    },

    handleChange(event, index, value) {
        this.props.onChange({ target: { value } });
    },

    renderMenuItems(menuItems) {
        if (this.props.includeEmpty) {
            menuItems.unshift({ id: 'null', displayName: this.props.emptyLabel });
        }

        return menuItems.map(item => (<MenuItem key={item.id} value={item.id} primaryText={item.displayName} />));
    },

    renderEmptyItem() {
        if (this.props.includeEmpty) {
            return <MenuItem value="null" primaryText={this.props.emptyLabel} />;
        }

        return null;
    },

    render() {
        const {
            onFocus, onBlur, onChange, value, disabled, menuItems,  // eslint-disable-line
            includeEmpty, emptyLabel, noOptionsLabel, isRequired,   // eslint-disable-line
            ...other } = this.props;
        const menuItemArray = (Array.isArray(menuItems) && menuItems) || menuItems.toArray();
        const hasOptions = menuItemArray.length > 0;

        return (
            <SelectField
                value={hasOptions ? this.props.value : 1}
                onChange={this.handleChange}
                disabled={!hasOptions}
                {...other}
            >
                {hasOptions
                    ? this.renderMenuItems(menuItemArray)
                    : <MenuItem value={1} primaryText={this.props.noOptionsLabel || '-'} />
                }
            </SelectField>
        );
    },
});
