import { Checkbox as CheckboxUI } from '@dhis2/ui'
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
            onCheck,
            sectionLabel,
            value,
            explanatoryText,
            style,
            ...other
        } = this.props
        /* eslint-enable no-unused-vars */

        return (
            <div>
                {sectionLabel && (
                    <p style={sectionLabelStyle}>{sectionLabel}</p>
                )}
                <CheckboxUI
                    checked={value === 'true'}
                    onChange={({ checked }, event) =>
                        (onCheck || onChange)(event, checked)
                    }
                    {...other}
                />
                {explanatoryText && (
                    <p style={{ fontSize: '12px' }}>{explanatoryText}</p>
                )}
            </div>
        )
    }
}

Checkbox.propTypes = {
    errorStyle: PropTypes.object,
    errorText: PropTypes.string,
    explanatoryText: PropTypes.string,
    sectionLabel: PropTypes.string,
    style: PropTypes.object,
    value: PropTypes.string,
    onChange: PropTypes.func,
    onCheck: PropTypes.func,
}

Checkbox.defaultProps = {
    value: 'false',
}

export default Checkbox
