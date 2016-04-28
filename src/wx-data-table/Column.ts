import {TableElement} from "./TableElement";
import {Table} from "./Table";
export class Column extends TableElement {
     
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
    
    getter: (item: {}) => any = item=>{
        
        if(item.hasOwnProperty(this.key)){
            return item[this.key];
            
        }
        return null;
    };

    disabledFeatures: string[] = [];

    isDisabledFeature( featureKey:string) : boolean {
        return  _.some(this.disabledFeatures, feature => feature && (feature as string).toLowerCase() == featureKey.toLowerCase());
    }
    
    isEnabled(featureKey: string){
        return !this.isDisabledFeature(featureKey);
    }
    

}