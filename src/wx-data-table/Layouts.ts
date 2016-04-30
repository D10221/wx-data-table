import {Table} from "./Table";
import {TableElementLayout} from "./interfaces";
import {TableElement} from "./TableElement";

class Layouts {

    restore(table:TableElement) {
        var x = localStorage.getItem(`table_${table.key}`);
        if(x){
            return table.setLayout(x);
        }
    }

    save(table:TableElement){
        var layout = table.getLayout();
        localStorage.setItem(`table_${table.key}`, JSON.stringify(layout));
    }

    drop(table: TableElement){
        localStorage.removeItem(`table_${table.key}`);
    }

    getTable(key:string) : TableElementLayout  {
        return this.fromJson(localStorage.getItem(`table_${key}`));
    }

    fromJson(json:string) : TableElementLayout {
        
        var element = JSON.parse(json);
        // if(!element || !element.elements) return element ;
        // element.elements = element.elements.map(e=> this.fromJson(e));
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