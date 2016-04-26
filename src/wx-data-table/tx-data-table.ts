///<reference path="../reference.d.ts"/>

import {TableElement} from "./table_component";

export class Table extends TableElement {

    header:any;
    
    columns = wx.list<Column>();
    
    constructor(key:string) {
        super(key);
    }

}

export class Column extends TableElement {
    
    header : any ;
    
    constructor(key:string) {
        super(key);
    }

}

export class Row extends TableElement {
    
    constructor(key:string) {
        super(key);
    }

   // cells:Cell[] = [];
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
