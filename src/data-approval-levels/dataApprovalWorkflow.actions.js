import log from 'loglevel';

import Action from 'd2-flux/action/Action';
import dataApprovalWorkflowStore from './dataApprovalWorkflow.store';
import {getInstance as getD2} from 'd2/lib/d2';

const actions = Action.createActionsFromNames(['loadDataApprovalWorkflows', 'editDataApprovalWorkflow', 'saveDataApprovalWorkflow', 'deleteDataApprovalWorkflow']);

function flattenDataApprovalLevels(dataApprovalWorkflows) {
    dataApprovalWorkflows.forEach(workflow => {
        workflow.dataApprovalLevelList = workflow.dataApprovalLevels
            .sort((a, b) => {return a.level - b.level;})
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
    .subscribe(({complete, error}) => {
        getD2()
            .then(d2 => d2.models.dataApprovalWorkflow.list({paging: false, fields: 'id,name,periodType,href,dataApprovalLevels[id,level]', order: 'displayName:asc'}))
            .then(dataApprovalWorkflowCollection => dataApprovalWorkflowCollection.toArray())
            .then(dataApprovalWorkflows => flattenDataApprovalLevels(dataApprovalWorkflows))
            .then(dataApprovalWorkflows => dataApprovalWorkflowStore.setState(dataApprovalWorkflows))
            .then(complete)
            .catch(error);
    });

actions.saveDataApprovalWorkflow
    .subscribe(({data, complete, error}) => {
        const workflowToSave = data;

        if (!workflowToSave.dirty) {
            complete();
            return;
        }

        workflowToSave.name = workflowToSave.name || '';

        workflowToSave.save()
            .then(checkImportReport)
            .then(() => { actions.loadDataApprovalWorkflows(); })
            .then(complete)
            .catch(error);
    });

actions.deleteDataApprovalWorkflow
    .subscribe(({data: dataApprovalLevel}) => {
        dataApprovalLevel
            .delete()
            .then(() => actions.loadDataApprovalWorkflows())
            .catch(error => {
                log.error('Failed to delete workflow:', error);
                actions.loadDataApprovalWorkflows();
            });
    });

export default actions;
