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
import Paper from 'material-ui/lib/paper';

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
        const organisationUnitLevels = d2.models.organisationUnitLevel
            .list()
            .then(list => list.toArray())
            .then(list => list.sort((left, right) => left.level - right.level))
            .then(list => list.map(listItem => {
                return {
                    text: `${listItem.level}: ${listItem.displayName}`,
                    payload: listItem,
                };
            }));

        const categoryOptionGroupSets = d2.models.categoryOptionGroupSet
            .list()
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

        const fieldConfigs = [
            {
                name: 'organisationUnitLevel',
                type: SelectFieldAsyncSource,
                fieldOptions: {
                    floatingLabelText: this.getTranslation('organisation_unit_level'),
                    menuItemsSource: () => organisationUnitLevels,
                    value: this.modelToEdit.organisationUnitLevel,
                },
            },
            {
                name: 'categoryOptionGroupSet',
                type: SelectFieldAsyncSource,
                fieldOptions: {
                    floatingLabelText: this.getTranslation('category_option_group_set'),
                    menuItemsSource: () => categoryOptionGroupSets,
                    value: this.modelToEdit.categoryOptionGroupSet,
                }
            }
        ];

        const formPaperStyle = {
            marginRight: '2rem',
            marginTop: '2rem',
            padding: '2rem',
        };

        return (
            <Paper style={formPaperStyle}>
                <h2 style={{margin: 0}}>{this.getTranslation('create_new_approval_level')}</h2>
                <Form source={this.modelToEdit} fieldConfigs={fieldConfigs} onFormFieldUpdate={this.formFieldUpdate}>
                    <div style={{marginTop: '1rem'}}>
                        <RaisedButton onClick={this.saveAction} primary={true} label={this.getTranslation('save')} />
                        <RaisedButton onClick={this.cancelAction} style={{marginLeft: '1rem'}} label={this.getTranslation('cancel')} />
                    </div>
                </Form>
            </Paper>
        );
    },

    saveAction() {
        dataApprovalLevelActions
            .saveDataApprovalLevel(this.modelToEdit)
            .subscribe(
                (/*message*/) => {
                    window.snackbar.show();
                    this.resetAddFormAnddisplayList();
                },
                error => console.log('Error', error)
            );
    },

    cancelAction() {
        this.resetAddFormAnddisplayList();
    },

    resetAddFormAnddisplayList() {
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
            marginBottom: '1rem',
        };

        return (
            <div style={{width: '95%'}}>
                <div style={cssStyles}>
                    <FloatingActionButton onClick={this.addClick}>
                        <FontIcon className="material-icons">add</FontIcon>
                    </FloatingActionButton>
                </div>
                <DataTable
                    rows={this.state.approvalLevels}
                    columns={this.props.columns}
                    contextMenuActions={contextMenuActions} />
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
