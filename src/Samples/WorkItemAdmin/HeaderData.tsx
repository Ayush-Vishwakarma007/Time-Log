import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { ISimpleListCell } from "azure-devops-ui/List";
import { MenuItemType } from "azure-devops-ui/Menu";
import { ISimpleTableCell } from "azure-devops-ui/Table";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { ITableItem, rawTableItems } from "../WorkItemFormGroup/TableData";

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
            iconName: "Save"
        },
        id: "testSave",
        important: true,
        isPrimary: true,
        disabled: true,
        onActivate: () => {
            alert("Example text");
        },
        text: "Save"
    },
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

export const rawTableItemsWorkType: ITableItemWorkType[] = [
    {
        type: 'Project Management',
    },
    {
        type: 'Development',
    },
    {
        type: 'Business Analysis',
    },
    {
        type: 'Quality Assurance',
    },
];
export const tableItems = new ArrayItemProvider<ITableItemWorkType>(rawTableItemsWorkType);


export interface ITableItemWorkType extends ISimpleTableCell {
    type: string;       
}
