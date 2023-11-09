import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";
import axios from 'axios';


import "./WorkItemAdmin.scss"
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE_URL } from '../../configuration'


import { FaUserCircle } from "react-icons/fa";
import { showRootComponent } from "../../Common";
import { Page } from "azure-devops-ui/Page";
import { ITableItemWorkType } from "./HeaderData";
import { CustomHeader, HeaderDescription, HeaderIcon, HeaderTitle, HeaderTitleArea, HeaderTitleRow, TitleSize } from "azure-devops-ui/Header";
import { HeaderCommandBar, IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { TextField, TextFieldWidth } from "azure-devops-ui/TextField";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { Button } from "azure-devops-ui/Button";
import { Card } from "azure-devops-ui/Card";
import { ITableColumn, SimpleTableCell, Table, renderSimpleCell } from "azure-devops-ui/Table";
import { FaRegCircleXmark } from "react-icons/fa6";
import { Checkbox } from "azure-devops-ui/Checkbox";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { Toast } from "azure-devops-ui/Toast";
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
    preventClosedItems: ObservableValue<boolean>;
    preventNegativeTime: ObservableValue<boolean>;
    configs : any
  } 
class WorkItemAdminConponent extends React.Component<{}, WorkItemFormGroupComponentState>{
    private description = new ObservableValue<string>("");
    private preventClosedItems = new ObservableValue<boolean>(false);
    private preventNegativeTime = new ObservableValue<boolean>(false);
    private isToastVisible = new ObservableValue<boolean>(false);
    private isToastFadingOut = new ObservableValue<boolean>(false);
    private allWorkType = new ObservableValue<any>('')
    private toastRef: React.RefObject<Toast> = React.createRef<Toast>();
    private disableSaveBtn : boolean = true

    constructor(props: {}) {
        super(props);
        this.state = {
            workTypes: [],
            disableSaveBtn : true,
            preventClosedItems: new ObservableValue<boolean>(false),
            preventNegativeTime: new ObservableValue<boolean>(false),
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
                console.log("ALL WORK TYPES__: ", response);
                const workTypes = response.data['data']['content'];
                this.allWorkType = workTypes
                this.setState({ workTypes });
            }).catch(error => {
                console.error("Error fetching work types: ", error);
            });
    }

    private getAllConfig = async () => {
        await axios.get(`${API_BASE_URL}/configuration/getConfig/${this.state.host.name}`).then(response => {
            console.log("ALL CONFIGS__: ", response);
        })
    }

    private onClickTrash = async (tableItem: ITableItemWorkType) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/workType/{id}?id=${tableItem.id}`);
            console.log("DELETE RESPONSE__: ", response);
            toast.success('Work type deleted successfully');
            // Refresh the data after deletion
            this.getAllWorkType();
        } catch (error) {
            console.error(error);
        }
    };


    private onChangePreventClosedItems = (_event: React.MouseEvent<HTMLElement>, checked: boolean) => {
        this.state.preventClosedItems.value = checked;
        this.updateSaveButtonState();
    };

    private onChangePreventNegativeTime = (_event: React.MouseEvent<HTMLElement>, checked: boolean) => {
        this.state.preventNegativeTime.value = checked;
        this.updateSaveButtonState();
    };
    private updateSaveButtonState() {
        const { preventClosedItems, preventNegativeTime } = this.state;
        const disableSaveBtn = !preventClosedItems.value && !preventNegativeTime.value;
        this.setState({ disableSaveBtn });
    }

    public render(): JSX.Element{
        const { workTypes } = this.state;
        const { disableSaveBtn } = this.state
        const { configs } = this.state
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
                                    Last edited on 11/01/2023
                                </HeaderDescription>
                            </HeaderTitleArea>
                            <HeaderCommandBar items={commandBarItemsAdvanced}/>
                        </CustomHeader>
                    </div>
                    <div className="admin-inputs">
                        <label htmlFor="description-input" className="description-lable">Description: </label>
                        <TextField placeholder="Enter work type here" className="description-input" inputType="text" inputId="description-input" value={this.description} onChange={this.onChangeDescription} width={TextFieldWidth.standard}></TextField>
                        <Button className="add-work-type-btn" text="Add" iconProps={{ iconName: "Add" }} onClick={this.onClickAdd}/>
                        <Button primary={true} disabled={disableSaveBtn} className="add-work-type-btn" text="Save" iconProps={{ iconName: "Save" }} onClick={this.onClickSave}/>
                    </div>
                    <div className="admin-checkbox">
                        <Checkbox onChange={this.onChangePreventClosedItems} checked={this.state.preventClosedItems.value} label="Prevent time logging to closed items"></Checkbox>
                        <Checkbox onChange={this.onChangePreventNegativeTime} checked={this.state.preventNegativeTime.value} label="Prevent remaining time going negative"></Checkbox>
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


    private deleteData = () => {
        
    }

    private onClickAdd = async () =>{
        console.log()
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
        console.log("Save button clicked");
        this.setState({
            disableSaveBtn: false
        })
        const request = {
            organizationName : this.state.host.name,
            preventRemainingTime: this.preventNegativeTime.value,
            preventTimeLogin: this.preventClosedItems.value
        }
        axios.post(`${API_BASE_URL}/configuration/updateConfig`,request).then(response => {
            console.log("RESPONSE__: ", response)
            toast.success(`Configuration saved sucessfully`)
        }).catch(error => console.log(error))
    }
}


showRootComponent(<WorkItemAdminConponent/>)
export default WorkItemAdminConponent