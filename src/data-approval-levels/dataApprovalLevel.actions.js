import log from 'loglevel';
import Action from 'd2-flux/action/Action';
import dataApprovalLevelStore from './dataApprovalLevel.store';
import {getInstance as getD2} from 'd2/lib/d2';

import settingsActions from '../settingsActions';

const actions = Action.createActionsFromNames([
    'loadDataApprovalLevels',
    'editDataApprovalLevel',
    'saveDataApprovalLevel',
    'deleteDataApprovalLevel',
]);

function checkImportReport(response) {
    if (response.response && response.response.importCount && response.response.importCount.imported === 1) {
        return Promise.resolve(response);
    }
    return Promise.reject(response);
}

actions.loadDataApprovalLevels
    .subscribe(({complete, error}) => {
        getD2()
            .then(d2 => d2.models.dataApprovalLevel.list({
                paging: false,
                fields: ':all,categoryOptionGroupSet[id,displayName]',
                order: 'level:asc,displayName:asc',
            }))
            .then(dataApprovalLevelCollection => dataApprovalLevelCollection.toArray())
            .then(dataApprovalLevels => dataApprovalLevelStore.setState(dataApprovalLevels))
            .then(complete)
            .catch(error);
    });

actions.saveDataApprovalLevel
    .subscribe(({data: dataApprovalLevel, complete, error}) => {
        const dataApprovalLevels = dataApprovalLevelStore.getState();
        if (!dataApprovalLevel.organisationUnitLevel) {
            error();
            getD2().then(d2 => {
                settingsActions.showSnackbarMessage(d2.i18n.getTranslation('oranisation_unit_level_is_required'));
            });
            return;
        }

        if (Array.isArray(dataApprovalLevels)) {
            dataApprovalLevels
                .filter(approvalLevel => approvalLevel.orgUnitLevel === dataApprovalLevel.organisationUnitLevel.level);
        }

        const dataApprovalLevelToSave = {
            name: dataApprovalLevel.organisationUnitLevel.displayName,
            orgUnitLevel: dataApprovalLevel.organisationUnitLevel.level,
        };

        if (dataApprovalLevel.categoryOptionGroupSet && dataApprovalLevel.categoryOptionGroupSet.id) {
            dataApprovalLevelToSave.categoryOptionGroupSet = {
                id: dataApprovalLevel.categoryOptionGroupSet.id,
            };
            dataApprovalLevelToSave.name = dataApprovalLevel.organisationUnitLevel.displayName + ' ' +
                dataApprovalLevel.categoryOptionGroupSet.displayName;
        }

        getD2().then(d2 => {
            d2.Api.getApi().post('dataApprovalLevels', dataApprovalLevelToSave)
                .then(checkImportReport)
                .then(message => {
                    settingsActions.showSnackbarMessage(d2.i18n.getTranslation('approval_level_saved'));
                    actions.loadDataApprovalLevels();
                    complete(message);
                    return;
                })
                .catch(errorResponse => {
                    if (errorResponse.response && errorResponse.response.importConflicts) {
                        log.error(errorResponse.response.importConflicts);
                        settingsActions.showSnackbarMessage(
                            d2.i18n.getTranslation('failed_to_save_approval_level') + ': ' +
                            errorResponse.response.importConflicts[0].value
                        );
                        error(errorResponse.response.importConflicts);
                        return;
                    }
                    log.error(errorResponse);
                    settingsActions.showSnackbarMessage(d2.i18n.getTranslation('failed_to_save_approval_level'));
                    error(errorResponse);
                });
        });
    });

actions.deleteDataApprovalLevel.subscribe(({data: dataApprovalLevel, complete}) => {
    dataApprovalLevel.delete()
        .then(() => {
            complete();
            actions.loadDataApprovalLevels();
            getD2().then(d2 => {
                settingsActions.showSnackbarMessage(d2.i18n.getTranslation('approval_level_deleted'));
            });
        })
        .catch(e => {
            log.error(e.message);
            getD2().then(d2 => {
                settingsActions.showSnackbarMessage(d2.i18n.getTranslation('failed_to_delete_approval_level'));
            });
        });
});

export default actions;
