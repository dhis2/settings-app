import {
    Button,
    ButtonStrip,
    Modal,
    ModalContent,
    ModalActions,
    ModalTitle,
} from '@dhis2/ui'
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
        warning: PropTypes.object,
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
        warning: undefined,

        onFocus: undefined,
        onBlur: undefined,
        onChange: undefined,
    }

    constructor(props) {
        super(props)
        this.state = { warningModalOpen: false, pendingValue: null }
        this.handleChange = this.handleChange.bind(this)
        this.closeWarningModal = this.closeWarningModal.bind(this)
        this.confirmProceedAfterWarning =
            this.confirmProceedAfterWarning.bind(this)
    }

    handleChange(event, index, value) {
        if (this.props.warning) {
            this.setState({ warningModalOpen: true, pendingValue: value })
        } else {
            this.props.onChange({ target: { value } })
        }
    }

    closeWarningModal() {
        this.setState({ warningModalOpen: false, pendingValue: null })
    }

    confirmProceedAfterWarning() {
        const value = this.state.pendingValue
        this.setState({ warningModalOpen: false, pendingValue: null })
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

        return menuItems.map((item) => (
            <MenuItem
                key={item.id}
                value={item.id}
                primaryText={item.displayName}
            />
        ))
    }

    render() {
        const {
            /* eslint-disable no-unused-vars, react/prop-types */
            onFocus,
            onBlur,
            onChange,
            value,
            disabled,
            menuItems,
            includeEmpty,
            emptyLabel,
            noOptionsLabel,
            isRequired,
            warning,
            /* eslint-enable no-unused-vars, react/prop-types */
            ...other
        } = this.props
        const hasOptions = menuItems.length > 0
        return (
            <>
                {this.state.warningModalOpen && (
                    <Modal onClose={this.closeWarningModal}>
                        <ModalTitle>{this.props.warning.title}</ModalTitle>
                        <ModalContent>{this.props.warning.body}</ModalContent>

                        <ModalActions>
                            <ButtonStrip end>
                                <Button onClick={this.closeWarningModal}>
                                    {this.props.warning.cancel}
                                </Button>
                                <Button
                                    destructive
                                    onClick={this.confirmProceedAfterWarning}
                                >
                                    {this.props.warning.proceed}
                                </Button>
                            </ButtonStrip>
                        </ModalActions>
                    </Modal>
                )}

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
            </>
        )
    }
}

export default DropDown
