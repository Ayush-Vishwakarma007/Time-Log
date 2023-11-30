import * as React from "react";
import { ISimpleListCell } from "azure-devops-ui/List";
import { ISimpleTableCell } from "azure-devops-ui/Table";
import { css } from "azure-devops-ui/Util";
import { Status, Statuses, StatusSize } from "azure-devops-ui/Status";

export interface ITableItem extends ISimpleTableCell {
    time: string;
    user: ISimpleListCell;
    date: string;
    type: string;
    comment: string;
    id: string;
}

export const renderStatus = (className?: string) => {
    return (
        <Status
            {...Statuses.Success}
            ariaLabel="Success"
            className={css(className, "bolt-table-status-icon")}
            size={StatusSize.s}
        />
    );
};

// export const rawTableItems: ITableItem[] = [
//     {
//         time: '2:00',
//         user: {text: "Dhiraj Joshi"},
//         date: '31/10/2023',
//         type: 'Project Management',
//         comment: 'This task is done'
//     },
//     {
//         time: '3:00',
//         user: {text: "Dhiraj Joshi"},
//         date: '01/11/2023',
//         type: 'Project Management',
//         comment: 'This task is done again'
//     },
//     {
//         time: '3:30',
//         user: {text: "Dhiraj Joshi"},
//         date: '02/11/2023',
//         type: 'Business Analysis',
//         comment: 'This task is done again again'
//     },
// ];

// export const tableItems = new ArrayItemProvider<ITableItem>(rawTableItems);

// export const tableItemsNoIcons = new ArrayItemProvider<ITableItem>(
//     rawTableItems.map((item: ITableItem) => {
//         const newItem = Object.assign({}, item);
//         newItem.name = { text: newItem.user.text };
//         return newItem;
//     })
// );