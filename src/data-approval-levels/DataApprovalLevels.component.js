import React from 'react';

// Material UI components
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import FlatButton from 'material-ui/lib/flat-button';
import FontIcon from 'material-ui/lib/font-icon';
import Paper from 'material-ui/lib/paper';
import RaisedButton from 'material-ui/lib/raised-button';

// D2 UI components
import DataTable from 'd2-ui/lib/data-table/DataTable.component';
import Form from 'd2-ui/lib/forms/Form.component';
import Translate from 'd2-ui/lib/i18n/Translate.mixin';
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';

import {isRequired} from 'd2-ui/lib/forms/Validators';

// Local dependencies
import dataApprovalLevelStore from './dataApprovalLevel.store';
import dataApprovalLevelActions from './dataApprovalLevel.actions';

import dataApprovalWorkflowActions from './dataApprovalWorkflow.actions';
import dataApprovalWorkflowStore from './dataApprovalWorkflow.store';

import SelectFieldAsyncSource from './SelectFieldAsyncSource.component';
import TextField from '../form-fields/text-field';
import DropdownField from '../form-fields/drop-down';
import MultiToggle from '../form-fields/multi-toggle';
import log from 'loglevel';


function isUndefinedOrRequired(v) {
    return v === undefined || isRequired(v.trim());
}

export default React.createClass({
    mixins: [Translate],

    componentWillMount() {
        dataApprovalLevelActions.loadDataApprovalLevels();
        dataApprovalWorkflowActions.loadDataApprovalWorkflows();
        this.subscriptions = [];
    },

    componentDidMount() {
        this.subscriptions.push(
            dataApprovalLevelStore.subscribe(approvalLevels => {
                this.setState({approvalLevels, showForm: false, saving: false});
            })
        );
        this.subscriptions.push(
            dataApprovalWorkflowStore.subscribe(approvalWorkflows => {
                this.setState({approvalWorkflows, showForm: false, saving: false});
            })
        );
    },

    componentWillUnmount() {
        this.subscriptions.forEach(subscription => {
            subscription.dispose();
        });
    },

    getInitialState() {
        this.modelToEdit = this.context.d2.models.dataApprovalLevel.create();
        this.workflowModelToEdit = this.context.d2.models.dataApprovalWorkflow.create();
        return {
            approvalLevels: [],
            approvalWorkflows: [],
            showForm: false,
            showWorkflows: false,
            saving: false,
        };
    },

    /*
     * Approval levels
     */
    renderApprovalLevelForm() {
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
                    prependItems: [{text: '', payload: null}],
                    value: this.modelToEdit.categoryOptionGroupSet,
                },
            },
        ];

        const formPaperStyle = {
            padding: '2rem',
            marginTop: '2rem',
            marginRight: '2rem',
        };

        return (
            <Paper style={formPaperStyle}>
                <h2 style={{margin: 0}}>{this.getTranslation('create_new_approval_level')}</h2>
                <div style={{marginTop: '1rem'}}>
                    <Form source={this.modelToEdit} fieldConfigs={fieldConfigs}
                          onFormFieldUpdate={this.formFieldUpdate}>
                        <RaisedButton onClick={this.saveAction} primary label={this.getTranslation('save')}/>
                        <FlatButton onClick={this.cancelAction} style={{marginLeft: '1rem'}}
                                    label={this.getTranslation('cancel')}/>
                    </Form>
                </div>
            </Paper>
        );
    },

    renderApprovalLevelList() {
        const contextMenuActions = {
            delete: dataApprovalLevelActions.deleteDataApprovalLevel,
        };

        const cssStyles = {
            textAlign: 'right',
            marginTop: '1rem',
            marginRight: 16,
        };

        return (
            <div style={{maxWidth: 960, marginRight: 16}}>
                <div style={cssStyles}>
                    <FloatingActionButton onClick={this.addClick}>
                        <FontIcon className="material-icons">add</FontIcon>
                    </FloatingActionButton>
                </div>
                <div style={{marginTop: -24}}>
                    <DataTable
                        rows={this.state.approvalLevels}
                        columns={['name', 'categoryOptionGroupSet', 'level']}
                        contextMenuActions={contextMenuActions}
                    />
                </div>
            </div>
        );
    },

    renderApprovalLevels() {
        return this.state.showForm ? this.renderApprovalLevelForm() : this.renderApprovalLevelList();
    },

    /*
     * Workflows
     */
    renderWorkflowForm() {
        const periodTypes = {
            'Daily': 'Daily',
            'Weekly': 'Weekly',
            'Monthly': 'Monthly',
            'BiMonthly': 'BiMonthly',
            'Quarterly': 'Quarterly',
            'SixMonthly': 'SixMonthly',
            'SixMonthlyApril': 'SixMonthlyApril',
            'Yearly': 'yearly',
            'FinancialApril': 'FinancialApril',
            'FinancialJuly': 'FinancialJuly',
            'FinancialOct': 'FinancialOct',
        };

        const approvalLevels = (this.workflowModelToEdit.dataApprovalLevels || []).map(level => level.id);
        const fieldConfigs = [
            {
                name: 'name',
                type: TextField,
                updateEvent: 'onBlur',
                fieldOptions: {
                    floatingLabelText: this.getTranslation('name'),
                    value: this.workflowModelToEdit.name,
                },
                validators: [isUndefinedOrRequired],
            },
            {
                name: 'periodType',
                type: DropdownField,
                fieldOptions: {
                    floatingLabelText: this.getTranslation('period_type'),
                    menuItems: Object.keys(periodTypes).map(val => {
                        const label = periodTypes[val];
                        return {
                            payload: val,
                            text: this.getTranslation(label),
                        };
                    }),
                    value: this.workflowModelToEdit.periodType,
                },
                validators: [isUndefinedOrRequired],
            },
            {
                name: 'dataApprovalLevels',
                type: MultiToggle,
                fieldOptions: {
                    label: this.getTranslation('data_approval_levels'),
                    items: this.state.approvalLevels.map(level => {
                        return {
                            name: level.id,
                            text: `${level.level}: ${level.displayName}`,
                            value: approvalLevels.indexOf(level.id) !== -1,
                        };
                    }),
                },
            },
        ];

        const formPaperStyle = {
            padding: '2rem',
            marginTop: '2rem',
            marginRight: '2rem',
        };

        return (
            <Paper style={formPaperStyle}>
                <h2 style={{margin: 0}}>{this.workflowModelToEdit.id ? this.getTranslation('edit_approval_workflow') : this.getTranslation('create_new_approval_workflow')}</h2>
                <div style={{marginTop: '1rem'}}>
                    <Form source={this.workflowModelToEdit} fieldConfigs={fieldConfigs}
                          onFormFieldUpdate={this.workflowFormFieldUpdate}>
                        <div style={{marginTop: '2rem'}}></div>
                        <RaisedButton onClick={this.workflowFormSave} primary label={this.getTranslation('save')}/>
                        <FlatButton onClick={this.workflowFormCancel} style={{marginLeft: '1rem'}}
                                    label={this.getTranslation('cancel')}/>
                    </Form>
                </div>
            </Paper>
        );
    },

    renderWorkflowList() {
        const contextMenuActions = {
            edit: (model) => {
                this.workflowModelToEdit = model;
                this.setState({showForm: true});
            },
            delete: (model) => {
                this.setState({saving: true});
                dataApprovalWorkflowActions.deleteDataApprovalWorkflow(model);
            },
        };

        const cssStyles = {
            textAlign: 'right',
            marginTop: '1rem',
            marginRight: 16,
        };

        return (
            <div style={{maxWidth: 960, marginRight: 16}}>
                <div style={cssStyles}>
                    <FloatingActionButton onClick={this.addClick}>
                        <FontIcon className="material-icons">add</FontIcon>
                    </FloatingActionButton>
                </div>
                <div style={{marginTop: -24}}>
                    <DataTable
                        rows={this.state.approvalWorkflows}
                        columns={['name', 'periodType', 'dataApprovalLevelList']}
                        contextMenuActions={contextMenuActions}
                        primaryAction={contextMenuActions.edit}
                    />
                </div>
            </div>
        );
    },

    renderWorkflows() {
        return (
            <div>
                {this.state.showForm ? this.renderWorkflowForm() : this.renderWorkflowList()}
            </div>
        );
    },

    render() {
        const styles = {
            loadingMask: {
                position: 'fixed',
                left: 256,
                top: '3rem',
                right: 0,
                bottom: 0,
                zIndex: 1000,
                backgroundColor: 'rgba(255,255,255,0.8)',
            },
            tabs: {
                marginTop: 32,
                marginBottom: -48,
                marginLeft: -1,
            },
            tabButtonContainer: {
                display: 'inline-block',
                marginRight: 16,
            },
            tabButtonInactive: {
                border: '1px solid #F0F0F0',
                borderBottomColor: '#F5F5F5',
                color: '#A0A0A0',
            },
            tabButtonActive: {
                border: '1px solid #D0D0D0',
                borderBottomColor: 'transparent',
            },
            tabBody: {
                zIndex: 1,
            },
        };

        return (
            <div>
                {this.state.saving ? (
                    <div style={styles.loadingMask}><LoadingMask /></div>
                ) : undefined}
                {!this.state.showForm ? (
                    <div style={styles.tabs}>
                        <div style={styles.tabButtonContainer}>
                            <FlatButton
                                secondary={!this.state.showWorkflows}
                                onClick={() => { this.setState({showWorkflows: false}); }}
                                label={this.getTranslation('approval_levels')}
                                style={this.state.showWorkflows ? styles.tabButtonInactive : styles.tabButtonActive}/>
                        </div>
                        <div style={styles.tabButtonContainer}>
                            <FlatButton
                                secondary={!!this.state.showWorkflows}
                                onClick={() => { this.setState({showWorkflows: true}); }}
                                label={this.getTranslation('approval_workflows')}
                                style={this.state.showWorkflows ? styles.tabButtonActive : styles.tabButtonInactive}/>
                        </div>
                    </div>
                ) : undefined}
                <div style={styles.tabBody}>
                    {this.state.showWorkflows ? this.renderWorkflows() : this.renderApprovalLevels()}
                </div>
            </div>
        );
    },

    saveAction() {
        this.setState({saving: true});
        dataApprovalLevelActions
            .saveDataApprovalLevel(this.modelToEdit)
            .subscribe(
                () => {
                    window.snackbar.show();
                    this.resetAddFormAnddisplayList();
                },
                error => {
                    log.error('Error', error);
                    this.setState({saving: false});
                }
            );
    },

    cancelAction() {
        this.resetAddFormAnddisplayList();
    },

    resetAddFormAnddisplayList() {
        this.modelToEdit = this.context.d2.models.dataApprovalLevel.create();
        this.setState({
            showForm: false,
        });
    },

    formFieldUpdate(fieldName, newValue) {
        this.modelToEdit[fieldName] = newValue;
        this.forceUpdate();
    },

    addClick() {
        this.workflowModelToEdit = this.context.d2.models.dataApprovalWorkflow.create();
        this.setState({
            approvalLevelToAdd: this.context.d2.models.dataApprovalLevel.create(),
            showForm: true,
            saving: false,
        });
    },

    workflowFormFieldUpdate(fieldName, newValue) {
        if (fieldName === 'dataApprovalLevels') {
            this.workflowModelToEdit[fieldName] = newValue.map(id => {
                return {id: id};
            });
        } else {
            this.workflowModelToEdit[fieldName] = (newValue + '').trim();
        }
        this.forceUpdate();
    },

    workflowFormSave() {
        this.setState({saving: true});
        dataApprovalWorkflowActions
            .saveDataApprovalWorkflow(this.workflowModelToEdit)
            .subscribe(
                () => {
                    this.setState({saving: false, showForm: false});
                },
                (err) => {
                    log.error('Failed to save workflow:', err);
                    this.setState({saving: false});
                }
            );
    },

    workflowFormCancel() {
        this.workflowModelToEdit = this.context.d2.models.dataApprovalWorkflow.create();
        this.setState({showForm: false});
    },
});
