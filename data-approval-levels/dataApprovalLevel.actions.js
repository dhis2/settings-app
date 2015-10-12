import Action from 'd2-flux/action/Action';
import dataApprovalLevelStore from './dataApprovalLevel.store';
import {getInstance as getD2} from 'd2/lib/d2';

const actions = Action.createActionsFromNames(['loadDataApprovalLevels', 'editDataApprovalLevel', 'saveDataApprovalLevel', 'deleteDataApprovalLevel']);

function sortByLevel(left, right) {
    return left.level - right.level;
}

function checkImportReport(response) {
    if (response.response && response.response.importCount && response.response.importCount.imported === 1) {
        return Promise.resolve(response);
    }
    return Promise.reject(response);
}

actions.loadDataApprovalLevels
    .subscribe(({complete, error}) => {
        getD2()
            .then(d2 => d2.models.dataApprovalLevel.list({paging: false}))
            .then(dataApprovalLevelCollection => dataApprovalLevelCollection.toArray())
            .then(dataApprovalLevels => dataApprovalLevels.sort(sortByLevel))
            .then(dataApprovalLevels => dataApprovalLevelStore.setState(dataApprovalLevels))
            .then(complete)
            .catch(error);
    });

actions.saveDataApprovalLevel
    .subscribe(({data: dataApprovalLevel, complete, error}) => {
        const dataApprovalLevels = dataApprovalLevelStore.getState();


        if (Array.isArray(dataApprovalLevels)) {
            console.log(dataApprovalLevels);
            dataApprovalLevels
                .filter(approvalLevel => approvalLevel.orgUnitLevel === dataApprovalLevel.organisationUnitLevel.level)
                .forEach((item) => console.log(item));
        }

        const dataApprovalLevelToSave = {
            name: dataApprovalLevel.organisationUnitLevel.name,
            orgUnitLevel: dataApprovalLevel.organisationUnitLevel.level,
        };

        if (dataApprovalLevel.categoryOptionGroupSet) {
            dataApprovalLevelToSave.categoryOptionGroupSet = {
                id: dataApprovalLevel.categoryOptionGroupSet.id,
            };
            dataApprovalLevelToSave.name = `${dataApprovalLevel.organisationUnitLevel.name} ${dataApprovalLevel.categoryOptionGroupSet.name}`;
        }

        getD2()
            .then(d2 => d2.Api.getApi())
            .then(api => api.post('dataApprovalLevels', dataApprovalLevelToSave))
            .then(checkImportReport)
            .then(message => {
                complete(message);
                return message;
            })
            .then(() => actions.loadDataApprovalLevels())
            .catch(errorResponse => {
                if (errorResponse.response && errorResponse.response.importConflicts) {
                    error(errorResponse.response.importConflicts);
                }
                error(errorResponse);
            });
    });

actions.deleteDataApprovalLevel
    .subscribe(({data: dataApprovalLevel, complete, error}) => {
        dataApprovalLevel
            .delete()
            .then(complete)
            .catch(error)
            .then(() => actions.loadDataApprovalLevels());
    });

export default actions;
