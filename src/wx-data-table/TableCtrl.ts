
import {DataSource, EventArgs} from "./interfaces";
import {Table} from "./tx-data-table";
import {ViewModelBase} from "./viewModelBase";
import {layouts } from "./Layouts";
import {Column} from "./Column";

import LoDashStatic = _.LoDashStatic;
import {Row} from "./Row";
import {Cell} from "./Cell";


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
        
        var columns : Column[] = _
            .chain(this.getKeys(dataSource))
            .map(key=> this.ToColumn(table, key))
            .sortBy(c=> c.index())
            .value();
        
        var column = new Column('isSelected');
        column.index(0) ;
        column.header = false;
        column.getter = item => false;
        columns.push(column);
        
        table.columns.addRange(columns);
        
        var rows = dataSource.items.map(item=> this.toRow(table, item ));
                 
        table.elements.addRange(rows);
        
        table.columns.forEach(column=> {
                         
            this.addSubscription(
                column.when('column-index-changed')
                    .where(x=> !this.saving)
                    .take(1),
                x=> this.onColumnIndexChanged(x));
            
            this.addSubscription(column.filterText.changed.select(x=> column), this.onColumnTextFilterChanged);
            
            this.addSubscription(column.sortDirection.changed.select(x=> column), this.onColumnSortDirectionChanged);

            this.addSubscription(column.visibility.changed.take(1),()=>{

                /*if(column.visibility()!= Visibility.visible){
                    column.filterText("")
                }*/

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
    
    // item[column.key]

    
    toCell(row: Row, column: Column, item: {} ) : Cell {
        
        var cellValue = column.getter(item);
                 
        var cell = new Cell(column.key, cellValue );
       
        cell.index(column.index());
        
        cell.parent = row;
        
        cell.visibility(column.visibility());

        this.addTwoWaySubscribtion(column.visibility, cell.visibility);

        this.addTwoWaySubscribtion(column.index, cell.index);

        this.addSubscription(cell.isSelected.changed.select(x=> cell), this.onCellSelected);

        this.addSubscription(cell.isEditing.changed.select(x=> cell), this.onCellisEditingChanged);

        this.disposables.add(cell);

        return cell ;
    }
         
    toRow( table:Table , item:{} ) : Row {
        
        var row = new Row(`${table.key}_row_${table.elements.length()}`);
         
        var cells = table.columns.map(column=> this.toCell(row, column , item ));

        row.elements.addRange(cells);
        row.parent = table;
        return row;
    }

    ToColumn(table:Table, key: string) : Column {
        
        var column = new Column(key);

        var layout = layouts.getColumn(table.key, column.key);
        if (layout) {
            column.setLayout(layout);
        } else{
            column.index( table.columnsLength++ );
        }

        column.parent = table;
        
        return column;
    }
    
    getKeys(dataSource:DataSource): string[] {

        var first = dataSource && dataSource.items ? dataSource.items[0] : {} ;
        // columns.push( new Column('isSelected'));
        var keys= [];
        for(var key in first){
            keys.push(key)
        }

        return keys;
    }

    onCellSelected(cell:Cell){
        var row = (cell.parent as Row);
        row.isSelected(_.some(row.elements.toArray() as Cell[], x=> x.isSelected()));
    }

    onCellisEditingChanged(cell: Cell){
        var row = (cell.parent as Row);
        ((row.parent as Table).elements.toArray() as Row[])
            .forEach(row=> 
                _.filter((row.elements.toArray() as Cell[]), c=>c.id!= cell.id).forEach(c=>c.isEditing(false))
            )
    }
    
} 

