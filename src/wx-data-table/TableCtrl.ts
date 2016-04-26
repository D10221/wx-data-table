
import {DataSource} from "./interfaces";

import {Table, Column, Row, Cell} from "./tx-data-table";

import {ViewModelBase} from "./viewModelBase";
import LoDashStatic = _.LoDashStatic;
import {TableElementLayout} from "./table_component";

var _ = require('lodash') as LoDashStatic;

class Layouts {

    restore(table:Table) {
        var x = localStorage.getItem(`table_${table.key}`);
        if(x){
            return table.fromJson(x);
        }
    }
    save(table:Table){
        localStorage.setItem(`table_${table.key}`, table.toJson());
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

var layouts = new Layouts();

export class TableCtrl extends ViewModelBase {

    table = wx.property<Table>(new Table('')) ;
    
    constructor(dataSource: DataSource) {
        super();
        
        if(!dataSource || !dataSource.key || !dataSource.items || dataSource.items.length <1 ) return ;

        if(dataSource.hook ){
            dataSource.hook(this);
        }

        this.current.dispose();
        this.current = new Rx.CompositeDisposable();

        var table  = new Table(dataSource.key);

        table.header = dataSource.key;

        
        var first = dataSource.items[0];
        
        var layout = layouts.getTable(dataSource.key);
        
        var columns : Column[] = [] ; 
        for(var key in first){

            var column = new Column(key);
            column.header = key;
            var x= layouts.getColumn(dataSource.key, column.key);
            column.index( x && x.index ? x.index : columns.length );             
            columns.push(column);
        }
        
        columns = _.sortBy(columns, c=> c.index());
        
        table.columns.addRange(columns);

        for(var item of dataSource.items){

            var row = new Row(`${dataSource.key}_row_${table.elements.length()}`);

            for(var column of table.columns.toArray()){

                var cell = new Cell(column.key, item[column.key]);
                cell.index(column.index());
                cell.parent = row;

                this.addTwoWaySubscribtion(column.visibility, cell.visibility);
                
                this.addTwoWaySubscribtion(column.index, cell.index);

                this.addSubscription(column.index.changed.take(1),()=>{

                    layouts.save(this.table());

                    this.onNextEvent("table-layout-changed", true);
                });
                
                row.elements.push(cell);
            }

            table.elements.push(row);
        }
        this.table(table);
    }
    
    
    current = new Rx.CompositeDisposable();
} 

