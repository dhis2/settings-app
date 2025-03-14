import i18n from '@dhis2/d2-i18n'
import { getInstance as getD2 } from 'd2'
import Action from 'd2-ui/lib/action/Action.js'
import settingsActions from '../settingsActions.js'
import oa2Store from './oauth2Client.store.js'

const oa2Actions = Action.createActionsFromNames(['load', 'delete'])

oa2Actions.load.subscribe(() => {
    getD2().then((d2) => {
        d2.models.oAuth2Client
            .list({ paging: false, fields: ':all', order: 'displayName' })
            .then((oa2ClientCollection) => {
                const yes = i18n.t('Yes')
                const no = i18n.t('No')
                // Map grant types to object props in order to display them in the data table
                oa2Store.setState(
                    oa2ClientCollection.toArray().map((oa2c) => {
                        // Ensure redirectUris is a string, not an array
                        if (oa2c.redirectUris && Array.isArray(oa2c.redirectUris)) {
                            oa2c.redirectUris = oa2c.redirectUris.join(',')
                        }
                        
                        return Object.assign(oa2c, {
                            refresh_token:
                                oa2c.authorizationGrantTypes && oa2c.authorizationGrantTypes.indexOf('refresh_token') !== -1
                                    ? yes
                                    : no,
                            authorization_code:
                                oa2c.authorizationGrantTypes && oa2c.authorizationGrantTypes.indexOf(
                                    'authorization_code'
                                ) !== -1
                                    ? yes
                                    : no,
                        })
                    })
                )
            })
    })
})

oa2Actions.delete.subscribe((e) => {
    e.data
        .delete()
        .then(() => {
            oa2Actions.load()
            settingsActions.showSnackbarMessage(i18n.t('OAuth2 client deleted'))
        })
        .catch((err) => {
            console.error('Error when deleting OAuth2 client:', err)
            settingsActions.showSnackbarMessage(
                i18n.t('Failed to delete OAuth2 client')
            )
        })
})

export default oa2Actions
