import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import axios, { all } from 'axios';


export const commandBarItemsSummary: IHeaderCommandBarItem[] = [
    {
        iconProps: {
            iconName: "Download"
        },
        id: "testSave",
        important: true,
        isPrimary: true,
        onActivate: () => {
            const req = {
                
            }
        },
        text: "Download All Logs"
    },
];