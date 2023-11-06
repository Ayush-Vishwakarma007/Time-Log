import React from "react";
import * as SDK from "azure-devops-extension-sdk";
import DatePicker from "react-datepicker";

import 'react-datepicker/dist/react-datepicker.css';
import './WorkItemFormGroup.scss';

import { setHours, setMinutes } from "date-fns";
import { TextField, TextFieldWidth } from "azure-devops-ui/TextField";
import { ObservableArray, ObservableValue } from "azure-devops-ui/Core/Observable";

import { FaRegCircleXmark } from "react-icons/fa6";

import { showRootComponent } from "../../Common";
import { CustomHeader, HeaderTitleArea } from "azure-devops-ui/Header";
import { Icon } from "azure-devops-ui/Icon";
import { Dropdown } from "azure-devops-ui/Dropdown";
import { IListBoxItem } from "azure-devops-ui/ListBox";
import { Button } from "azure-devops-ui/Button";
import { Card } from "azure-devops-ui/Card";
import { ColumnSorting, ITableColumn, SimpleTableCell, SortOrder, Table, renderSimpleCell, sortItems } from "azure-devops-ui/Table";
import { ITableItem, rawTableItems} from './TableData';

interface WorkItemFormGroupComponentState {
  dateValue: Date;
  selectedDate: Date;
}

export class WorkItemFormGroupComponent extends React.Component<{}, WorkItemFormGroupComponentState> {
  private hours = new ObservableValue<string>("0");
  private mins = new ObservableValue<string>("0");
  private selectedItem = new ObservableValue<string>("");
  private comment = new ObservableValue<string>("");

  constructor(props: {}) {
    super(props);
    this.state = {
      dateValue: new Date(),
      selectedDate: new Date()
    };
  }

  public componentDidMount() {
    SDK.init();
  }

  private handleDateChange = (date: Date) => {
    this.setState({ selectedDate: date });
    if (date.getDate() === new Date().getDate()) {
      this.setState({ dateValue: setHours(setMinutes(new Date(), 0), 18) });
    } else {
      this.setState({ dateValue: setHours(setMinutes(new Date(), 0), 0) });
    }
  };

  public render(): JSX.Element {
    return (
      <div className="time-log-main">

        <div>
          <CustomHeader className="bolt-header-with-commandbar " separator>
          <Icon ariaLabel="Clock icon" iconName="Clock" className="clock-icon"/>
            <HeaderTitleArea>
              <div className="flex-grow scroll-hidden">
                <div className="title-m header-title" >
                  Time Logs
                </div>
              </div>
            </HeaderTitleArea>
          </CustomHeader>
        </div>

        <div className="time-input">
            <label htmlFor="hours" className="input-labels">Hours: </label>
            <TextField className="input-hours" inputType="number" inputId="hours" value={this.hours} onChange={this.onChangeHours} width={TextFieldWidth.standard}/>
            
            <label htmlFor="mins">Mins: </label>
            <TextField className="input-mins"  inputType="number"  inputId="mins" value={this.mins} onChange={this.onChangeMins} width={TextFieldWidth.standard}/>
            
            <label htmlFor="date-picker">Date: </label>
            <DatePicker className="date-picker-input" id="date-picker" autoFocus={true} selected={this.state.selectedDate} showTimeSelect onChange={this.handleDateChange}
              timeIntervals={1} dateFormat="MMMM d, yyyy h:mm aa"/>
            
            <label htmlFor="date-picker">Type: </label>
            <Dropdown 
            ariaLabel="Basic"
            className="task-dropdown"
            placeholder="Select an Option"
            items={[
              { id: "item1", text: "Item 1" },
              { id: "item2", text: "Item 2" },
              { id: "item3", text: "Item 3" }
            ]}
            onSelect={this.onSelect}/>
            
            <label htmlFor="comment-input">Comment: </label>
            <TextField className="comment-input" inputType="text" inputId="comment" value={this.comment} onChange={this.onChangeComment} width={TextFieldWidth.standard} ></TextField>
            <Button className="add-time-log-btn" text="Add" iconProps={{ iconName: "Add" }} onClick={() => alert("API will be called to save data at this click!")}/>
        </div>

        <div className="time-logs-list">
          <Card className="flex-grow bolt-table-card" contentProps={{ contentPadding: false }}>
            <Table<ITableItem> 
              ariaLabel="Table with sorting"
              behaviors={[sortingBehavior]}
              className="table-example"
              columns={columns}
              containerClassName="h-scroll-auto"
              itemProvider={tableItems}
              role="table"
            />
          </Card>
        </div>
      </div>
    );
  }
  

  private onChangeHours = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue: string
  ) => {
    if (/^\d{0,2}$/.test(newValue) && parseInt(newValue) >= 0 && newValue.length === 1 && parseInt(newValue) <= 9) {
      this.hours.value = newValue
      // Handle other logic related to hours here
    }
  };

  private onChangeMins = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue: string
  ) => {
    if (/^\d{0,2}$/.test(newValue) && parseInt(newValue) >= 0 && parseInt(newValue) <= 59) {
      this.mins.value = newValue      // Handle other logic related to minutes here
    }
  };
  private onSelect = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<{}>) => {
        this.selectedItem.value = item.text || "";
  };

  private onChangeComment = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, newValue: string) => {
    this.comment.value = newValue
  }  
}

// Create the sorting behavior (delegate that is called when a column is sorted).
const sortingBehavior = new ColumnSorting<ITableItem>(
  (
      columnIndex: number,
      proposedSortOrder: SortOrder,
      event: React.KeyboardEvent<HTMLElement> | React.MouseEvent<HTMLElement>
  ) => {
      tableItems.splice(
          0,
          tableItems.length,
          ...sortItems<ITableItem>(
              columnIndex,
              proposedSortOrder,
              sortFunctions,
              columns,
              rawTableItems
          )
      );
  }
);

const sortFunctions = [
  // Sort on Name column
  (item1: ITableItem, item2: ITableItem): number => {
      return item1.user.text!.localeCompare(item2.user.text!);
  },

  // Sort on Age column
  // (item1: ITableItem, item2: ITableItem): number => {
  //     return item1.age - item2.age;
  // },

  // Gender column does not need a sort function
  null,
];

const tableItems = new ObservableArray<ITableItem>(rawTableItems);
function onSize(event: MouseEvent, index: number, width: number) {
  (columns[index].width as ObservableValue<number>).value = width;
}

const columns = [
  {
    id: "action",
    name: "Remove",
    width: new ObservableValue(-5),
    readonly: true,
    renderCell: renderNameColumn,
  },
  {
      id: "time",
      name: "Time",
      onSize: onSize,
      readonly: true,
      renderCell: renderSimpleCell,
      sortProps: {
          ariaLabelAscending: "Sorted A to Z",
          ariaLabelDescending: "Sorted Z to A",
      },
      width: new ObservableValue(-5),
  },
  {
      id: "user",
      name: "User",
      onSize: onSize,
      readonly: true, 
      renderCell: renderSimpleCell,
      width: new ObservableValue(-10),
  },
  {
      id: "date",
      name: "Date",
      width: new ObservableValue(-10),
      readonly: true,
      renderCell: renderSimpleCell,
  },
  {
    id: "type",
    name: "Type",
    width: new ObservableValue(-10),
    readonly: true,
    renderCell: renderSimpleCell,
  },
  {
    id: "comment",
    name: "Comment",
    width: new ObservableValue(-60),
    readonly: true,
    renderCell: renderSimpleCell,
  }
];

function renderNameColumn(this: any, rowIndex: number, columnIndex: number, tableColumn: ITableColumn<ITableItem>, tableItem: ITableItem): JSX.Element {
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

export default WorkItemFormGroupComponent;

showRootComponent(<WorkItemFormGroupComponent />);
