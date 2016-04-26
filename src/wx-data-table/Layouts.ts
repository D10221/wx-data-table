import {Table} from "./tx-data-table";
import {TableElementLayout} from "./interfaces";

class Layouts {

    restore(table:Table) {
        var x = localStorage.getItem(`table_${table.key}`);
        if(x){
            return table.setLayout(x);
        }
    }

    save(table:Table){
        localStorage.setItem(`table_${table.key}`, table.getLayout());
    }

    getTable(key:string) : TableElementLayout  {
        return this.fromJson(localStorage.getItem(`table_${key}`));
    }

    fromJson(json:string) : TableElementLayout{
        
        var element = JSON.parse(json);
        if(!element || !element.elements) return element ;
        element.elements = element.elements.map(e=> this.fromJson(e));
        return element
    }

    getColumn : (dataSourceKey:string,columnKey : string) => any = (dataSourceKey,columnKey) => {
        
        var table = this.getTable(dataSourceKey);
        if(!table || ! table.elements) return null;

        var found = _.find(table.elements, row =>  _.some(row.elements, cell=> cell.key == columnKey) != null );
        return found ?
            _.find(found.elements, x=>x.key == columnKey )
            : null ;
    }

}

export var layouts = new Layouts();