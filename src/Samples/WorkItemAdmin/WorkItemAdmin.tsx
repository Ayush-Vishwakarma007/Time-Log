import { showRootComponent } from "../../Common";
import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";
import { Page } from "azure-devops-ui/Page";

class WorkItemAdminConponent extends React.Component<{}, {}>{
    constructor(props: {}) {
        super(props);
    }

    public componentDidMount() {
        SDK.init();
    }

    public render(): JSX.Element{
        return(
            <div>
                Hello
                <Page>Hello World !!!</Page>
            </div>
        );
    }
}


showRootComponent(<WorkItemAdminConponent/>)
export default WorkItemAdminConponent