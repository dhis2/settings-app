import CheckboxMaterial from 'material-ui/Checkbox'
import PropTypes from 'prop-types'
import React from 'react'

const sectionLabelStyle = {
    color: 'rgba(0, 0, 0, 0.3)',
    fontSize: '12px',
    margin: '16px 0 6px 0',
}

class Checkbox extends React.Component {
    render() {
        /* eslint-disable no-unused-vars */
        const {
            errorText,
            errorStyle,
            onChange,
            sectionLabel,
            value,
            ...other
        } = this.props
        /* eslint-enable no-unused-vars */

        return (
            <div style={{ marginTop: 12, marginBottom: 12 }}>
                {sectionLabel && (
                    <p style={sectionLabelStyle}>{sectionLabel}</p>
                )}
                <CheckboxMaterial
                    onCheck={onChange}
                    checked={value === 'true'}
                    {...other}
                />
            </div>
        )
    }
}

Checkbox.propTypes = {
    onChange: PropTypes.func.isRequired,
    errorStyle: PropTypes.object,
    errorText: PropTypes.string,
    sectionLabel: PropTypes.string,
    value: PropTypes.string,
}

Checkbox.defaultProps = {
    value: 'false',
}

export default Checkbox
