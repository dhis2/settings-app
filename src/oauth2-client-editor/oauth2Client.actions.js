import i18n from '@dhis2/d2-i18n'
import { getInstance as getD2 } from 'd2'
import Action from 'd2-ui/lib/action/Action'
import settingsActions from '../settingsActions'
import oa2Store from './oauth2Client.store'

const oa2Actions = Action.createActionsFromNames(['load', 'delete'])

oa2Actions.load.subscribe(() => {
    getD2().then(d2 => {
        d2.models.oAuth2Client
            .list({ paging: false, fields: ':all', order: 'displayName' })
            .then(oa2ClientCollection => {
                const yes = i18n.t('Yes')
                const no = i18n.t('No')
                // Map grant types to object props in order to display them in the data table
                oa2Store.setState(
                    oa2ClientCollection.toArray().map(oa2c =>
                        Object.assign(oa2c, {
                            password:
                                oa2c.grantTypes.indexOf('password') !== -1
                                    ? yes
                                    : no,
                            refresh_token:
                                oa2c.grantTypes.indexOf('refresh_token') !== -1
                                    ? yes
                                    : no,
                            authorization_code:
                                oa2c.grantTypes.indexOf(
                                    'authorization_code'
                                ) !== -1
                                    ? yes
                                    : no,
                        })
                    )
                )
            })
    })
})

oa2Actions.delete.subscribe(e => {
    e.data
        .delete()
        .then(() => {
            oa2Actions.load()
            settingsActions.showSnackbarMessage(i18n.t('OAuth2 client deleted'))
        })
        .catch(err => {
            console.error('Error when deleting OAuth2 client:', err)
            settingsActions.showSnackbarMessage(
                i18n.t('Failed to delete OAuth2 client')
            )
        })
})

export default oa2Actions
