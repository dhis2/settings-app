import log from 'loglevel';

import Action from 'd2-flux/action/Action';
import dataApprovalWorkflowStore from './dataApprovalWorkflow.store';
import { getInstance as getD2 } from 'd2/lib/d2';

import settingsActions from '../settingsActions';

const actions = Action.createActionsFromNames(['loadDataApprovalWorkflows', 'editDataApprovalWorkflow', 'saveDataApprovalWorkflow', 'deleteDataApprovalWorkflow']);

function flattenDataApprovalLevels(dataApprovalWorkflows) {
    dataApprovalWorkflows.forEach(workflow => {
        workflow.dataApprovalLevelList = workflow.dataApprovalLevels.toArray()
            .sort((a, b) => {
                return a.level - b.level;
            })
            .map(level => level.level).join(', ');
    });
    return dataApprovalWorkflows;
}

function checkImportReport(response) {
    const result = response.response;
    if (result && result.importCount && result.importCount.imported === 1 || result.importCount.updated === 1) {
        return Promise.resolve(response);
    }
    return Promise.reject(response);
}

actions.loadDataApprovalWorkflows
    .subscribe(({ complete, error }) => {
        getD2()
            .then(d2 => d2.models.dataApprovalWorkflow.list({
                paging: false,
                fields: 'id,name,periodType,href,dataApprovalLevels[id,level]',
                order: 'displayName:asc',
            }))
            .then(dataApprovalWorkflowCollection => dataApprovalWorkflowCollection.toArray())
            .then(dataApprovalWorkflows => flattenDataApprovalLevels(dataApprovalWorkflows))
            .then(dataApprovalWorkflows => dataApprovalWorkflowStore.setState(dataApprovalWorkflows))
            .then(complete)
            .catch(error);
    });

actions.saveDataApprovalWorkflow
    .subscribe(({ data, complete, error }) => {
        getD2().then(d2 => {
            const workflowToSave = data;

            if (!workflowToSave.dirty && !workflowToSave.dataApprovalLevels.dirty) {
                settingsActions.showSnackbarMessage(d2.i18n.getTranslation('approval_workflow_saved'));
                complete();
                return;
            }

            workflowToSave.name = workflowToSave.name || '';

            workflowToSave.save()
                .then(checkImportReport)
                .then(() => {
                    actions.loadDataApprovalWorkflows();
                    settingsActions.showSnackbarMessage(d2.i18n.getTranslation('approval_workflow_saved'));
                })
                .then(complete)
                .catch(e => {
                    settingsActions.showSnackbarMessage(d2.i18n.getTranslation('failed_to_save_approval_workflow') + ': ' + e.response.importConflicts[0].value);
                    error(e);
                });
        });
    });

actions.deleteDataApprovalWorkflow
    .subscribe(({ data, complete, error }) => {
        getD2().then(d2 => {
            const workflowModel = data;
            workflowModel
                .delete()
                .then(() => {
                    settingsActions.showSnackbarMessage(d2.i18n.getTranslation('approval_workflow_deleted'));
                    actions.loadDataApprovalWorkflows();
                    complete();
                })
                .catch(err => {
                    log.error('Failed to delete workflow:', err);
                    settingsActions.showSnackbarMessage(err.message);
                    error(err);
                });
        });
    });

export default actions;
