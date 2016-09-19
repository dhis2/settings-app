import React from 'react';

// Material UI components
import Dialog from 'material-ui/lib/dialog';
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import FlatButton from 'material-ui/lib/flat-button';
import FontIcon from 'material-ui/lib/font-icon';
import RaisedButton from 'material-ui/lib/raised-button';

// D2 UI components
import DataTable from 'd2-ui/lib/data-table/DataTable.component';
import Form from 'd2-ui/lib/forms/Form.component';
import Translate from 'd2-ui/lib/i18n/Translate.mixin';
import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';

import { isRequired } from 'd2-ui/lib/forms/Validators';

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

// TODO: Rewrite as ES6 class
/* eslint-disable react/prefer-es6-class */
export default React.createClass({
    mixins: [Translate],

    getInitialState() {
        this.modelToEdit = this.context.d2.models.dataApprovalLevel.create();
        this.workflowModelToEdit = this.context.d2.models.dataApprovalWorkflow.create();
        return {
            approvalLevels: [],
            approvalWorkflows: [],
            showForm: false,
            showWorkflows: false,
            saving: false,
            componentDidMount: false,
        };
    },

    componentWillMount() {
        dataApprovalLevelActions.loadDataApprovalLevels();
        dataApprovalWorkflowActions.loadDataApprovalWorkflows();
        this.subscriptions = [];
    },

    componentDidMount() {
        this.subscriptions.push(
            dataApprovalLevelStore.subscribe(approvalLevels => {
                this.setState({ approvalLevels, showForm: false, saving: false });
            })
        );
        this.subscriptions.push(
            dataApprovalWorkflowStore.subscribe(approvalWorkflows => {
                this.setState({ approvalWorkflows, showForm: false, saving: false });
            })
        );

        setTimeout(() => {
            this.setState({ componentDidMount: true });
        }, 0);
    },

    componentWillUnmount() {
        this.subscriptions.forEach(subscription => {
            subscription.dispose();
        });
    },

    tabClick() {
        this.setState({ componentDidMount: false }, () => {
            setTimeout(() => {
                this.setState({ componentDidMount: true });
            }, 75);
        });
    },

    levelTabClick() {
        this.setState({ componentDidMount: false }, () => {
            setTimeout(() => {
                this.setState({ showWorkflows: false, componentDidMount: true });
            }, 75);
        });
    },

    workflowTabClick() {
        this.setState({ componentDidMount: false }, () => {
            setTimeout(() => {
                this.setState({ showWorkflows: true, componentDidMount: true });
            }, 75);
        });
    },

    saveAction() {
        this.setState({ saving: true });
        dataApprovalLevelActions
            .saveDataApprovalLevel(this.modelToEdit)
            .subscribe(
                () => {
                    this.resetAddFormAnddisplayList();
                },
                () => {
                    this.setState({ saving: false });
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
        this.workflowFormCancel();
        this.setState({
            approvalLevelToAdd: this.context.d2.models.dataApprovalLevel.create(),
            showForm: true,
            saving: false,
        });
    },

    workflowDeleteAction() {
        this.setState({ saving: true });
        dataApprovalWorkflowActions
            .deleteDataApprovalWorkflow(this.workflowModelToEdit)
            .subscribe(
                () => {
                    this.workflowFormCancel();
                },
                () => {
                    this.setState({ saving: false });
                }
            );
    },

    workflowFormFieldUpdate(fieldName, newValue) {
        if (fieldName === 'dataApprovalLevels') {
            const add = [];
            const rem = [];
            const dataApprovalLevels = this.workflowModelToEdit.dataApprovalLevels;
            this.state.approvalLevels.forEach(level => {
                if (newValue.indexOf(level.id) >= 0 && !dataApprovalLevels.has(level.id)) {
                    add.push(level);
                } else if (newValue.indexOf(level.id) === -1 && dataApprovalLevels.has(level.id)) {
                    rem.push(level);
                }
            });
            add.forEach(level => {
                dataApprovalLevels.add(level);
            });
            rem.forEach(level => {
                dataApprovalLevels.remove(level);
            });
        } else {
            this.workflowModelToEdit[fieldName] = (`${newValue}`).trim();
        }
        this.forceUpdate();
    },

    workflowFormSave() {
        this.setState({ saving: true });
        dataApprovalWorkflowActions
            .saveDataApprovalWorkflow(this.workflowModelToEdit)
            .subscribe(
                () => {
                    this.setState({ saving: false, showForm: false });
                },
                () => {
                    this.setState({ saving: false });
                }
            );
    },

    workflowFormCancel() {
        this.workflowModelToEdit = this.context.d2.models.dataApprovalWorkflow.create();
        this.workflowModelToEdit.periodType = 'Daily';
        this.setState({ showForm: false });
    },

    /*
     * Approval levels
     */
    renderApprovalLevelForm() {
        const d2 = this.context.d2;
        const organisationUnitLevels = d2.models.organisationUnitLevel
            .list({ fields: 'id,displayName,level' })
            .then(list => list.toArray())
            .then(list => list.sort((left, right) => left.level - right.level))
            .then(list => list.map(listItem => {
                const text = `${listItem.level}: ${listItem.displayName}`;
                return { text, payload: listItem };
            }));

        const categoryOptionGroupSets = d2.models.categoryOptionGroupSet
            .list()
            .then(list => list.toArray())
            .then(listItems => listItems.map(listItem => {
                const text = listItem.displayName;
                const payload = listItem;
                return { text, payload };
            }));

        const fieldConfigs = [
            {
                name: 'organisationUnitLevel',
                type: SelectFieldAsyncSource,
                fieldOptions: {
                    floatingLabelText: this.getTranslation('organisation_unit_level'),
                    menuItemsSource: () => organisationUnitLevels,
                    value: this.modelToEdit.organisationUnitLevel,
                    style: { width: '100%' },
                },
            },
            {
                name: 'categoryOptionGroupSet',
                type: SelectFieldAsyncSource,
                fieldOptions: {
                    floatingLabelText: this.getTranslation('category_option_group_set'),
                    menuItemsSource: () => categoryOptionGroupSets,
                    prependItems: [{ text: this.getTranslation('none'), payload: {} }],
                    value: this.modelToEdit.categoryOptionGroupSet,
                    style: { width: '100%' },
                },
            },
        ];

        const styles = {
            dialog: {
                paddingLeft: 128,
            },
            body: {
                overflowY: 'auto',
            },
            content: {
                maxWidth: 400,
                minWidth: 400,
            },
        };

        return (
            <Dialog open style={styles.dialog} contentStyle={styles.content} bodyStyle={styles.body}>
                <h2>{this.getTranslation('create_new_approval_level')}</h2>
                <Form
                    source={this.modelToEdit}
                    fieldConfigs={fieldConfigs}
                    onFormFieldUpdate={this.formFieldUpdate}
                >
                    <div style={{ marginTop: '2rem' }}></div>
                    <RaisedButton onClick={this.saveAction} primary label={this.getTranslation('save')} />
                    <FlatButton
                        onClick={this.cancelAction}
                        style={{ marginLeft: '1rem' }}
                        label={this.getTranslation('cancel')}
                    />
                </Form>
            </Dialog>
        );
    },

    renderApprovalLevelList() {
        const contextMenuActions = {
            delete: dataApprovalLevelActions.deleteDataApprovalLevel,
        };

        const styles = {
            wrapper: {
                position: 'relative',
                marginTop: 48,
            },
            fab: {
                position: 'absolute',
                right: 0,
                top: -28,
            },
            table: {
                border: '0px solid #d0d0d0',
                borderTopWidth: 1,
                boxShadow: 'none',
                marginTop: -24,
                marginBottom: 0,
            },
        };

        const className = `transition-mount transition-unmount
            ${(!!this.state.componentDidMount ? '' : ' transition-mount-active')}`;

        return (
            <div style={styles.wrapper}>
                <div style={styles.fab} className={`fab ${className}`}>
                    <FloatingActionButton onClick={this.addClick}>
                        <FontIcon className="material-icons">add</FontIcon>
                    </FloatingActionButton>
                </div>
                <DataTable
                    style={styles.table}
                    rows={this.state.approvalLevels}
                    columns={['name', 'categoryOptionGroupSet', 'level']}
                    contextMenuActions={contextMenuActions}
                />
            </div>
        );
    },

    renderApprovalLevels() {
        return (
            <div>
                {this.state.showForm ? this.renderApprovalLevelForm() : undefined}
                {this.renderApprovalLevelList()}
            </div>
        );
    },

    /*
     * Workflows
     */
    renderWorkflowForm() {
        const periodTypes = {
            Daily: 'Daily',
            Weekly: 'Weekly',
            Monthly: 'Monthly',
            BiMonthly: 'BiMonthly',
            Quarterly: 'Quarterly',
            SixMonthly: 'SixMonthly',
            SixMonthlyApril: 'SixMonthlyApril',
            Yearly: 'yearly',
            FinancialApril: 'FinancialApril',
            FinancialJuly: 'FinancialJuly',
            FinancialOct: 'FinancialOct',
        };

        const approvalLevels = this.workflowModelToEdit.dataApprovalLevels.toArray().map(level => level.id);
        const fieldConfigs = [
            {
                name: 'name',
                type: TextField,
                updateEvent: 'onBlur',
                fieldOptions: {
                    floatingLabelText: this.getTranslation('name'),
                    value: this.workflowModelToEdit.name,
                    style: { width: '100%' },
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
                            id: val,
                            displayName: this.getTranslation(label),
                        };
                    }),
                    value: this.workflowModelToEdit.periodType,
                    style: { width: '100%' },
                },
                validators: [isUndefinedOrRequired],
            },
            {
                name: 'dataApprovalLevels',
                type: MultiToggle,
                fieldOptions: {
                    label: this.getTranslation('data_approval_levels'),
                    items: this.state.approvalLevels.map(level => {
                        const name = level.id;
                        const text = `${level.level}: ${level.displayName}`;
                        const value = approvalLevels.indexOf(level.id) !== -1;
                        return { name, text, value };
                    }),
                },
            },
        ];

        const styles = {
            dialog: {
                paddingLeft: 128,
            },
            content: {
                maxWidth: 400,
                minWidth: 400,
            },
            body: {
                overflowY: 'auto',
            },
            button: {
                marginLeft: 16,
            },
            buttonRight: {
                float: 'right',
            },
        };

        const headerText = this.workflowModelToEdit.id ?
            this.getTranslation('edit_approval_workflow') :
            this.getTranslation('create_new_approval_workflow');

        return (
            <Dialog open style={styles.dialog} contentStyle={styles.content} bodyStyle={styles.body}>
                <h2>{headerText}</h2>
                <Form
                    source={this.workflowModelToEdit}
                    fieldConfigs={fieldConfigs}
                    onFormFieldUpdate={this.workflowFormFieldUpdate}
                >
                    <div style={{ marginTop: '1rem' }}></div>
                    <RaisedButton onClick={this.workflowFormSave} primary label={this.getTranslation('save')} />
                    {this.workflowModelToEdit.id !== undefined ?
                        (<FlatButton
                            onClick={this.workflowDeleteAction}
                            primary
                            style={styles.button}
                            label={this.getTranslation('delete')}
                        />) :
                        undefined
                    }
                    <FlatButton
                        onClick={this.workflowFormCancel}
                        style={styles.buttonRight}
                        label={this.getTranslation('cancel')}
                    />
                </Form>
            </Dialog>
        );
    },

    renderWorkflowList() {
        const contextMenuActions = {
            edit: (model) => {
                this.workflowModelToEdit = model;
                this.setState({ showForm: true });
            },
            delete: (model) => {
                this.setState({ saving: true });
                dataApprovalWorkflowActions
                    .deleteDataApprovalWorkflow(model)
                    .subscribe(
                        () => {
                            this.workflowFormCancel();
                        },
                        () => {
                            this.setState({ saving: false });
                        }
                    );
            },
        };

        const styles = {
            wrapper: {
                position: 'relative',
                marginTop: 48,
            },
            fab: {
                position: 'absolute',
                right: 0,
                top: -28,
            },
            table: {
                border: '0px solid #d0d0d0',
                borderTopWidth: 1,
                boxShadow: 'none',
                marginTop: -24,
                marginBottom: 0,
            },
        };

        const className = `transition-mount transition-unmount
            ${(!!this.state.componentDidMount ? '' : ' transition-mount-active')}`;

        return (
            <div style={styles.wrapper}>
                <div style={styles.fab} className={`fab ${className}`}>
                    <FloatingActionButton onClick={this.addClick}>
                        <FontIcon className="material-icons">add</FontIcon>
                    </FloatingActionButton>
                </div>
                <DataTable
                    style={styles.table}
                    rows={this.state.approvalWorkflows}
                    columns={['name', 'periodType', 'dataApprovalLevelList']}
                    contextMenuActions={contextMenuActions}
                    primaryAction={contextMenuActions.edit}
                />
            </div>
        );
    },

    renderWorkflows() {
        return (
            <div>
                {this.state.showForm ? this.renderWorkflowForm() : undefined}
                {this.renderWorkflowList()}
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
                backgroundColor: 'rgba(243,243,243,0.5)',
            },
            tabs: {
                marginTop: 32,
                marginBottom: -49,
            },
            tabButtonContainer: {
                display: 'inline-block',
                marginRight: 16,
            },
            tabButtonInactive: {
                border: '1px solid #F0F0F0',
                borderBottomColor: '#D0D0D0',
                color: '#A0A0A0',
            },
            tabButtonActive: {
                border: '1px solid #D0D0D0',
                borderBottomColor: 'white',
            },
            tabBody: {},
        };

        return (
            <div>
                {this.state.saving ? (
                    <div style={styles.loadingMask}><LoadingMask /></div>
                ) : undefined}
                <div style={styles.tabs}>
                    <div style={styles.tabButtonContainer}>
                        <FlatButton
                            secondary={!this.state.showWorkflows}
                            onClick={this.levelTabClick}
                            label={this.getTranslation('approval_levels')}
                            style={this.state.showWorkflows ? styles.tabButtonInactive : styles.tabButtonActive}
                        />
                    </div>
                    <div style={styles.tabButtonContainer}>
                        <FlatButton
                            secondary={!!this.state.showWorkflows}
                            onClick={this.workflowTabClick}
                            label={this.getTranslation('approval_workflows')}
                            style={this.state.showWorkflows ? styles.tabButtonActive : styles.tabButtonInactive}
                        />
                    </div>
                </div>
                <div style={styles.tabBody}>
                    {this.state.showWorkflows ? this.renderWorkflows() : this.renderApprovalLevels()}
                </div>
            </div>
        );
    },
});
