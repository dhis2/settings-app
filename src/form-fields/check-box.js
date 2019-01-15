import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from 'material-ui/Checkbox';

/* eslint-disable react/prefer-stateless-function */
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
/* eslint-enable */

export default CheckBox;
