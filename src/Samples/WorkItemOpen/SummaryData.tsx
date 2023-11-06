import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";


export const commandBarItemsSummary: IHeaderCommandBarItem[] = [
    {
        iconProps: {
            iconName: "Download"
        },
        id: "testSave",
        important: true,
        isPrimary: true,
        onActivate: () => {
            alert("Example text");
        },
        text: "Download All Logs"
    },
];