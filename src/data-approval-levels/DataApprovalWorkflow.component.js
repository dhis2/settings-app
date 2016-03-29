import React from 'react';

// Material UI components
import Dialog from 'material-ui/lib/dialog';
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import FlatButton from 'material-ui/lib/flat-button';
import FontIcon from 'material-ui/lib/font-icon';
import RaisedButton from 'material-ui/lib/raised-button';

// Local dependencies
import dataApprovalWorkflowActions from './dataApprovalWorkflow.actions';

// D2 UI components
import DataTable from 'd2-ui/lib/data-table/DataTable.component';
import Form from 'd2-ui/lib/forms/Form.component';

import { isRequired } from 'd2-ui/lib/forms/Validators';

import TextField from '../form-fields/text-field';
import DropdownField from '../form-fields/drop-down';
import MultiToggle from '../form-fields/multi-toggle';
import log from 'loglevel';


function isUndefinedOrRequired(v) {
    return v === undefined || isRequired(v.trim());
}

class DataApprovalWorkflow extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.context = context;
		this.getTranslation = context.d2.i18n.getTranslation.bind(context.d2.i18n);
		this.state = {approvalLevels:[], approvalWorkflows: [], showForm:false, saving:false, componentDidMount: false};
		this.workflowModelToEdit = context.d2.models.dataApprovalWorkflow.create();
		this.renderWorkflowList = this.renderWorkflowList.bind(this);
		this.workflowFormCancel = this.workflowFormCancel.bind(this);
		this.workflowDeleteAction = this.workflowDeleteAction.bind(this);
		this.workflowFormFieldUpdate = this.workflowFormFieldUpdate.bind(this);
		this.workflowFormSave = this.workflowFormSave.bind(this);
		this.renderWorkflowForm = this.renderWorkflowForm.bind(this);
		this.addClick = this.addClick.bind(this);
	}
    componentDidMount() {
        this.setState({ approvalWorkflows: this.props.approvalWorkflows, approvalLevels: this.props.approvalLevels, showForm: false, saving: false });
        setTimeout(() => {
            this.setState({ componentDidMount: true });
        }, 0);
    }
	componentWillReceiveProps(nextProps) {
        this.setState({ approvalWorkflows: nextProps.approvalWorkflows, approvalLevels: nextProps.approvalLevels, showForm: false, saving: false });
        setTimeout(() => {
            this.setState({ componentDidMount: true });
        }, 0);
    }
	
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
        }

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
    }

    addClick() {
        this.workflowFormCancel();
        this.setState({
            showForm: true,
            saving: false,
        });
    }

    workflowFormCancel() {
        this.workflowModelToEdit = this.context.d2.models.dataApprovalWorkflow.create();
        this.workflowModelToEdit.periodType = 'Daily';
        this.setState({ showForm: false });
    }

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
    }

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
    }

    workflowFormSave() {
        this.setState({ saving: true });
        dataApprovalWorkflowActions
            .saveDataApprovalWorkflow(this.workflowModelToEdit)
            .subscribe(
                () => {
                    this.setState({ saving: false, showForm: false });
                },
                (err) => {
                    log.error('Failed to save workflow:', err);
                    this.setState({ saving: false });
                }
            );
    }

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
                            payload: val,
                            text: this.getTranslation(label),
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
    }

	render() {
		return (
            <div>
                {this.state.showForm ? this.renderWorkflowForm() : undefined}
                {this.renderWorkflowList()}
            </div>
        );
	}
}

DataApprovalWorkflow.contextTypes = { d2: React.PropTypes.object.isRequired };

export default DataApprovalWorkflow;