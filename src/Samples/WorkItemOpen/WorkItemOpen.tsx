import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";

import 'react-datepicker/dist/react-datepicker.css';
import "./WorkItemOpen.scss";
import 'react-pivottable/pivottable.css';

import { CommonServiceIds, IProjectPageService } from "azure-devops-extension-api";
import axios from 'axios';
import DatePicker from "react-datepicker";
import { setHours, setMinutes } from "date-fns";
import { Button } from "azure-devops-ui/Button";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { Dropdown } from "azure-devops-ui/Dropdown";
import { IListBoxItem } from "azure-devops-ui/ListBox";
import { CustomHeader, HeaderIcon, HeaderTitle, HeaderTitleArea, HeaderTitleRow, TitleSize } from "azure-devops-ui/Header";
import { Page } from "azure-devops-ui/Page";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";
import { showRootComponent } from "../../Common";
import { FaFileAlt } from "react-icons/fa";
import { HeaderCommandBar, IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { TextField, TextFieldWidth } from "azure-devops-ui/TextField";
import PivotTable from 'react-pivottable/PivotTable';
import { API_BASE_URL } from "../../configuration";


interface WorkItemFormGroupComponentState {
    startDate: Date;
    selectedDate: Date;
    endDate: Date;
    teamData: any;
    allUsers: any;
    extensionContext?: SDK.IExtensionContext;
    host?: SDK.IHostContext;
    selectedTeam?: any;
    currentUser:string;
    userLogs?: any;
    selectedUser?:any;
    isLoading: boolean
  }
  interface RowData {
    User?: string;
    Project?: string;
    Task?: string;
    'Work Type'?: string;
    Week?: string;
    Days?: string;
    timeTaken?: any;
    hours?:any;
    min?:any
  }     
class WorkItemOpenContent extends React.Component<{}, WorkItemFormGroupComponentState> {
    private selectedTeamName = new ObservableValue<string>("");
    private currentProject = new ObservableValue<string>('')

    constructor(props: {}) {
        super(props);
        this.state = {
            startDate: new Date(),
            selectedDate: new Date(),
            endDate: new Date(),
            teamData: [],
            allUsers: [],
            currentUser:'',
            isLoading : false 
          };
    }

    public async componentDidMount() {
        try {
            this.fetchData().then((teamData) => {
                this.setState({ teamData });
            }).catch((error) => {
                console.error("Error fetching team data: ", error);
            });
            await SDK.init();
            await SDK.ready();
        } catch (error) {
          console.error('Error during SDK initialization:', error);
        }
    }
      
    private fetchData = async () => {
        try {    
            const accessToken = await SDK.getAccessToken();
            const headers = {
                Authorization: `Bearer ${accessToken}`
            };
            const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
            const project = await projectService.getProject();  
            this.setState({
                extensionContext: SDK.getExtensionContext(),
                host: SDK.getHost()
             });
             axios.get(`https://dev.azure.com/${this.state.host.name}/_apis/projects/${project.id}/teams?api-version=7.1-preview.3`, { headers })
             .then(response => {
                 const teamData = response.data.value;
                 this.currentProject.value = teamData.name
                 this.setState({currentUser: teamData.name})
                 this.setState({ teamData });
                 this.fetchAllUsers(teamData)
             }).catch(error => {
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

    private fetchAllUsers = async (selectedTeam: any) => {
        try {
            if (!selectedTeam) {
                console.error('No selected team.');
                return;
            }    
            const accessToken = await SDK.getAccessToken();
            const headers = {
                Authorization: `Bearer ${accessToken}`
            };
            const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
            const project = await projectService.getProject();  
            axios.get(`https://dev.azure.com/${this.state.host.name}/_apis/projects/${project.id}/teams/${selectedTeam[0].id}/members?api-version=7.1-preview.2`, {headers}).then(response => {
                    const allUsers = response['data']['value']
                    this.setState({allUsers})
            });
        } catch (error) {
            console.error("Error while fetching user details:", error);
        }
    }
    

    private handleStartDateChange = (date: Date) => {
        this.setState({
          startDate: date,
        });
      };
      
      private handleDateChange = (date: Date) => {
        this.setState({ selectedDate: date });
      };
      
      private calculateEndDate = (endDate: Date) => {
        console.log("End date__: ", endDate)
        this.setState({endDate})
      };
    
    private handleEndDateChange = (date: Date) => {
        this.setState({ selectedDate: date });
        if (date.getDate() === new Date().getDate()) {
          this.setState({ endDate: setHours(setMinutes(new Date(), 0), 18) });
        } else {
          this.setState({ endDate: setHours(setMinutes(new Date(), 0), 0) });
        }
    };

    public render(): JSX.Element {
        const { teamData, allUsers, currentUser, userLogs, isLoading } = this.state;
        
        let pivotTableData = userLogs;
        const rows = ['User', 'Project', 'ID Task', 'Work Type'];

        if ((!teamData)) {
            return <div className="flex-row">
                <div style={{ marginLeft: 4 }}/>
                Loading...
            </div>;
        }
        const formatTime = (hours:any, minutes:any) => {
            const formattedHours = String(hours).padStart(2, '0');
            const formattedMinutes = String(minutes).padStart(2, '0');
            return `${formattedHours}:${formattedMinutes}`;
        };
          
        const aggregators = {
            timeAggregator: (attributeArray: any) => {
              return function (data: any, rowKey: any, colKey: any) {
                let totalHours = 0;
                let totalMinutes = 0;
          
                return {
                  push: function (record: { hours: string; min: string; }) {
                    totalHours += parseInt(record.hours);
                    totalMinutes += parseInt(record.min);
                  },
                  value: function () {
                    // Convert excess minutes to hours
                    totalHours += Math.floor(totalMinutes / 60);
                    totalMinutes = totalMinutes % 60;
                    console.log("minutes__: ", totalMinutes)
                    return formatTime(totalHours, totalMinutes);
                  },
                  format: function (x: any) {
                    return x;
                  },
                  numInputs: 0,
                };
              };
            },
          };
          

        if(pivotTableData){
            pivotTableData = pivotTableData.map((item:any) => ({
                ...item,
                formattedTime: formatTime(parseInt(item.hours), parseInt(item.min)),
            }));
        }

        const downloadUserLogsExcel = async () => {
            const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
            const project = await projectService.getProject();
            const formattedStartDate = this.formatDate(this.state.startDate);
            const formattedEndDate = this.formatDate(this.state.endDate);
            
            const request = {
                endDate: formattedEndDate,
                projectTeam: project.id,
                startDate: formattedStartDate,
                userName: this.state.selectedUser
            };
            
            axios.post(`${API_BASE_URL}/timelogs/excel/project/${this.state.host.name}`, request, { responseType: 'blob' })
                .then(response => {
                    const blob = new Blob([response.data], { type: response.headers['content-type'] });
                    const link = document.createElement('a');

                    link.href = window.URL.createObjectURL(blob);        
                    link.download = `${request.userName}_${request.startDate}_TimeLogs.xlsx`;
        
                    document.body.appendChild(link);        
                    link.click();        
                    document.body.removeChild(link);
                })
                .catch(error => {
                    console.error('Error downloading file', error);
                });
                
        };
        

        const commandBarItemsSummary_: IHeaderCommandBarItem[] = [
            {
                iconProps: {
                    iconName: "Download"
                },
                id: "testSave",
                important: true,
                isPrimary: true,
                onActivate: () => {downloadUserLogsExcel()},             
                text: "Download CSV"
            },
        ];
        
        return (
            <div className="main-page">
                <Page className="page flex-grow">
                    <div className="summary-header">
                        <CustomHeader separator>
                            <HeaderIcon className="bolt-table-status-icon-large" iconProps={{ render: this.renderStatus }} titleSize={TitleSize.Large}/>
                            <HeaderTitleArea>
                                <HeaderTitleRow className="header-title">
                                    <HeaderTitle ariaLevel={3} className="text-ellipsis" titleSize={TitleSize.Large}>Time Log Summary</HeaderTitle>
                                </HeaderTitleRow>
                            </HeaderTitleArea>
                            <HeaderCommandBar items={commandBarItemsSummary_}/>
                        </CustomHeader>
                    </div>
                    <div className="summary-filter">
                        <div className="team-details">
                            <label htmlFor="team-dropdown" className="team-lable">Project: </label>
                            <TextField
                            className="team-dropdown"
                            inputType="text"
                            inputId="hours"
                            value={teamData.map((team:any) => team.name).join(', ')}
                            width={TextFieldWidth.standard}
                            disabled ={ true}
                            />
                            <label htmlFor="team-dropdown" className="team-lable">User: </label>
                            <Dropdown ariaLabel="Basic" className="team-dropdown" inputId="team-dropdown" placeholder="Select Team User"
                                items={allUsers.map((team:any) => ({
                                    id: team['identity'].id,
                                    text: team['identity'].displayName
                                }))}
                                onSelect={this.onSelectUser}/>
                            <label htmlFor="date-picker" className="team-lable">From Date: </label>
                            <DatePicker
                                maxDate={new Date()}
                                className="date-picker-input"
                                id="date-picker"
                                selected={this.state.startDate}
                                onChange={this.handleStartDateChange}
                                timeIntervals={1}
                                dateFormat="MMMM d, yyyy"
                            />
                            <label htmlFor="date-picker" className="team-lable">To Date: </label>
                            <DatePicker
                                maxDate={new Date()}
                                className="date-picker-input"
                                id="date-picker"
                                selected={this.state.endDate}
                                onChange={this.calculateEndDate}   
                                timeIntervals={1}
                                dateFormat="MMMM d, yyyy"
                            />
                            <Button className="summary-search" text="Search" iconProps={{ iconName: "Play" }} onClick={this.onClickSearch}/>  
                        </div>
                    </div>
                    {this.state.userLogs &&
                        <div className="pivot-table-container">
                            <div id="output"></div>
                            <PivotTable
                            rows={rows}
                            cols={["Week", "Days"]}
                            data={pivotTableData}
                            vals={['formattedTime']}
                            aggregators={aggregators}
                            aggregatorName="timeAggregator"
                            />
                        </div>
                    }
                {isLoading && <Spinner className="spinner" size={SpinnerSize.large}/>}
                </Page>
            </div>
        );
    }
    
    private renderStatus = (className?: string) => {
        return (
            <div className="summary-icon">
                <FaFileAlt/> 
            </div>
        )
    };

    private onSelectUser = async (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<{}>) => {
        const selectedUser = this.state.allUsers.find((team:any) => team['identity'].id === item.id);
        const userName = selectedUser['identity']['displayName'];
        this.setState({selectedUser: userName})
    };

    private onSelectTeamName = (event: React.SyntheticEvent<HTMLElement>, item: any) => {
        this.selectedTeamName.value = item.name || "";
    };

    private transformApiData = (apiData: any) => {
        const transformedData: any[] = [];
            if (apiData.userLogs.length > 0) {
                apiData.userLogs.forEach((userLog:any) => {
                    userLog.workItemLogs.forEach((workItemLog:any) => {
                        workItemLog.workTypeLogs.forEach((workTypeLog:any) => {
                            workTypeLog.workTypeDayWiseLogs.forEach((dayWise:any) => {
                                const rowData: any = {
                                    User: userLog.userName || '', 
                                    Project: userLog.projectName || '', 
                                    'ID Task': workItemLog.workItem || '', 
                                    'Work Type': workTypeLog.workType || '', 
                                    Week: dayWise.startDate || '',
                                    Days: `${dayWise.loggedDay} ${dayWise.loggedWeekDay.substring(0,3)}`,
                                    timeTaken: `${dayWise.hours}:${dayWise.min}`,
                                    hours: dayWise.hours,
                                    min: dayWise.min
                                  };     
                                transformedData.push(rowData);
                            })
                        });
                    });
                });                
            }            
        return transformedData;
    };
  
    
    private onClickSearch = async () => {
        this.setState({ isLoading: true });

        const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
        const project = await projectService.getProject();
        const formattedStartDate = this.formatDate(this.state.startDate);
        const formattedEndDate = this.formatDate(this.state.endDate);
        
        const request = {
            endDate: formattedEndDate,
            projectTeam: project.id,
            startDate: formattedStartDate,
            userName: this.state.selectedUser
        };

        try {
            axios.post(`${API_BASE_URL}/timelogs/getTimeLogSummary/${this.state.host.name}`, request).then(response => {
                if(response.data.status.code === 200){
                    this.setState({ isLoading: false });
                    const transformedData = this.transformApiData(response.data.data);
                    this.setState({userLogs: transformedData});
                }
            });   
        } catch (error) {
            console.error(error);
            this.setState({ isLoading: false });
        }
    }    

    private formatDate(dateString: Date) {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = { month: '2-digit', day: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }     
}

showRootComponent(<WorkItemOpenContent />);
