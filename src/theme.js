import { colors } from '@dhis2/ui'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import Spacing from 'material-ui/styles/spacing'

const theme = {
    spacing: Spacing,
    fontFamily: 'Roboto, sans-serif',
    palette: {
        primary1Color: colors.blue500,
        primary2Color: colors.blue700,
        primary3Color: colors.blue200,
        accent1Color: colors.blue500,
        accent2Color: colors.grey200,
        textColor: colors.grey900,
        disabledColor: colors.grey700,
        borderColor: colors.grey400,
    },
}

export default getMuiTheme(theme)
