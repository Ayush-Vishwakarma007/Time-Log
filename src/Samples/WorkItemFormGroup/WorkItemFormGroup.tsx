import React from "react";
import * as SDK from "azure-devops-extension-sdk";
import DatePicker from "react-datepicker";

import 'react-datepicker/dist/react-datepicker.css';
import './WorkItemFormGroup.scss';

import { setHours, setMinutes } from "date-fns";
import { TextField, TextFieldStyle, TextFieldWidth } from "azure-devops-ui/TextField";
import { ObservableValue } from "azure-devops-ui/Core/Observable";

import { Observer } from "azure-devops-ui/Observer";
import { showRootComponent } from "../../Common";
import { CustomHeader, HeaderTitleArea } from "azure-devops-ui/Header";
import { Icon } from "azure-devops-ui/Icon";
import { Dropdown } from "azure-devops-ui/Dropdown";
import { IListBoxItem } from "azure-devops-ui/ListBox";

interface WorkItemFormGroupComponentState {
  dateValue: Date;
  selectedDate: Date;
}

export class WorkItemFormGroupComponent extends React.Component<{}, WorkItemFormGroupComponentState> {
  private hours = new ObservableValue<string>("0");
  private mins = new ObservableValue<string>("0");
  private selectedItem = new ObservableValue<string>("");

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
            
            <label htmlFor="date-picker">Description: </label>
            <Dropdown 
            ariaLabel="Basic"
            className="task-dropdown"
            items={[
              { id: "item1", text: "Item 1" },
              { id: "item2", text: "Item 2" },
              { id: "item3", text: "Item 3" }
            ]}
            onSelect={this.onSelect}/>
            {/* <Observer selectedItem={this.selectedItem}>
              {(props: { selectedItem: string }) => {
                return (
                  <span style={{ marginLeft: "8px", width: "150px" }}>
                    Selected Item: {props.selectedItem}{" "}
                  </span>
                );
              }}
            </Observer> */}
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
  
}

export default WorkItemFormGroupComponent;

showRootComponent(<WorkItemFormGroupComponent />);
