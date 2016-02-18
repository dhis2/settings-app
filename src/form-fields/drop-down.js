import React from 'react';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';

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
    },

    mixins: [MuiThemeMixin],

    getDefaultProps() {
        return {
            includeEmpty: false,
            emptyLabel: '',
        };
    },

    renderMenuItems(menuItems) {
        if (this.props.includeEmpty) {
            menuItems.unshift(menuItems.length > 0 && !!menuItems[0].id ? {id: 'null', displayName: this.props.emptyLabel} : {payload: 'null', text: this.props.emptyLabel});
        }

        if (!!menuItems) {
            return menuItems.map(item => {
                return !!item.id ?
                    (<MenuItem key={item.id} value={item.id} primaryText={item.displayName} />) :
                    (<MenuItem key={item.payload} value={item.payload} primaryText={item.text} />);
            });
        }
    },

    renderEmptyItem() {
        if (this.props.includeEmpty) {
            return <MenuItem value="null" primaryText={this.props.emptyLabel}/>;
        }
    },

    render() {
        const {onFocus, onBlur, onChange, menuItems, ...other} = this.props;
        return (
            <SelectField
                value={this.props.value}
                onChange={this.handleChange}
                {...other}>
                {this.renderMenuItems(Array.isArray(menuItems) ? menuItems : menuItems.toArray())}
            </SelectField>
        );
    },

    handleChange(event, index, value) {
        this.props.onChange({target: {value: value}});
    },
});
