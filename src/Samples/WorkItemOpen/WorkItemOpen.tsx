import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";

import 'react-datepicker/dist/react-datepicker.css';
import "./WorkItemOpen.scss";
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

import { IWorkItemFormNavigationService, WorkItemTrackingRestClient, WorkItemTrackingServiceIds } from "azure-devops-extension-api/WorkItemTracking";
import { showRootComponent } from "../../Common";
import { FaFileAlt } from "react-icons/fa";
import { HeaderCommandBar } from "azure-devops-ui/HeaderCommandBar";
import { commandBarItemsSummary } from "./SummaryData";

interface WorkItemFormGroupComponentState {
    startDate: Date;
    selectedDate: Date;
    endDate: Date;
    teamData: any;
    extensionContext?: SDK.IExtensionContext;
    host?: SDK.IHostContext;
  }  
class WorkItemOpenContent extends React.Component<{}, WorkItemFormGroupComponentState> {
    private selectedItem = new ObservableValue<string>("");
    private selectedTeamName = new ObservableValue<string>("");
    private teamData : any
    constructor(props: {}) {
        super(props);
        this.state = {
            startDate: new Date(),
            selectedDate: new Date(),
            endDate: this.calculateEndDate(new Date()),
            teamData: [],
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
                 this.setState({ teamData });
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

    private handleDateChange = (date: Date) => {
        this.setState({ selectedDate: date });
        this.setState({
            startDate: date.getDate() === new Date().getDate()
                ? setHours(setMinutes(new Date(), 0), 18)
                : setHours(setMinutes(new Date(), 0), 0),
            endDate: this.calculateEndDate(date)
        });
    };
    private calculateEndDate = (startDate: Date) => {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() - 15);
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
        const { teamData } = this.state;

        if (!teamData || !teamData.length) {
            return <div className="flex-row">
                <div style={{ marginLeft: 4 }} />
                <Spinner size={SpinnerSize.medium} />
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
                            <label htmlFor="team-dropdown" className="team-lable">Team: </label>
                            <Dropdown ariaLabel="Basic" className="team-dropdown" inputId="team-dropdown" placeholder="Select Team"
                                items={teamData.map((team: { id: any; name: any; }) => ({
                                    id: team.id,
                                    text: team.name
                                }))}
                                onSelect={this.onTeamData}/>

                            <label htmlFor="team-dropdown" className="team-lable">Team User: </label>
                            <Dropdown ariaLabel="Basic" className="team-dropdown" inputId="team-dropdown" placeholder="Select Team"
                                items={[
                                { id: "item1", text: "Item 1" },
                                { id: "item2", text: "Item 2" },
                                { id: "item3", text: "Item 3" }
                                ]}
                                onSelect={this.onSelect}/>

                            <label htmlFor="date-picker" className="team-lable">From Date: </label>
                            <DatePicker className="date-picker-input" id="date-picker" selected={this.state.selectedDate} onChange={this.handleDateChange}
                            timeIntervals={1} dateFormat="MMMM d, yyyy"/>  
                            <label htmlFor="date-picker" className="team-lable">To Date: </label>
                            <DatePicker className="date-picker-input" id="date-picker" selected={this.state.endDate}  onChange={(date) => {}}
                            timeIntervals={1} dateFormat="MMMM d, yyyy"/>
                            <Button className="summary-search" text="Search" iconProps={{ iconName: "Play" }} onClick={this.onClickSearch}/>  
                        </div>
                    </div>
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

    private onSelect = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<{}>) => {
        const selectedTeam = this.teamData.find((team: { id: string; }) => team.id === item.id);
        console.log("Selected Team:", selectedTeam);
      };
      // Example onSelect function
      private onTeamData = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<{}>) => {
        const selectedTeam = this.state.teamData.find((team: { id: string }) => team.id === item.id);
        console.log("Selected Team:", selectedTeam);
    };

    private onSelectTeamName = (event: React.SyntheticEvent<HTMLElement>, item: any) => {
        console.log("Item__: ", item)
        this.selectedTeamName.value = item.name || "";
    };
    private onClickSearch = () => {
        console.log("Search button clicked");
        console.log("TEAM DATA__: ", this.state.teamData)
    }
    
}

showRootComponent(<WorkItemOpenContent />);
