import RaisedButton from 'material-ui/RaisedButton'
import React from 'react'

// Simple wrapper component that removes invalid props in order to stop React from complaining
export default function (props) {
    const { errorStyle, errorText, ...other } = props; // eslint-disable-line

    return <RaisedButton {...other} />
}
