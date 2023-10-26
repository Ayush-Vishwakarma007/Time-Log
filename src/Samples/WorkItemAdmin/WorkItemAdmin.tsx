import { showRootComponent } from "../../Common";
import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";
import { Page } from "azure-devops-ui/Page";

class WorkItemAdminContent extends React.Component<{}, {}>{
    constructor(props: {}) {
        super(props);
    }

    public componentDidMount() {
        SDK.init();
    }

    public render(): JSX.Element{
        return(
            <Page>Hello World !!!</Page>
        );
    }
}

showRootComponent(<WorkItemAdminContent/>)