import {TableElement} from "./table_component";
import {Table} from "./tx-data-table";
export class Column extends TableElement {

    constructor(key:string) {
        super(key);
    }

    header : any ;

    filterText = wx.property("");
    isFilterVisible = wx.property(false);
    
    
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

            this.onNextEvent('column-index-changed', prev) ;
        }
    });

    get table() : Table {
        return (this.parent as Table);
    }

}