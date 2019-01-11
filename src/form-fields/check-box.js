import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from 'material-ui/Checkbox';
import applyMuiThemeContext from '../mui-theme.HOC.js'
import MuiThemeMixin from '../mui-theme.mixin';

class CheckBox extends React.Component {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
    }

    render() {
        const { errorText, errorStyle, ...other } = this.props; // eslint-disable-line
        return (
            <div style={{ marginTop: 12, marginBottom: 12 }}>
                <Checkbox onCheck={this.props.onChange} {...other} />
            </div>
        );
    }
}

const CheckBoxWithMuiTheme = applyMuiThemeContext(
  CheckBox,
);

export default CheckBoxWithMuiTheme;
