import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { ISimpleTableCell } from "azure-devops-ui/Table";

export const commandBarItemsSimple: IHeaderCommandBarItem[] = [
    {
        iconProps: {
            iconName: "Add"
        },
        id: "testCreate",
        important: true,
        onActivate: () => {
            alert("This would normally trigger a modal popup");
        },
        text: "Action",
        tooltipProps: {
            text: "Custom tooltip for create"
        },

    },
    {
        iconProps: {
            iconName: "Delete"
        },
        id: "testDelete",
        important: false,
        onActivate: () => {
            alert("submenu clicked");
        },
        text: "Menu row with delete icon"
    },
    {
        iconProps: {
            iconName: "Share"
        },
        id: "testShare",
        important: false,
        onActivate: () => {
            alert("submenu clicked");
        },
        text: "Menu row with share icon"
    }
];

export const commandBarItemsAdvanced: IHeaderCommandBarItem[] = [
    {
        iconProps: {
            iconName: "Download"
        },
        id: "testSave",
        important: true,
        onActivate: () => {
            alert("Example text");
        },
        text: "Download All Logs"
    },
];

// export const rawTableItemsWorkType: ITableItemWorkType[] = [
//     {
//         type: 'Project Management',
//     },
//     {
//         type: 'Development',
//     },
//     {
//         type: 'Business Analysis',
//     },
//     {
//         type: 'Quality Assurance',
//     },
// ];
// export const tableItems = new ArrayItemProvider<ITableItemWorkType>(rawTableItemsWorkType);


export interface ITableItemWorkType extends ISimpleTableCell {
    id: number;
    type: string;       
}
