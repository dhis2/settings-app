import React from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import applyMuiThemeContext from '../mui-theme.HOC.js'

class TextFieldComponent extends React.Component {
    static propTypes = {
        value: PropTypes.string,
        multiLine: PropTypes.bool,
    }

    state = {
        value: this.props.value,
    }

    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
    }
  
    componentWillReceiveProps(props) {
        this.setState({ value: props.value });
    }
  
    onChange(e) {
        this.setState({ value: e.target.value });
    }
  
    render() {
        const { changeEvent, isRequired, defaultValue, ...other } = this.props; // eslint-disable-line
        const errorStyle = {
            lineHeight: this.props.multiLine ? '48px' : '12px',
            marginTop: this.props.multiLine ? -16 : 0,
        };
  
        return (
            <TextField errorStyle={errorStyle} {...other} value={this.state.value} onChange={this.onChange} />
        );
    }
}

const TextFieldWithMuiTheme = applyMuiThemeContext(
  TextField,
);

export default TextFieldWithMuiTheme;
