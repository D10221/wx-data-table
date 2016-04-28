///<reference path="../reference.d.ts"/>

import {TableElement,} from "./table_component";

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

    //@Override
    moveCmd = wx.command((p)=> {
        if (p == "+") {
            
            var next :number = this.index() + 1;
            
            //Last position Reserved 
            if( next >= this.table.columns.length()  ) {
                return ;
            }
             
            var prev = this.index();
            
            this.index(next);
            
            this.onNextEvent('column-index-changed', prev) ;
        }
        
        if (p == '-') {

            var next = this.index() - 1;
            
            //Zero position reserved 
            if(next < 1 ) return ;
            
            var prev = this.index();

            //Cells are listening to this change
            this.index(next);

            //TableCtrl is listening to this change to apply changes

            this.onNextEvent('column-index-changed', { column: this, prev: prev }) ;
        }
    });

    get table() : Table {
        return (this.parent as Table);
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
