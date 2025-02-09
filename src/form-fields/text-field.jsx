import TextField from 'material-ui/TextField'
import PropTypes from 'prop-types'
import React from 'react'

const helpTextStyle = {
    fontSize: '12px',
    color: 'rgba(0, 0, 0, 0.3)',
    margin: '-4px 0 0',
}

class TextFieldComponent extends React.Component {
    static propTypes = {
        helpText: PropTypes.node,
        multiLine: PropTypes.bool,
        value: PropTypes.string,
    }

    static defaultProps = {
        value: '',
        multiLine: false,
        helpText: '',
    }

    constructor(props) {
        super(props)

        this.onChange = this.onChange.bind(this)
    }

    state = {
        value: this.props.value,
    }

    UNSAFE_componentWillReceiveProps(props) {
        this.setState({ value: props.value })
    }

    onChange(e) {
        this.setState({ value: e.target.value })
    }

    render() {
        /* eslint-disable no-unused-vars, react/prop-types */
        const { changeEvent, isRequired, defaultValue, helpText, ...other } =
            this.props
        /* eslint-enable no-unused-vars, react/prop-types */
        const errorStyle = {
            lineHeight: this.props.multiLine ? '48px' : '12px',
            marginTop: this.props.multiLine ? -16 : 0,
        }

        return (
            <div>
                <TextField
                    errorStyle={errorStyle}
                    {...other}
                    value={this.state.value}
                    onChange={this.onChange}
                />
                {helpText && <p style={helpTextStyle}>{helpText}</p>}
            </div>
        )
    }
}

export default TextFieldComponent
