import {
    Button,
    ButtonStrip,
    Modal,
    ModalContent,
    ModalActions,
    ModalTitle,
    SingleSelectField,
    SingleSelectOption,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'

const helpTextStyle = {
    fontSize: '12px',
    color: '#d32f2f',
    margin: '-4px 0 0',
}

class DropDown extends React.Component {
    static propTypes = {
        value: PropTypes.string.isRequired,
        disabled: PropTypes.bool,
        emptyLabel: PropTypes.string,
        floatingLabelText: PropTypes.node,
        helpText: PropTypes.node,
        includeEmpty: PropTypes.bool,
        menuItems: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
        noOptionsLabel: PropTypes.string,
        style: PropTypes.object,
        warning: PropTypes.object,
        onChange: PropTypes.func,
    }

    static defaultProps = {
        includeEmpty: false,
        emptyLabel: '',
        menuItems: [],
        noOptionsLabel: '',
        warning: undefined,
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

    handleChange({ selected }) {
        if (this.props.warning) {
            this.setState({ warningModalOpen: true, pendingValue: selected })
        } else {
            this.props.onChange({ target: { value: selected } })
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

    getOptionItems() {
        const { menuItems, includeEmpty, emptyLabel } = this.props
        return includeEmpty
            ? [{ id: 'null', displayName: emptyLabel }, ...menuItems]
            : menuItems
    }

    renderOptions() {
        return this.getOptionItems().map((item) => (
            <SingleSelectOption
                key={item.id}
                value={String(item.id)}
                label={item.displayName}
            />
        ))
    }

    render() {
        const {
            value,
            disabled,
            menuItems,
            noOptionsLabel,
            floatingLabelText,
            helpText,
            warning,
            style,
        } = this.props
        const hasOptions = menuItems.length > 0

        // @dhis2/ui SingleSelect throws if `selected` has no matching option.
        // Stored values may be stale (e.g. a legacy caching factor), so only
        // pass `selected` when it matches an existing option.
        const stringValue = String(value ?? '')
        const selected = this.getOptionItems().some(
            (item) => String(item.id) === stringValue
        )
            ? stringValue
            : ''

        return (
            <>
                {this.state.warningModalOpen && warning && (
                    <Modal onClose={this.closeWarningModal}>
                        <ModalTitle>{warning.title}</ModalTitle>
                        <ModalContent>{warning.body}</ModalContent>
                        <ModalActions>
                            <ButtonStrip end>
                                <Button onClick={this.closeWarningModal}>
                                    {warning.cancel}
                                </Button>
                                <Button
                                    destructive
                                    onClick={this.confirmProceedAfterWarning}
                                >
                                    {warning.proceed}
                                </Button>
                            </ButtonStrip>
                        </ModalActions>
                    </Modal>
                )}

                <div style={style}>
                    <SingleSelectField
                        label={floatingLabelText}
                        selected={hasOptions ? selected : '__none'}
                        disabled={!hasOptions || disabled}
                        onChange={this.handleChange}
                    >
                        {hasOptions ? (
                            this.renderOptions()
                        ) : (
                            <SingleSelectOption
                                value="__none"
                                label={noOptionsLabel || '-'}
                            />
                        )}
                    </SingleSelectField>
                    {helpText && <p style={helpTextStyle}>{helpText}</p>}
                </div>
            </>
        )
    }
}

export default DropDown
