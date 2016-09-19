import log from 'loglevel';
import Action from 'd2-ui/lib/action/Action';
import dataApprovalLevelStore from './dataApprovalLevel.store';
import { getInstance as getD2 } from 'd2/lib/d2';

import settingsActions from '../settingsActions';
import workflowActions from './dataApprovalWorkflow.actions';

const actions = Action.createActionsFromNames([
    'loadDataApprovalLevels',
    'editDataApprovalLevel',
    'saveDataApprovalLevel',
    'deleteDataApprovalLevel',
]);

function checkImportReport(response) {
    if (response.status === 'OK') {
        return Promise.resolve(response);
    }
    return Promise.reject(response);
}

actions.loadDataApprovalLevels
    .subscribe(({ complete, error }) => {
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
    .subscribe(({ data: dataApprovalLevel, complete: actionComplete, error: actionFailed }) => {
        const dataApprovalLevels = dataApprovalLevelStore.getState();
        if (!dataApprovalLevel.organisationUnitLevel) {
            actionFailed();
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
            dataApprovalLevelToSave.categoryOptionGroupSet = { id: dataApprovalLevel.categoryOptionGroupSet.id };
            dataApprovalLevelToSave.name = `${dataApprovalLevel.organisationUnitLevel.displayName} `;
            dataApprovalLevelToSave.name += dataApprovalLevel.categoryOptionGroupSet.displayName;
        }

        getD2().then(d2 => {
            d2.Api.getApi().post('dataApprovalLevels', dataApprovalLevelToSave)
                .then(checkImportReport)
                .then(message => {
                    workflowActions.loadDataApprovalWorkflows();
                    settingsActions.showSnackbarMessage(d2.i18n.getTranslation('approval_level_saved'));
                    actions.loadDataApprovalLevels();
                    actionComplete(message);
                })
                .catch(error => {
                    const message = (error.messages || error.response && error.response.errorReports)
                        ? `\n - ${(error.messages || error.response.errorReports).map(e => e.message).join('\n - ')}`
                        : error.message || error;
                    log.warn(`Error when saving approval level: ${message}`);
                    settingsActions.showSnackbarMessage(d2.i18n.getTranslation('failed_to_save_approval_level'));
                    actionFailed();
                });
        });
    });

actions.deleteDataApprovalLevel.subscribe(({ data: dataApprovalLevel, complete }) => {
    dataApprovalLevel.delete()
        .then(() => {
            complete();
            workflowActions.loadDataApprovalWorkflows();
            actions.loadDataApprovalLevels();
            getD2().then(d2 => {
                settingsActions.showSnackbarMessage(d2.i18n.getTranslation('approval_level_deleted'));
            });
        })
        .catch(e => {
            log.warn('Error when deleting approval level:', e.message);
            getD2().then(d2 => {
                settingsActions.showSnackbarMessage(d2.i18n.getTranslation('failed_to_delete_approval_level'));
            });
        });
});

export default actions;
