import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";
import axios from 'axios';

import "./WorkItemAdmin.scss"
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE_URL } from '../../configuration';

import { FaUserCircle } from "react-icons/fa";
import { showRootComponent } from "../../Common";
import { Page } from "azure-devops-ui/Page";
import { ITableItemWorkType } from "./HeaderData";
import { CustomHeader, HeaderDescription, HeaderIcon, HeaderTitle, HeaderTitleArea, HeaderTitleRow, TitleSize } from "azure-devops-ui/Header";
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { TextField, TextFieldWidth } from "azure-devops-ui/TextField";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { Button } from "azure-devops-ui/Button";
import { Card } from "azure-devops-ui/Card";
import { ITableColumn, SimpleTableCell, Table, renderSimpleCell } from "azure-devops-ui/Table";
import { FaRegCircleXmark } from "react-icons/fa6";
import { Checkbox } from "azure-devops-ui/Checkbox";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { ToastContainer, toast } from 'react-toastify';

const commandBarItemsAdvanced: IHeaderCommandBarItem[] = [
    {
        iconProps: {
            iconName: "Download"
        },
        id: "testSave",
        important: true,
        onActivate: () => {
            alert("Example text");
        },
        text: "Download All Logs"
    },
];

interface WorkItemFormGroupComponentState {
    workTypes: [],
    extensionContext?: SDK.IExtensionContext;
    host?: SDK.IHostContext;
    disableSaveBtn: boolean;
    preventClosedItems: boolean;
    preventNegativeTime: boolean;
    configs : any;
    lastUpdated?: any;
  } 
class WorkItemAdminConponent extends React.Component<{}, WorkItemFormGroupComponentState>{
    private description = new ObservableValue<string>("");
    private preventClosedItems = new ObservableValue<boolean>(false);
    private preventNegativeTime = new ObservableValue<boolean>(false);
    private isToastVisible = new ObservableValue<boolean>(false);
    private isToastFadingOut = new ObservableValue<boolean>(false);

    constructor(props: {}) {
        super(props);
        this.state = {
            workTypes: [],
            disableSaveBtn : true,
            preventClosedItems: false,
            preventNegativeTime: false,
            configs: null
          };
    }

    public async componentDidMount() {
        await SDK.init();
        await SDK.ready();
        await this.getAllWorkType();
        await this.getAllConfig();
    }

    private getAllWorkType = async () => {
        let request = {
            page: {
                limit: 10,
                page: 0
            },
            sort: {
                orderBy: "DESC",
                sortBy: "WORK_TYPE"
            }
        }
        this.setState({
            extensionContext: SDK.getExtensionContext(),
            host: SDK.getHost()
         });
        await axios.post(`${API_BASE_URL}/workType/getAll?organizationName=${this.state.host.name}`, request)
            .then(response => {
                const workTypes = response.data['data']['content'];
                this.setState({ workTypes });
            }).catch(error => {
                console.error("Error fetching work types: ", error);
            });
    }

    private getAllConfig = async () => {
        const { host } = this.state;
    
        await axios.post(`${API_BASE_URL}/configuration/getConfiguration/${host?.name}`, { headers: { 'Content-Type': 'application/json' } })
            .then(response => {
                const configData = response.data['data'];
                if (configData.preventTimeLogin !== undefined && configData.preventRemainingTime !== undefined) {
                    this.preventClosedItems.value = configData.preventTimeLogin;
                    this.preventNegativeTime.value = configData.preventRemainingTime;
                }
    
                const lastUpdated = new Date(configData.updatedDate);
                const formattedLastUpdated = lastUpdated.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    
                this.setState({ preventClosedItems: configData.preventTimeLogin, preventNegativeTime: configData.preventRemainingTime, lastUpdated: formattedLastUpdated });
            })
            .catch(error => {
                console.error("Error fetching configuration: ", error);
            });
    }
    
    

    private onClickTrash = async (tableItem: ITableItemWorkType) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/workType/{id}?id=${tableItem.id}`);
            toast.success('Work type deleted successfully');
            this.getAllWorkType();
        } catch (error) {
            console.error(error);
        }
    };


    private onChangePreventClosedItems = (_event: React.MouseEvent<HTMLElement>, checked: boolean) => {
        this.preventClosedItems.value = checked
        this.setState({ preventClosedItems: checked });
        this.updateSaveButtonState();
    };

    private onChangePreventNegativeTime = (_event: React.MouseEvent<HTMLElement>, checked: boolean) => {
        this.preventNegativeTime.value = checked
        this.setState({ preventNegativeTime: checked });
        this.updateSaveButtonState();
    };
    private updateSaveButtonState() {
        // const { preventClosedItems, preventNegativeTime } = this.state;
        let disableSaveBtn
        if(this.preventClosedItems.value || this.preventNegativeTime.value){
            disableSaveBtn = false
        }else disableSaveBtn = true
        this.setState({ disableSaveBtn: disableSaveBtn });
    }      

    public render(): JSX.Element{
        const { workTypes, lastUpdated } = this.state;
        const { disableSaveBtn } = this.state
        const { preventClosedItems } = this.state
        const { preventNegativeTime } = this.state
        const formattedWorkTypes: ITableItemWorkType[] = workTypes.map((item: any) => ({
            id: item.id,
            type: item.type
        }));    
        const itemProvider = new ArrayItemProvider<ITableItemWorkType>(formattedWorkTypes);

        const onSize = (event: MouseEvent, index: number, width: number) => {
            (columns[index].width as ObservableValue<number>).value = width;
        };

        const columns = [
            {
                id: "action",
                name: "",
                width: new ObservableValue(-5),
                readonly: true,
                renderCell: (rowIndex: number, columnIndex: number, tableColumn: ITableColumn<ITableItemWorkType>, tableItem: ITableItemWorkType): JSX.Element => {
                    return renderNameColumn(rowIndex, columnIndex, tableColumn, tableItem);
                }
            },
            {
                id: "type",
                name: "",
                onSize: onSize,
                readonly: true,
                renderCell: renderSimpleCell,
                sortProps: {
                    ariaLabelAscending: "Sorted A to Z",
                    ariaLabelDescending: "Sorted Z to A",
                },
                width: new ObservableValue(-90),
            },
        ];

        const commandBarItemsAdvanced_: IHeaderCommandBarItem[] = [
            {
                iconProps: {
                    iconName: "Download"
                },
                id: "testSave",
                important: true,
                onActivate: () => {
                    alert("Example text");
                },
                text: "Download All Logs"
            },
        ];
    

        const renderNameColumn = (
            rowIndex: number,
            columnIndex: number,
            tableColumn: ITableColumn<ITableItemWorkType>,
            tableItem: ITableItemWorkType
        ): JSX.Element => {
            return (
                <SimpleTableCell
                    tableColumn={tableColumn}
                    columnIndex={columnIndex}
                    key={"col-" + columnIndex}
                    contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m"
                >
                    <h3 onClick={() => this.onClickTrash(tableItem)} className="trash-icon">
                        <FaRegCircleXmark />
                    </h3>
                </SimpleTableCell>
            );
        };
        
        return(
            <div className="main-page">
                <Page className="page">
                    <div className="admin-header">
                        <CustomHeader separator>
                            <HeaderIcon className="bolt-table-status-icon-large" iconProps={{ render: this.renderStatus }} titleSize={TitleSize.Large}/>
                            <HeaderTitleArea>
                                <HeaderTitleRow>
                                    <HeaderTitle ariaLevel={3} className="text-ellipsis" titleSize={TitleSize.Large}>Admin Panel For Time Logs</HeaderTitle>
                                </HeaderTitleRow>
                                <HeaderDescription>
                                    Last edited on {lastUpdated}
                                </HeaderDescription>
                            </HeaderTitleArea>
                            {/* <HeaderCommandBar items={commandBarItemsAdvanced_}/> */}
                        </CustomHeader>
                    </div>
                    <div className="admin-inputs">
                        <label htmlFor="description-input" className="description-lable">Description: </label>
                        <TextField placeholder="Enter work type here" className="description-input" inputType="text" inputId="description-input" value={this.description} onChange={this.onChangeDescription} width={TextFieldWidth.standard}></TextField>
                        <Button className="add-work-type-btn" text="Add" iconProps={{ iconName: "Add" }} onClick={this.onClickAdd}/>
                        <Button primary={true} disabled={disableSaveBtn} className="add-work-type-btn" text="Save" iconProps={{ iconName: "Save" }} onClick={this.onClickSave}/>
                    </div>
                    <div className="admin-checkbox">
                        <Checkbox onChange={this.onChangePreventClosedItems} checked={preventClosedItems} label="Prevent time logging to closed items"></Checkbox>
                        <Checkbox onChange={this.onChangePreventNegativeTime} checked={preventNegativeTime} label="Prevent remaining time going negative"></Checkbox>
                    </div>
                    <div className="admin-work-type-list">
                        <Card className="flex-grow bolt-table-card" contentProps={{ contentPadding: false }}>
                            <Table<ITableItemWorkType> 
                                ariaLabel="Table with sorting"
                                className="table-example"
                                columns={columns}
                                containerClassName="h-scroll-auto"
                                itemProvider={itemProvider}
                                role="table"
                            />
                            <ToastContainer closeButton={false} position="bottom-right" />
                        </Card>
                    </div>
                </Page>
            </div>
        );
    }
    private renderStatus = (className?: string) => {
        return (
            <div className="admin-icon">
                <FaUserCircle/> 
            </div>
        )
    };

    private onChangeDescription = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        newValue: string) =>{
        this.description.value = newValue
    }

    private onClickAdd = async () =>{
        const allWorkTypes = this.state.workTypes.map((item:any) => item.type);
        const host = SDK.getHost();

        if(this.description.value === ''){
            toast.error('Please enter work type');
            return
        }else if (allWorkTypes.includes(this.description.value.toUpperCase())){
            toast.error(`${this.description.value} already exists`)
        }else {
            let request = {
                organizationName: host['name'],
                workType: this.description.value.toUpperCase()
            }
            await axios.post(`${API_BASE_URL}/workType/save`, request).then(response => {
                this.isToastFadingOut.value = true;
                this.isToastVisible.value = true;
                this.description.value = ''
                toast.success('Work added successfully');
                this.getAllWorkType();
            }).catch(error => {
                console.log(error)
            });
        }
    }

    private onClickSave = async () =>{
        this.setState({
            disableSaveBtn: false
        })
        const request = {
            organizationName : this.state.host.name,
            preventRemainingTime: this.preventNegativeTime.value,
            preventTimeLogin: this.preventClosedItems.value
        }
        axios.post(`${API_BASE_URL}/configuration/updateConfig`,request).then(response => {
            toast.success(`Configuration saved sucessfully`)
        }).catch(error => console.log(error))
    }
}


showRootComponent(<WorkItemAdminConponent/>)
export default WorkItemAdminConponent