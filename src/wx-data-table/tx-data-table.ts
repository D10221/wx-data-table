///<reference path="../reference.d.ts"/>

import {TableElement,} from "./table_component";

import {Column} from "./Column";

export class Table extends TableElement {

    header:any;
    
    columns = wx.list<Column>();
    
    constructor(key:string) {
        super(key);
    }

    columnsLength: number = 0 ;

}
