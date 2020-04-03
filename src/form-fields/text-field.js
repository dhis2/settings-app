import React from 'react';
import TextField from 'material-ui/TextField';

const helpTextStyle = {
    fontSize: '12px',
    color: 'rgba(0, 0, 0, 0.3)',
    margin: '-4px 0 0',
}

class TextFieldComponent extends React.Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.state = {
            value: props.value,
        }
    }

    componentWillReceiveProps(props) {
        this.setState({ value: props.value });
    }

    onChange(e) {
        this.setState({ value: e.target.value });
    }

    render() {
        const { changeEvent, isRequired, defaultValue, helpText, ...other } = this.props; // eslint-disable-line
        const errorStyle = {
            lineHeight: this.props.multiLine ? '48px' : '12px',
            marginTop: this.props.multiLine ? -16 : 0,
        };

        return (
          <div>
            <TextField errorStyle={errorStyle} {...other} value={this.state.value} onChange={this.onChange} />
            {helpText && <p style={helpTextStyle}>{helpText}</p>}
          </div>
        );
    }
}

TextFieldComponent.propTypes = {
    value: React.PropTypes.string,
    multiLine: React.PropTypes.bool,
    helpText: React.PropTypes.node,
}

TextFieldComponent.defaultProps = {
    value: '',
    multiLine: false,
    helpText: '',
}

export default TextFieldComponent;
