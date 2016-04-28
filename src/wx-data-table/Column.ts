import {TableElement} from "./table_component";
import {Table} from "./tx-data-table";
export class Column extends TableElement {

    //defaultCellValue : any = null ;
    
    constructor(key:string) {
        super(key);
    }

    header : any ;
    
    /*Sort*/
    sortDirection = wx.property("asc");

    /***
     * If no parameter then toggle sortDirection 
     * @type {ICommand<any>}
     */
    setSortDirection = wx.command((parameter?) => {
        
        if(parameter == 'asc' || parameter == 'desc') {
            this.sortDirection(parameter);
            return;
        }
        
        if (this.sortDirection() == 'asc') {
            this.sortDirection('desc');
            return;
        }
        if(this.sortDirection() == 'desc'){
            this.sortDirection('asc');
            return;
        }
    });

    /*Filter*/
    filterText = wx.property("");
    
    isFilterVisible = wx.property(false);
    
    toggleFilterVisible = wx.command(()=>{
        this.isFilterVisible(!(this.isFilterVisible()));
        if(!this.isFilterVisible()){
            this.filterText("");
        }
    });
    
    /*Move*/
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