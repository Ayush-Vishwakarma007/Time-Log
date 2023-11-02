import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";

import "./WorkItemAdmin.scss"

import { FaUserCircle } from "react-icons/fa";
import { showRootComponent } from "../../Common";
import { Page } from "azure-devops-ui/Page";
import { ITableItemWorkType, commandBarItemsAdvanced } from "./HeaderData";
import { CustomHeader, HeaderDescription, HeaderIcon, HeaderTitle, HeaderTitleArea, HeaderTitleRow, TitleSize } from "azure-devops-ui/Header";
import { Status, Statuses, StatusSize } from "azure-devops-ui/Status";
import { HeaderCommandBar } from "azure-devops-ui/HeaderCommandBar";
import { TextField, TextFieldWidth } from "azure-devops-ui/TextField";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { Button } from "azure-devops-ui/Button";
import { Card } from "azure-devops-ui/Card";
import { ITableColumn, SimpleTableCell, Table, renderSimpleCell } from "azure-devops-ui/Table";
import { tableItems } from "../WorkItemFormGroup/TableData";
import { FaRegCircleXmark } from "react-icons/fa6";

class WorkItemAdminConponent extends React.Component<{}, {}>{
    private description = new ObservableValue<string>("");

    constructor(props: {}) {
        super(props);
    }

    public componentDidMount() {
        SDK.init();
    }

    public render(): JSX.Element{
        return(
            <div className="main-page">
                <Page className="page">
                    <div className="admin-header">
                        <CustomHeader separator>
                            <HeaderIcon className="bolt-table-status-icon-large" iconProps={{ render: this.renderStatus }} titleSize={TitleSize.Large}/>
                            <HeaderTitleArea>
                                <HeaderTitleRow>
                                    <HeaderTitle ariaLevel={3} className="text-ellipsis" titleSize={TitleSize.Large}>Admin panel for time logs</HeaderTitle>
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
                        <Button className="add-work-type-btn" text="Add" iconProps={{ iconName: "Add" }} onClick={() => alert("API will be called to save data at this click!")}/>
                    </div>
                    <div className="admin-work-type-list">
                        <Card className="flex-grow bolt-table-card" contentProps={{ contentPadding: false }}>
                            <Table<ITableItemWorkType> 
                            ariaLabel="Table with sorting"
                            className="table-example"
                            columns={columns}
                            containerClassName="h-scroll-auto"
                            itemProvider={tableItems}
                            role="table"
                            />
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

    private onChangeDescription = () =>{
        alert('api to store the info will be called here')
    }
}

function onSize(event: MouseEvent, index: number, width: number) {
    (columns[index].width as ObservableValue<number>).value = width;
  }

const columns = [
    {
        id: "action",
        name: "",
        width: new ObservableValue(-5),
        readonly: true,
        renderCell: renderNameColumn,
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

  function renderNameColumn(this: any, rowIndex: number, columnIndex: number, tableColumn: ITableColumn<ITableItemWorkType>, tableItem: ITableItemWorkType): JSX.Element {
    const onClickTrash = () => {
        alert("Delete API will be called here!");
    };
  
    return (
        <SimpleTableCell tableColumn={tableColumn} columnIndex={columnIndex} key={"col-" + columnIndex} contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m">
            <h3 onClick={onClickTrash} className="trash-icon">
                <FaRegCircleXmark />
            </h3>
        </SimpleTableCell>
    );
  }


showRootComponent(<WorkItemAdminConponent/>)
export default WorkItemAdminConponent