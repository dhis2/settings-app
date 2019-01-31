import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from 'material-ui/Checkbox';

const CheckBox = ({ errorText, errorStyle, onChange, value, ...other }) => (
    <div style={{ marginTop: 12, marginBottom: 12 }}>
        <Checkbox onCheck={onChange} checked={value === 'true'} {...other} />
    </div>
);

CheckBox.propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
    errorText: PropTypes.string,
    errorStyle: PropTypes.object,

};

CheckBox.defaultProps = {
    value: 'false',
    errorText: undefined,
    errorStyle: undefined,
};

export default CheckBox;
