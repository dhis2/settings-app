import log from 'loglevel';
import Action from 'd2-ui/lib/action/Action';
import i18next from 'i18next';
import { getInstance as getD2 } from 'd2/lib/d2';

import settingsActions from '../settingsActions';

import oa2Store from './oauth2Client.store';

const oa2Actions = Action.createActionsFromNames(['load', 'delete']);

oa2Actions.load.subscribe(() => {
    getD2()
        .then((d2) => {
            d2.models.oAuth2Client.list({ paging: false, fields: ':all', order: 'displayName' })
                .then((oa2ClientCollection) => {
                    const yes = i18next.t('yes');
                    const no = i18next.t('no');
                    // Map grant types to object props in order to display them in the data table
                    oa2Store.setState(oa2ClientCollection.toArray().map(oa2c => Object.assign(oa2c,
                        {
                            password: oa2c.grantTypes.indexOf('password') !== -1 ? yes : no,
                            refresh_token: oa2c.grantTypes.indexOf('refresh_token') !== -1 ? yes : no,
                            authorization_code: oa2c.grantTypes.indexOf('authorization_code') !== -1 ? yes : no,
                        })));
                });
        });
});

oa2Actions.delete.subscribe((e) => {
    e.data.delete()
        .then(() => {
            oa2Actions.load();
            getD2().then(() => {
                settingsActions.showSnackbarMessage(i18next.t('OAUTH2 client deleted'));
            });
        })
        .catch((err) => {
            log.warn('Error when deleting OAuth2 client:', err);
            getD2().then(() => {
                settingsActions.showSnackbarMessage(i18next.t('Failed to sava OAUTH2 client'));
            });
        });
});

export default oa2Actions;
