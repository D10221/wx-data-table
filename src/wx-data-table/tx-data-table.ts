///<reference path="../reference.d.ts"/>

import {TableElement,} from "./table_component";

import {Column} from "./Column";
import {Visibility} from "./interfaces";

export class Table extends TableElement {

    header:any;
    
    columns = wx.list<Column>();
    
    constructor(key:string) {
        super(key);
    }

}


export class Row extends TableElement {
    
    constructor(key:string) {
        super(key);
    }

    findCellByKey:(key:string)=> Cell = (key) => {
        return _.find(this.elements.toArray(), cell => cell.key == key) as Cell;
    };

    findCellValueByKey:(key:string)=> any = (key) => {
        var cell = _.find(this.elements.toArray(), cell => cell.key == key) as Cell;
        return cell ? cell.value() : null;
    };

    /***
     * 
     * @param column
     */
    setVisble(column:Column) {
        var txt = this.findCellValueByKey(column.key)
            .toString();
        var visible = new RegExp(column.filterText()).test(txt);
        this.visibility(visible? Visibility.visible : Visibility.hidden );
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
