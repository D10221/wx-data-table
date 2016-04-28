///<reference path="../reference.d.ts"/>

import {TableElement,} from "./table_component";

import {Column} from "./Column";

export class Table extends TableElement {

    header:any;
    
    columns = wx.list<Column>();
    
    constructor(key:string) {
        super(key);
    }

}


export class Cell extends TableElement {
    
    value = wx.property();

    constructor(key: string, value: any) {
        super(key);
        
        this.undoCmd = wx.command(()=> this.value(value));

        this.value(value);

        this.addChangeSubscription(this.value, ()=> this.isDirty(this.value()!= value));
    }

    isDirty = wx.property(false);

    undoCmd: wx.ICommand<any>;
}
