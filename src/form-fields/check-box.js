import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from 'material-ui/Checkbox';

const sectionLabelStyle = {
    color: 'rgba(0, 0, 0, 0.3)',
    fontSize: '12px',
    margin: '16px 0 6px 0',
}

/* eslint-disable react/prefer-stateless-function */
class CheckBox extends React.Component {
    render() {
        const { errorText, errorStyle, onChange, sectionLabel, value, ...other } = this.props

        return (
            <div style={{ marginTop: 12, marginBottom: 12 }}>
                {sectionLabel && <p style={sectionLabelStyle}>{sectionLabel}</p>}
                <Checkbox onCheck={onChange} checked={value === 'true'} {...other} />
            </div>
        )
    }
}
/* eslint-enable */

CheckBox.propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
    errorText: PropTypes.string,
    sectionLabel: PropTypes.string,
    errorStyle: PropTypes.object,

};

CheckBox.defaultProps = {
    value: 'false',
    errorText: undefined,
    errorStyle: undefined,
    sectionLabel: undefined,
};

export default CheckBox;
