import React from 'react';
import PropTypes from 'prop-types';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import applyMuiThemeContext from '../mui-theme.HOC.js'

class DropDown extends React.Component {
    static defaultProps = {
        includeEmpty: false,
        emptyLabel: '',
    };

    static propTypes = {
        defaultValue: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
            PropTypes.bool,
        ]),
        value: PropTypes.string.isRequired,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        onChange: PropTypes.func,
        menuItems: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.object,
        ]),
        includeEmpty: PropTypes.bool,
        emptyLabel: PropTypes.string,
        noOptionsLabel: PropTypes.string,
    }

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.renderEmptyItem = this.renderEmptyItem.bind(this);
        this.renderMenuItems = this.renderMenuItems.bind(this);
    }

    handleChange(event, index, value) {
        this.props.onChange({ target: { value } });
    }

    renderMenuItems(menuItems) {
        if (this.props.includeEmpty) {
            menuItems.unshift({ id: 'null', displayName: this.props.emptyLabel });
        }

        return menuItems.map(item => (<MenuItem key={item.id} value={item.id} primaryText={item.displayName} />));
    }

    renderEmptyItem() {
        if (this.props.includeEmpty) {
            return <MenuItem value="null" primaryText={this.props.emptyLabel} />;
        }

        return null;
    }

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
    }
}

const DropDownWithMuiTheme = applyMuiThemeContext(
  DropDown,
);

export default DropDownWithMuiTheme;
