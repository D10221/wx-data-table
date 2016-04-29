///<reference path="../reference.d.ts"/>

import {TableElement,} from "./TableElement";

import {Column} from "./Column";

export class Table extends TableElement {

    header:any;
    
    columns = wx.list<Column>();
    
    constructor(key:string) {
        super(key);
    }

    columnsLength: number = 0 ;
    elementsLength: number = 0 ;

    toggleRowSelection= wx.command(()=>{
        this.elements.forEach(this.toggleSelection);
    });
    
    toggleSelection(e:TableElement){
        e.isSelected(!e.isSelected());
    }
}
