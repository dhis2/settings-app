import React from 'react';
import DataTable from 'd2-ui/lib/data-table/DataTable.component';
import dataApprovalLevelStore from './dataApprovalLevel.store';
import dataApprovalLevelActions from './dataApprovalLevel.actions';

import FloatingActionButton from 'material-ui/lib/floating-action-button';
import FontIcon from 'material-ui/lib/font-icon';
import Form from 'd2-ui/lib/forms/Form.component';
import Translate from 'd2-ui/lib/i18n/Translate.mixin';
import TextField from 'material-ui/lib/text-field';
import SelectField from 'material-ui/lib/select-field';
import RaisedButton from 'material-ui/lib/raised-button';
import SelectFieldAsyncSource from './SelectFieldAsyncSource.component';
import ListDivider from 'material-ui/lib/lists/list-divider';

export default React.createClass({
    componentWillMount() {
        dataApprovalLevelActions.loadDataApprovalLevels();
        dataApprovalLevelStore
            .subscribe(approvalLevels => {
                this.setState({approvalLevels, showAddForm: false});
            });
    },

    mixins: [Translate],

    getInitialState() {
        this.modelToEdit = this.context.d2.models.dataApprovalLevel.create();
        return {
            approvalLevels: [],
            showAddForm: false,
        };
    },

    render() {
        return (
            <div>
                <ListDivider style={{marginTop: '2rem'}} />
                {this.state.showAddForm ? this.renderForm() : this.renderList()}
            </div>
        );
    },

    renderForm() {
        const d2 = this.context.d2;
        const createOptionsFromList = (list) => {
            return list
                .then(list => list.toArray())
                .then(listItems => {
                    return listItems
                        .map(listItem => {
                            return {
                                text: listItem.displayName,
                                payload: listItem,
                            };
                        });
                });
        };

        const fieldConfigs = [
            {
                name: 'name',
                type: TextField,
                value: this.modelToEdit.name,
                fieldOptions: {
                    floatingLabelText: this.getTranslation('name'),
                },
            },
            {
                name: 'organisationUnitLevel',
                type: SelectFieldAsyncSource,
                fieldOptions: {
                    floatingLabelText: this.getTranslation('organisation_unit_level'),
                    menuItemsSource: () => createOptionsFromList(d2.models.organisationUnitLevel.list()),
                    value: this.modelToEdit.organisationUnitLevel,
                },
            },
            {
                name: 'categoryOptionGroupSet',
                type: SelectFieldAsyncSource,
                fieldOptions: {
                    floatingLabelText: this.getTranslation('category_option_group_sets'),
                    menuItemsSource: () => createOptionsFromList(d2.models.categoryOptionGroupSet.list()),
                    value: this.modelToEdit.categoryOptionGroupSet,
                }
            }
        ];

        return (
            <Form source={this.modelToEdit} fieldConfigs={fieldConfigs} onFormFieldUpdate={this.formFieldUpdate}>
                <RaisedButton onClick={this.saveAction} primary={true} label={this.getTranslation('save')} />
                <RaisedButton onClick={this.cancelAction} style={{marginLeft: '1rem'}} label={this.getTranslation('cancel')} />
            </Form>
        );
    },

    saveAction() {
        dataApprovalLevelActions
            .saveDataApprovalLevel(this.modelToEdit)
            .subscribe(
                message => console.log('Success', message),
                error => console.log('Error', error)
            );
    },

    cancelAction() {
        this.modelToEdit = this.context.d2.models.dataApprovalLevel.create();
        this.setState({
            showAddForm: false,
        });
    },

    formFieldUpdate(fieldName, newValue) {
        this.modelToEdit[fieldName] = newValue;
        this.forceUpdate();
    },

    renderList() {
        const contextMenuActions = {
            delete: dataApprovalLevelActions.deleteDataApprovalLevel,
        };

        const cssStyles = {
            textAlign: 'right',
            marginTop: '1rem',
        };

        return (
            <div>
                <div style={cssStyles}>
                    <FloatingActionButton onClick={this.addClick}>
                        <FontIcon className="material-icons">add</FontIcon>
                    </FloatingActionButton>
                </div>
                <DataTable
                    rows={this.state.approvalLevels}
                    columns={this.props.columns}
                    contextMenuActions={contextMenuActions}
                />
            </div>
        );
    },

    addClick() {
        this.setState({
            approvalLevelToAdd: this.context.d2.models.dataApprovalLevel.create(),
            showAddForm: true,
        });
    },
});
