import { InputField, TextAreaField } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'

class TextFieldComponent extends React.Component {
    static propTypes = {
        errorText: PropTypes.string,
        floatingLabelText: PropTypes.node,
        helpText: PropTypes.node,
        hintText: PropTypes.string,
        multiLine: PropTypes.bool,
        value: PropTypes.string,
        onBlur: PropTypes.func,
        onChange: PropTypes.func,
    }

    static defaultProps = {
        value: '',
        multiLine: false,
        helpText: '',
    }

    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.onBlur = this.onBlur.bind(this)
    }

    state = {
        value: this.props.value,
    }

    UNSAFE_componentWillReceiveProps(props) {
        this.setState({ value: props.value })
    }

    onChange({ value }) {
        this.setState({ value })
        if (this.props.onChange) {
            this.props.onChange({ target: { value } })
        }
    }

    onBlur({ value }) {
        if (this.props.onBlur) {
            this.props.onBlur({ target: { value } })
        }
    }

    render() {
        /* eslint-disable no-unused-vars, react/prop-types */
        const {
            changeEvent,
            isRequired,
            defaultValue,
            helpText,
            hintText,
            floatingLabelText,
            multiLine,
            rowsMax,
            errorText,
            errorStyle,
            value,
            onChange,
            onBlur,
            style,
            type,
            min,
            max,
            ...other
        } = this.props
        /* eslint-enable no-unused-vars, react/prop-types */

        const Field = multiLine ? TextAreaField : InputField

        return (
            <div style={style}>
                <Field
                    label={floatingLabelText}
                    placeholder={hintText}
                    helpText={helpText || undefined}
                    error={!!errorText}
                    validationText={errorText || undefined}
                    type={multiLine ? undefined : type}
                    min={min}
                    max={max}
                    value={this.state.value}
                    onChange={this.onChange}
                    onBlur={this.onBlur}
                    {...other}
                />
            </div>
        )
    }
}

export default TextFieldComponent
