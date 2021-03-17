import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'
import PropTypes from 'prop-types'
import React from 'react'

class DropDown extends React.Component {
    static propTypes = {
        value: PropTypes.string.isRequired,
        defaultValue: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
            PropTypes.bool,
        ]),
        emptyLabel: PropTypes.string,
        includeEmpty: PropTypes.bool,
        menuItems: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
        noOptionsLabel: PropTypes.string,
        onBlur: PropTypes.func,
        onChange: PropTypes.func,
        onFocus: PropTypes.func,
    }

    static defaultProps = {
        defaultValue: '',
        includeEmpty: false,
        emptyLabel: '',
        menuItems: [],
        noOptionsLabel: '',

        onFocus: undefined,
        onBlur: undefined,
        onChange: undefined,
    }

    constructor(props) {
        super(props)

        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(event, index, value) {
        this.props.onChange({ target: { value } })
    }

    renderMenuItems(menuItems) {
        if (this.props.includeEmpty) {
            menuItems = [
                {
                    id: 'null',
                    displayName: this.props.emptyLabel,
                },
                ...menuItems,
            ]
        }

        return menuItems.map(item => (
            <MenuItem
                key={item.id}
                value={item.id}
                primaryText={item.displayName}
            />
        ))
    }

    render() {
        const {
            onFocus, onBlur, onChange, value, disabled, menuItems,  // eslint-disable-line
            includeEmpty, emptyLabel, noOptionsLabel, isRequired,   // eslint-disable-line
            ...other
        } = this.props
        const hasOptions = menuItems.length > 0
        return (
            <SelectField
                value={hasOptions ? this.props.value : 1}
                onChange={this.handleChange}
                disabled={!hasOptions || disabled}
                {...other}
            >
                {hasOptions ? (
                    this.renderMenuItems(menuItems)
                ) : (
                    <MenuItem
                        value={1}
                        primaryText={this.props.noOptionsLabel || '-'}
                    />
                )}
            </SelectField>
        )
    }
}

export default DropDown
