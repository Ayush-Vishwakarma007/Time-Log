import * as React from "react";
import { useMemo } from 'react';
import * as SDK from "azure-devops-extension-sdk";
import DatePicker from "react-datepicker";

import 'react-datepicker/dist/react-datepicker.css';
import './WorkItemFormGroup.scss';

import { setHours, setMinutes } from "date-fns";
import { TextField, TextFieldWidth } from "azure-devops-ui/TextField";
import { ObservableValue } from "azure-devops-ui/Core/Observable";

import { FaRegCircleXmark } from "react-icons/fa6";
import axios from "axios";

import { showRootComponent } from "../../Common";
import { CustomHeader, HeaderTitleArea } from "azure-devops-ui/Header";
import { Icon } from "azure-devops-ui/Icon";
import { Dropdown } from "azure-devops-ui/Dropdown";
import { IListBoxItem } from "azure-devops-ui/ListBox";
import { Button } from "azure-devops-ui/Button";
import { Card } from "azure-devops-ui/Card";
import { ITableColumn, SimpleTableCell, Table, renderSimpleCell } from "azure-devops-ui/Table";
import { ITableItem } from './TableData';
import { IProjectPageService, CommonServiceIds } from "azure-devops-extension-api";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";
import { API_BASE_URL } from "../../configuration";
import { IWorkItemLoadedArgs } from "azure-devops-extension-api/WorkItemTracking";
import { toast } from 'react-toastify';
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { useTable, usePagination } from "react-table";
import Pagination from "./Pagination";

interface WorkItemFormGroupComponentState {
  dateValue: Date;
  selectedDate: any;
  workType: any;
  extensionContext?: SDK.IExtensionContext;
  host?: SDK.IHostContext;
  message?: any;
  taskId?: any;
  taskName?: any;
  taskDetails?: any;
  selectedTeam?: any;
  allWorkLogs: any;
  isLoading: boolean
  currentPage?: any;
  setCurrentPage?: any;
}

interface IListBoxItemWithId<T> extends IListBoxItem<T> {
  id: string;
}
export class WorkItemFormGroupComponent extends React.Component<{}, WorkItemFormGroupComponentState> {
  private hours = new ObservableValue<string>("0");
  private mins = new ObservableValue<string>("0");
  private comment = new ObservableValue<string>("");

  constructor(props: {}) {
    super(props);
    this.state = {
      dateValue: new Date(),
      selectedDate: new Date(),
      workType: [],   
      allWorkLogs: [],
      isLoading : false,   
      currentPage : 1
    };
  }

  public async componentDidMount() {
    try {
      this.fetchData().then((workType) => {
        this.setState({ workType });
      }).catch((error) => {
        console.error("Error fetching team data: ", error);
      });
  
      await SDK.init().then(() => { this.registerSdk() });
      await SDK.ready();
      await this.getAllWorkLogs();
    } catch (error) {
      console.error('Error during SDK initialization:', error);
    }
  }  

  private registerSdk = () => {
    SDK.register(SDK.getContributionId(), () => {
      return {
        onLoaded: (taskId: IWorkItemLoadedArgs) => {
          this.setState({taskId: taskId.id});
          this.fetchTaskById(this.state.taskId);
        },
      }
    });
  }

  private getAllWorkLogs = async () => {  
    const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
    const project = await projectService.getProject();
    const id = this.state.taskId.toString();
    const host = SDK.getHost();
    const request = {
      projectId: project.id,
      taskId: id
    };
    
    axios.post(`${API_BASE_URL}/timelogs/all/${host.name}`, request).then(response => {
      const allWorkLogs = response.data.data;
        this.setState({ allWorkLogs });
    });
  }

  private handleDateChange = (date: Date) => {
    this.setState({ selectedDate: date });
    if (date.getDate() === new Date().getDate()) {
      this.setState({ dateValue: setHours(setMinutes(new Date(), 0), 18) });
    } else {
      this.setState({ dateValue: setHours(setMinutes(new Date(), 0), 0) });
    }
  };  

  private fetchData = async () => {
    try {    
        const accessToken = await SDK.getAccessToken();
        const headers = {
            Authorization: `Bearer ${accessToken}`
        };
        const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
        const project = await projectService.getProject();  
        const userName = SDK.getUser();
        this.setState({
            extensionContext: SDK.getExtensionContext(),
            host: SDK.getHost()
         });
         axios.post(`${API_BASE_URL}/workType/getAllWorkType/${this.state.host.name}`, { headers }).then(response => {
             const workType = response.data['data'];
     
             const workTypeWithStringIds = workType.map((workType: any) => ({
                 ...workType,
                 id: workType.id.toString()
             }));
     
             this.setState({ workType: workTypeWithStringIds });
         })
         .catch(error => {
             console.error("Error fetching team data: ", error);
         });    
         
    } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response) {
            console.error('Error response:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Request setup error:', error.message);
        }
    }
};

private fetchTaskById = async (taskId: number) => {
  try {
    const accessToken = await SDK.getAccessToken();
    const headers = {
      Authorization: `Bearer ${accessToken}`
    };
    const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
    const project = await projectService.getProject(); 
    const Id = taskId.toString()
    const baseUrl = `https://dev.azure.com/${this.state.host.name}/${project.id}/_apis/wit/workitems/${Id}?api-version=7.1-preview.3`;
    const response = await axios.get(baseUrl, { headers });
    const selectedTask = response;
    console.log("Response__: ", response.data)
    this.setState({taskDetails : selectedTask.data})
  } catch (error) {
    console.error(`Error fetching task with ID ${taskId}:`, error);
  }
};

private onClickTrash = async (tableItem: ITableItem) => {
  const isConfirmed = window.confirm("Are you sure you want to delete this log?");

  if (isConfirmed) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/timelogs/{id}?id=${tableItem.id}`);
      toast.success('Work type deleted successfully');
      this.getAllWorkLogs();
    } catch (error) {
      console.error(error);
    }
  } else {
    console.log("Deletion canceled");
  }
};

  private setCurrentPage = (newPage:any) => {
    this.setState({ currentPage: newPage });
  };
  

  public render(): JSX.Element {
    const currentPage = this.state.currentPage;

    const { workType, allWorkLogs } = this.state;
      const formattedWorkTypes: ITableItem[] = allWorkLogs.map((item: any) => ({
      time: item.time,
      user: {text: item.user},
      date: item.date,
      type: item.workType,
      comment: item.comment,
      id: item.id
    }));    

    let PageSize = 8;
    let itemProvider = new ArrayItemProvider<ITableItem>(formattedWorkTypes);
      if(itemProvider){
        itemProvider['items'] = useMemo(() => {
          const firstPageIndex = (currentPage - 1) * PageSize;
          const lastPageIndex = firstPageIndex + PageSize;
          return itemProvider['items'].slice(firstPageIndex, lastPageIndex);
        }, [currentPage]);
        console.log("Item provider__: ", itemProvider)
      }

        if ((!workType) || (!allWorkLogs)) {
            return <div className="flex-row">
                <div style={{ marginLeft: 4 }} />
                <div>Loading...</div>
            </div>;
        }

    function onSize(event: MouseEvent, index: number, width: number) {
      (columns[index].width as ObservableValue<number>).value = width;
    }

    const columns = [
      {
        id: "action",
        name: "Remove",
        width: new ObservableValue(-10),
        readonly: true,
        renderCell: (rowIndex: number, columnIndex: number, tableColumn: ITableColumn<ITableItem>, tableItem: ITableItem): JSX.Element => {
          return renderNameColumn(rowIndex, columnIndex, tableColumn, tableItem);
        }
      },
      {
          id: "time",
          name: "Time",
          onSize: onSize,
          readonly: true,
          renderCell: renderSimpleCell,
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
        width: new ObservableValue(-55),
        readonly: true,
        renderCell: renderSimpleCell,
      }
    ];

    const renderNameColumn = (
      rowIndex: number,
      columnIndex: number,
      tableColumn: ITableColumn<ITableItem>,
      tableItem: ITableItem
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
            <DatePicker
              className="date-picker-input"
              id="date-picker"
              selected={this.state.selectedDate}
              onChange={this.handleDateChange}
              timeIntervals={1}
              dateFormat="MMMM d, yyyy"
              maxDate={new Date()}
            />
            
            <label htmlFor="date-picker">Type: </label>
            <Dropdown 
              ariaLabel="Basic"
              className="task-dropdown"
              placeholder="Select an Option"
              items={workType.map((work: { id: string; type: string; }) => ({
                  id: work.id,
                  text: work.type
              }))}
              onSelect={this.onSelect}
            />            
            <label htmlFor="comment-input">Comment: </label>
            <TextField className="comment-input" inputType="text" inputId="comment" value={this.comment} onChange={this.onChangeComment} width={TextFieldWidth.standard} ></TextField>
            <Button className="add-time-log-btn" text="Add" iconProps={{ iconName: "Add" }} onClick={this.onAddData}/>
        </div>

        {itemProvider && <div className="time-logs-list">
          <Card className="flex-grow bolt-table-card" contentProps={{ contentPadding: false }}>
            <Table<ITableItem> 
              ariaLabel="Table with sorting"
              className="table-example"
              columns={columns}
              containerClassName="h-scroll-auto"
              itemProvider={itemProvider}
              role="table"
            />
          </Card>
          <Pagination
          className="pagination-bar"
          currentPage={currentPage}
          totalCount={itemProvider.length}
          pageSize={PageSize}
          onPageChange={(page: any) => this.setCurrentPage(page)}
        />
        </div>}
        {this.state.isLoading && <Spinner className="spinner" size={SpinnerSize.medium} />}
      </div>
    );
  }  

  private onChangeHours = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue: string
  ) => {
    if (/^\d{0,2}$/.test(newValue) && parseInt(newValue) >= 0 && newValue.length === 1 && parseInt(newValue) <= 9) {
      this.hours.value = newValue
    }
  };

  private onChangeMins = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue: string
  ) => {
    if (/^\d{0,2}$/.test(newValue) && parseInt(newValue) >= 0 && parseInt(newValue) <= 59) {
      this.mins.value = newValue 
    }
  };
  private onSelect = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItemWithId<{}>) => {
    const selectedTeam = this.state.workType.find((team: { id: string }) => team.id === item.id);
    this.setState({selectedTeam})
  };  

  private onChangeComment = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, newValue: string) => {
    this.comment.value = newValue
  }
  
  private onAddData = async () => {
      // Set isLoading to true when starting the API request
      this.setState({ isLoading: true });

      const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
      const project = await projectService.getProject();
      const userName = SDK.getUser();
      const id = this.state.taskId.toString();

      const dateString = this.state.selectedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      console.log("Project__: ", project)
      const req = {
        comment: this.comment.value,
        date: dateString,
        hours: this.hours.value,
        minute: this.mins.value,
        projectId: project.id,
        taskId: id,
        userName: userName.displayName,
        workTypeId: this.state.selectedTeam.id,
        taskName: this.state.taskDetails['fields']['System.Title'],
        projectName: project.name
      };

      try {
        const response = await axios.post(`${API_BASE_URL}/timelogs/save`, req);

        if (response.data.status.code === 200) {
          this.comment.value = '';
          this.hours.value = '';
          this.mins.value = '';
          this.setState({ selectedTeam: '' });
          toast.success(response.data.status.status);
          this.getAllWorkLogs();
        } else {
          toast.error(response.data.status.status);
        }
      } catch (error) {
        console.error(error);
        toast.error('An error occurred while processing the request');
      } finally {
        this.setState({ isLoading: false });
      }
  };
}

export default WorkItemFormGroupComponent;

showRootComponent(<WorkItemFormGroupComponent />);
