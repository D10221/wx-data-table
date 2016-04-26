
import {DataSource} from "./interfaces";
import {Table, Column, Row, Cell} from "./tx-data-table";
import {ViewModelBase} from "./viewModelBase";
import {layouts } from "./Layouts";

import LoDashStatic = _.LoDashStatic;

var _ = require('lodash') as LoDashStatic;



export class TableCtrl extends ViewModelBase {

    table = wx.property<Table>(new Table('')) ;
    
    constructor(dataSource: DataSource) {
        super();
        
        if(!dataSource || !dataSource.key || !dataSource.items || dataSource.items.length <1 ) return ;

        if(dataSource.hook ){
            dataSource.hook(this);
        }

        var table  = new Table(dataSource.key);

        table.header = dataSource.key;
        
        var first = dataSource.items[0];
                 
        var columns : Column[] = [] ; 

        for(var key in first){

            var column = new Column(key);
            
            var x= layouts.getColumn(dataSource.key, column.key);
            if (x ) {
                column.setLayout(JSON.stringify(x));
            } else{
                column.index( columns.length );
            }
            
            column.header = `${key} ${column.index()}`;
            
            columns.push(column);
        }
        
        columns = _.sortBy(columns, c=> c.index());
        
        table.columns.addRange(columns);

        for(var item of dataSource.items){

            var row = new Row(`${dataSource.key}_row_${table.elements.length()}`);

            for(var column of columns){

                var cell = new Cell(column.key, item[column.key]);
                cell.index(column.index());
                cell.parent = row;
                cell.visibility(column.visibility());
                
                this.addTwoWaySubscribtion(column.visibility, cell.visibility);
                this.addTwoWaySubscribtion(column.index, cell.index);
                row.elements.push(cell);
            }

            table.elements.push(row);
        }

        table.columns.forEach(column=> {
                         
            this.addSubscription(column.index.changed.take(1),()=>{
                layouts.save(this.table());
                this.onNextEvent("table-layout-changed", true);
            })
            
            this.addSubscription(column.visibility.changed.take(1),()=>{
                layouts.save(this.table());
            })
        });
        
        this.table(table);
    }
    
} 

