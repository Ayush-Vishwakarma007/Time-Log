import React from "react";
import * as SDK from "azure-devops-extension-sdk";

import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { TextField, TextFieldStyle, TextFieldWidth } from "azure-devops-ui/TextField";
import { ObservableValue } from "azure-devops-ui/Core/Observable";

import './WorkItemFormGroup.scss';
import { showRootComponent } from "../../Common";

interface WorkItemFormGroupComponentState {
  hours: string;
  mins: string;
  dateValue: Date;
}

export class WorkItemFormGroupComponent extends React.Component<{}, WorkItemFormGroupComponentState> {
  private hours = new ObservableValue<string>("0");
  private mins = new ObservableValue<string>("0");

  constructor(props: {}) {
    super(props);
    this.state = {
      hours: "0",
      mins: "0",
      dateValue: new Date()
    };
  }

  public componentDidMount() {
    SDK.init();
}

  public render(): JSX.Element {
    return (
      <div className="time-input">
        <label htmlFor="hours">Hours: </label>
        <TextField
          autoAdjustHeight
          maxLength={2}
          autoFocus={true}
          style={TextFieldStyle.inline}
          className="input-hours"
          inputType="number"
          inputId="hours"
          value={this.state.hours}
          onChange={this.onChangeHours}
          width={TextFieldWidth.standard}
        />
        <label htmlFor="mins">Mins: </label>
        <TextField
          autoAdjustHeight
          maxLength={2}
          autoFocus={true}
          style={TextFieldStyle.inline}
          className="input-mins"
          inputType="number"
          inputId="mins"
          value={this.state.mins}
          onChange={this.onChangeMins}
          width={TextFieldWidth.standard}
        />
        <DatePicker selected={this.state.dateValue} onChange={this.handleDateChange} />
      </div>
    );
  }

  private onChangeHours = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue: string
  ) => {
    if (/^\d{0,2}$/.test(newValue) && parseInt(newValue) >= 0 && newValue.length === 1 && parseInt(newValue) <= 9) {
      this.hours.value = newValue;
      // Handle other logic related to hours here
    }
  };

  private onChangeMins = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue: string
  ) => {
    if (/^\d{0,2}$/.test(newValue) && parseInt(newValue) >= 0 && parseInt(newValue) <= 59) {
      this.mins.value = newValue;
      // Handle other logic related to minutes here
    }
  };
  private handleDateChange = (date: Date) => {
    this.setState({ dateValue: date });
    // Handle other logic related to the date here
  };
}

export default WorkItemFormGroupComponent;

showRootComponent(<WorkItemFormGroupComponent />);