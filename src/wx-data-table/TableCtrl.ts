
import {DataSource, EventArgs} from "./interfaces";
import {Table,  Cell} from "./tx-data-table";
import {ViewModelBase} from "./viewModelBase";
import {layouts } from "./Layouts";
import {Column} from "./Column";

import LoDashStatic = _.LoDashStatic;
import {Row} from "./Row";


var _ = require('lodash') as LoDashStatic;

export class TableCtrl extends ViewModelBase {

    table = wx.property<Table>(new Table('')) ;
    
    constructor(dataSource: DataSource) {
        super();

        this.onColumnIndexChanged = this.onColumnIndexChanged.bind(this) ;
        
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
            
            var layout = layouts.getColumn(dataSource.key, column.key);
            if (layout) {
                column.setLayout(layout);
            } else{
                column.index( columns.length );
            }

            column.parent = table;
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
                         
            this.addSubscription(
                column.when('column-index-changed')
                    .where(x=> !this.saving)
                    .take(1),
                x=> this.onColumnIndexChanged(x));
            
            this.addSubscription(column.filterText.changed.select(x=> column), this.onColumnTextFilterChanged);
            
            this.addSubscription(column.sortDirection.changed.select(x=> column), this.onColumnSortDirectionChanged);

            this.addSubscription(column.visibility.changed.take(1),()=>{
                layouts.save(this.table());
            })
        });
        
        this.table(table);
    }

    onColumnSortDirectionChanged(column: Column){
        var table = column.table;
                
        var find = function (row:Row):any {
            return row.findCellValueByKey(column.key);
        };

        var r = _.sortBy(table.elements.toArray(), find);
        r = column.sortDirection() == "desc" ? _.reverse(r) : r ;
        table.elements.clear();

        table.elements.addRange(r);
    }
    
    onColumnTextFilterChanged(column:Column){
        var table = column.table;
        for (var row of table.elements.toArray() as Row[]) {
            row.setVisble(column);
        }
    }
    
    
    saving = false;
        
    onColumnIndexChanged( event: EventArgs) :void {

        this.saving = true;

        var column  = event.sender as Column ;

        var prev = event.args.value;
        
        var table = column.parent as Table;

        this.propagateColumnIndexChange(table, column, prev );

        layouts.save(table);

        this.onNextEvent("table-layout-changed", true);
    }

    propagateColumnIndexChange(table: Table, current: Column , prev:number) {
        
        var found = _.find(table.columns.toArray(),
            c=> c.index() == current.index() && c.key != current.key);
        found.index(prev);
        return;
    }
    
} 

