import React, { Component } from 'react'
import * as SDK from "azure-devops-extension-sdk"

import "./WorkControls.scss"

import { showRootComponent } from "../../Common"
import { IWorkItemFormService, WorkItemTrackingServiceIds, WorkItemOptions } from "azure-devops-extension-api/WorkItemTracking"

class Options implements WorkItemOptions { returnOriginalValue: boolean = true }


class WorkControlsComponent extends Component<{}, { displayText : string }>{
    constructor(props: {}) {
        super(props)
        this.state = {
            displayText: "default text",
        }
    }

    public componentDidMount() {
        SDK.init({})
            .then( () => {
                this.setState({
                    displayText: SDK.getConfiguration().witInputs["SampleInput"]
            })
        })
    }

    public async render(): Promise<JSX.Element> {
        const workItemFormService = await SDK.getService<IWorkItemFormService>(
            WorkItemTrackingServiceIds.WorkItemFormService
        )
        console.log("Work Item Form Service__: ", workItemFormService)
        return (
            <>TESTING__: {this.state.displayText}</>
        )
    }
}

export default WorkControlsComponent
showRootComponent(<WorkControlsComponent />)