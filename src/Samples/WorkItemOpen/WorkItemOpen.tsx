import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";

import 'react-datepicker/dist/react-datepicker.css';
import "./WorkItemOpen.scss";
import 'react-pivottable/pivottable.css';
import { CommonServiceIds, IProjectPageService } from "azure-devops-extension-api";

import axios, { all } from 'axios';
import DatePicker from "react-datepicker";
import { setHours, setMinutes } from "date-fns";
import { Button } from "azure-devops-ui/Button";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { Dropdown } from "azure-devops-ui/Dropdown";
import { IListBoxItem } from "azure-devops-ui/ListBox";
import { CustomHeader, HeaderIcon, HeaderTitle, HeaderTitleArea, HeaderTitleRow, TitleSize } from "azure-devops-ui/Header";
import { Page } from "azure-devops-ui/Page";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";

import { IWorkItemFormNavigationService, WorkItemTrackingRestClient, WorkItemTrackingServiceIds } from "azure-devops-extension-api/WorkItemTracking";
import { showRootComponent } from "../../Common";
import { FaFileAlt } from "react-icons/fa";
import { HeaderCommandBar } from "azure-devops-ui/HeaderCommandBar";
import { commandBarItemsSummary } from "./SummaryData";
import { TextField, TextFieldWidth } from "azure-devops-ui/TextField";
import PivotTable from 'react-pivottable/PivotTable';
import { TableInput } from "react-pivottable";
import { API_BASE_URL } from "../../configuration";
import { PivotData } from "react-pivottable/Utilities";


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
    User: string;
    Project: string;
    Task: string;
    'Work Type': string;
    Week: string;
    Days: string;
}        
class WorkItemOpenContent extends React.Component<{}, WorkItemFormGroupComponentState> {
    private selectedItem = new ObservableValue<string>("");
    private selectedTeamName = new ObservableValue<string>("");
    private showTeam = new ObservableValue<boolean>(true)
    private teamData : any
    private currentProject = new ObservableValue<string>('')

    constructor(props: {}) {
        super(props);
        this.state = {
            startDate: new Date(),
            selectedDate: new Date(),
            endDate: this.calculateEndDate(new Date()),
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
            // await this.fetchAllUsers();
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
            const userName = SDK.getUser();
            console.log("UserName__: ", userName);
            console.log("Project Details__: ", project)
            this.setState({
                extensionContext: SDK.getExtensionContext(),
                host: SDK.getHost()
             });
             console.log("HOST__: ", this.state.host)
             axios.get(`https://dev.azure.com/${this.state.host.name}/_apis/projects/${project.id}/teams?api-version=7.1-preview.3`, { headers })
             .then(response => {
                 console.log("TEAM DATA__: ", response);
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
        console.log("Selected Team__: ", selectedTeam[0])
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
                    console.log("All Users__: ", response);
            });
        } catch (error) {
            console.error("Error while fetching user details:", error);
        }
    }
    

    private handleStartDateChange = (date: Date) => {
        const endDate = this.calculateEndDate(date);
        this.setState({
          startDate: date,
          endDate: endDate,
          selectedDate: endDate,
        });
      };
      
      private handleDateChange = (date: Date) => {
        this.setState({ selectedDate: date });
      };
      
      private calculateEndDate = (startDate: Date) => {
        const endDate = new Date(startDate);
        endDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(endDate.getDate() - 1);
        return endDate;
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
        const generateRandomData = () => {
            const users = ['User1', 'User2', 'User3'];
            const projects = ['ProjectA']; // Only one project
            const tasks = ['Task1', 'Task2', 'Task3'];
            const workTypes = ['Design', 'Development', 'Testing'];

            const data: any[] = [];

            users.forEach((user) => {
                projects.forEach((project) => {
                tasks.forEach((task) => {
                    workTypes.forEach((workType) => {
                    const rowData: { [key: string]: string | number } = {
                        User: user,
                        Project: project,
                        Task: task,
                        'Work Type': workType,
                    };

                    let totalHours = 0;
                    Array.from({ length: 7 }, (_, i) => {
                        const hours = Math.floor(Math.random() * 8) + 1;
                        rowData[`${i + 16} Wed`] = hours;
                        totalHours += hours;
                    });

                    // rowData['Totals'] = totalHours;
                    data.push(rowData);
                    });
                });
                });
            });
            console.log("Random Data__: ", data)
            return data;
        };
        const data = [
            {
                "attr1": 'value1_attr1',
                "attr2": 'value1_attr2',
                "attr3": 'value1_attr2'
            },
            {
                "attr1": 'value2_attr1',
                "attr2": 'value2_attr2',
                "attr3": 'value2_attr2',
            },
            {
                'Days' : '16 Wed'
            },
            {
                'Days': '12 Thu'
            }
        ]
              
        const attributes = Object.keys(data[0]);
        console.log("UserLogsRender__: ", userLogs);
        const pivotTableData = this.state.userLogs;
        // const rows = ['attr1']; // Add more attributes if needed
        // const values = attributes.filter(attr => !rows.includes(attr));
        const rows = ['User', 'Project', 'Task', 'Work Type'];

        if ((!teamData)) {
            return <div className="flex-row">
                <div style={{ marginLeft: 4 }}/>
                Loading...
            </div>;
        }
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
                            <HeaderCommandBar items={commandBarItemsSummary}/>
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
                            <label htmlFor="team-dropdown" className="team-lable">Project User: </label>
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
                            selected={this.state.selectedDate}
                            onChange={this.handleDateChange}
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
                            aggregatorName="Sum"
                            rendererName="Table"
                            data={pivotTableData}
                            />
                        </div>
                    }
                </Page>
                {isLoading && <Spinner className="spinner" size={SpinnerSize.medium} />}
            </div>
        );
    }
    private handlePivotTableChange = (s: any) => {
        this.setState(s);
    };

    private renderStatus = (className?: string) => {
        return (
            <div className="summary-icon">
                <FaFileAlt/> 
            </div>
        )
    };

    private onSelect = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<{}>) => {
        const selectedTeam = this.teamData.find((team: { id: string; }) => team.id === item.id);
        console.log("Selected Team:", selectedTeam);
      };
      
    private onTeamData = async (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<{}>) => {
        const selectedTeam = this.state.teamData.find((team: { id: string }) => team.id === item.id);
        console.log("Selected Team:", selectedTeam);
        this.setState({selectedTeam});
        this.showTeam.value = false;
        await this.fetchAllUsers(selectedTeam);
    };
    private onSelectUser = async (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<{}>) => {
        const selectedUser = this.state.allUsers.find((team:any) => team['identity'].id === item.id);
        console.log("Selected Team:", selectedUser);
        const userName = selectedUser['identity']['displayName'];
        this.setState({selectedUser: userName})
    };

    private onSelectTeamName = (event: React.SyntheticEvent<HTMLElement>, item: any) => {
        console.log("Item__: ", item)
        this.selectedTeamName.value = item.name || "";
    };

    private transformApiData = (apiData: any) => {
        const transformedData: RowData[] = [];

            if (apiData.userLogs.length > 0) {
                apiData.userLogs.forEach((userLog:any) => {
                    userLog.workItemLogs.forEach((workItemLog:any) => {
                        workItemLog.workTypeLogs.forEach((workTypeLog:any) => {
                            const rowData: RowData = {
                                User: userLog.userName,
                                Project: userLog.projectName,
                                Task: workItemLog.workItem,
                                'Work Type': workTypeLog.workType,
                                Week: null,
                                Days: null
                            };        
                            transformedData.push(rowData);
                        });
                    });
                });                
            }

            let allDays_: any[] = [];
            apiData.logsDate.forEach((logsDate: any) => {
                if (logsDate.startDate) {
                    let week
                    if(logsDate.logDays.length>0){
                        week = logsDate.startDate
                        const days = logsDate.logDays.map((logDay: any) => logDay.day);
                        allDays_ = allDays_.concat(days);
                    }else{ week = null } 
                    console.log("Days__: ", logsDate)    
                    const rowDataWithWeek: RowData = {
                        User: '', 
                        Project: '', 
                        Task: '',
                        'Work Type': '', 
                        Week: week,
                        Days: logsDate.logDays.map((logDay: any) => logDay.day),
                    };                    
                    transformedData.push(rowDataWithWeek);
                }
            });
            // console.log("Final All Days: ", allDays_);
            // if(allDays_.length > 0){
            //     allDays_.forEach(day => {
            //         const rowDataWithDay: RowData = {
            //             User: '', 
            //             Project: '', 
            //             Task: '', 
            //             'Work Type': '', 
            //             Week: '',
            //             Days: day
            //         };  
            //         transformedData.push(rowDataWithDay)
            //     });
            // }          
            
        return transformedData;
    };
    private onClickSearch = async () => {
        this.setState({ isLoading: true });

        const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
        const project = await projectService.getProject();
        const userName = SDK.getUser();
        console.log("UserName__: ", this.state.selectedUser);
        console.log("Project Details__: ", project);
    
        // Format the dates here
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
                console.log("Search Response__: ", this.transformApiData(response.data.data));
                if(response.data.status.code === 200){
                    const transformedData = this.transformApiData(response.data.data);
                    this.setState({userLogs: transformedData});
                }
            });   
        } catch (error) {
            console.error(error)
        }finally{
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
