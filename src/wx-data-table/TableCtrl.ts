import {DataSource, EventArgs, KeyValue, ColumnDefinition} from "./interfaces";
import {Table} from "./Table";
import {ViewModelBase} from "./viewModelBase";
import {layouts} from "./Layouts";
import {Column} from "./Column";

import LoDashStatic = _.LoDashStatic;
import {Row} from "./Row";
import {Cell} from "./Cell";
import {Pages} from "./Pages";
import {TableElement} from "./TableElement";
import {Builder} from "./Builder";


var _ = require('lodash') as LoDashStatic;


var inBuiltColumns: Column[] = [
    new Builder(new Column('isSelected')).with(column=> {
        //column.parent = table;
        column.index(0);
        column.header = false;
        column.getter = item => false;
        column.disabledFeatures = ["isDirty"];
        column.configureCell = (cell)=> {
            column.addTwoWaySubscribtion(cell.value, cell.row.isSelected);
        };
        column.commandAction = (col:Column , parameter: any )=> {
            col.table.toggleRowSelection();
        };
        return column;
    }).value
];

export class TableCtrl extends ViewModelBase {

    table = wx.property<Table>(new Table(''));

    pages = new Pages(this.dataSource);

    publishTo(observer: Rx.Observer<EventArgs>, data: KeyValue){
        if(observer) {
            observer.onNext({sender: this, args: data } );
        }
    }
    
    constructor(private dataSource:DataSource) {
        super();

        this.disposables.add(this.pages);

        this.onColumnIndexChanged = this.onColumnIndexChanged.bind(this);

        if (!dataSource || !dataSource.key || !dataSource.items || dataSource.items.length < 1) return;

        if (dataSource.observer) {
            //If observer provided : redirect events 
            
            //this.observer = dataSource.observer;
            //NOTE: Overrides ViewModelBase's onNextEvent 
            this.onNextEvent = (key,value)=> {
                dataSource.observer.onNext({sender: this, args: { key: key, value: value }});
            };

            //NOTE: Overrides ViewModelBase's onNextEvent
            this.pages.onNextEvent = (key,value)=> {
                dataSource.observer.onNext({
                    sender: this.pages,
                    args:{
                        key: key,
                        value: value
                    }
                })
            }
        }

        var table = new Table(dataSource.key);
        
        this.addSubscription(table.events.changed.where(e=> e.args.key == 'drop-layout'), this.onDropLayout);
        
        table.header = dataSource.key;

        var columns = this.buildColumns(table, dataSource);
        
        table.columns.addRange(columns);

        var rows = dataSource.items.map(item=> this.toRow(table, item));

        table.elements.addRange(rows);

        table.columns.forEach(column=> {

            this.addSubscription(
                column.when('column-index-changed')
                    .where(x=> !this.saving)
                    .take(1),
                x=> this.onColumnIndexChanged(x));

            this.addSubscription(column.filterText.changed.select(x=> column), this.onColumnTextFilterChanged);

            this.addSubscription(column.sortDirection.changed.select(x=> column), this.onColumnSortDirectionChanged);

            this.addSubscription(column.visibility.changed.take(1), ()=> {
                layouts.save(this.table());
            })
        });

        this.table(table);
    }


    onColumnSortDirectionChanged(column:Column) {
        
        var table = column.table;

        var find = function (row:Row):any {
            return row.findCellValueByKey(column.key);
        };

        var r = _.sortBy(table.elements.toArray(), find);
        r = column.sortDirection() == "desc" ? _.reverse(r) : r;
        table.elements.clear();

        table.elements.addRange(r);
    }

    onColumnTextFilterChanged(column:Column) {
        var table = column.table;
        for (var row of table.elements.toArray() as Row[]) {
            row.setVisble(column);
        }
    }


    saving = false;

    onColumnIndexChanged(event:EventArgs):void {

        this.saving = true;

        var column = event.sender as Column;

        var prev = event.args.value;

        var table = column.parent as Table;

        this.propagateColumnIndexChange(table, column, prev);

        layouts.save(table);

        this.onNextEvent("layout-changed", true);
    }

    propagateColumnIndexChange(table:Table, current:Column, prev:number) {
        // this is tricky and possibly means is a bad idea 
        // Note: 1st: there is two way binding between column index and cell index 
        // Note: 2nd: current index CHANGED to desired index , did it ? 
        // find who has the desired index and set it's index to the previous index 
        // where previous index is previous index of the CHANGED column 
        // Column A index was 0 , we moved it to 1 , find previous coilumn with index 1 and set it to 0  
        var found = _.find(table.columns.toArray(),
            c=> c.index() == current.index() && c.key != current.key);
        found.index(prev);
        return;
    }

    buildColumns: (table:Table, dataSource: DataSource) => Column[] = (table,dataSource)=> {
        
        var columns:Column[] = [];

        for(var column of inBuiltColumns){
            column.parent = table;
            columns.push(column);
        }

        for(var key of this.getKeys(dataSource)){
            
            if(dataSource.columns){

                var found = _.find(dataSource.columns, c=>c.key == key );
                if (found) {

                    var column = this.fromColumnDefinition(found);
                    if(!column.index()){
                        column.index(columns.length + 1);
                    }
                    column.parent = table;
                    columns.push(column);

                    continue;
                }
            }
            // NotFound
            {
                var column = new Column(key);
                column.parent = table;
                column.index(columns.length+1);
                columns.push(column);
            }
            
        }
        
        return _.chain(columns)
            .map(column=> this.setLayout(column))
            .sortBy(c=>c.index())
            .value();
    };
    
    fromColumnDefinition(found: ColumnDefinition) : Column {
        
        var column = new Column(found.key);
        
        if(found.index){
            column.index( found.index);
        }

        if(found.header){
            column.header = found.header;
        }

        if(found.getter){
            column.getter = found.getter
        }

        column.disabledFeatures = found.disabledFeatures || [];

        if(found.configureCell){
            column.configureCell = found.configureCell;
        }

        if(found.commandAction){
            column.commandAction = found.commandAction;
        }

        // if(found.inputType){
        //     column.inputType = found.inputType;
        // }
        //
        
        return column;
    }


    toCell(row:Row, column:Column, item:{}):Cell {

        var cellValue = column.getter(item);

        var cell = new Cell(column.key, cellValue);

        cell.index(column.index());

        cell.parent = row;

        cell.visibility(column.visibility());

        if (column.configureCell) {
            column.configureCell(cell);
        }

        this.addTwoWaySubscribtion(column.visibility, cell.visibility);

        this.addTwoWaySubscribtion(column.index, cell.index);

        this.addSubscription(cell.isSelected.changed.select(x=> cell), this.onCellSelected);

        this.addSubscription(cell.isEditing.changed.select(x=> cell), this.onCellisEditingChanged);

        this.disposables.add(cell);

        return cell;
    }

    toRow(table:Table, item:{}):Row {

        var row = new Row(`${table.key}_row_${table.elementsLength++}`);

        var cells = table.columns.map(column=> this.toCell(row, column, item));

        row.elements.addRange(cells);
        row.parent = table;
        this.addSubscription(row.isSelected.changed.select(x=> row), this.onRowSelectionChanged);

        return row;
    }

    setLayout(column: Column):Column {
        
        var layout = layouts.getColumn(column.table.key, column.key);
        if (layout) {
            column.setLayout(layout);
        }        
        return column;
    }

    getKeys(dataSource:DataSource):string[] {

        var first = dataSource && dataSource.items ? dataSource.items[0] : {};

        var keys = [];
        for (var key in first) {
            keys.push(key)
        }

        return keys;
    }

    onCellSelected:(cell:Cell) =>void = (cell) => {
        var row = (cell.parent as Row);
        var isSelected = _.some(row.elements.toArray() as Cell[], x=> x.isSelected());
        row.isSelected(isSelected);
        this.onNextEvent('cell-selected', cell);
    };

    onCellisEditingChanged:(cell:Cell) => void = (cell) => {
        var row = (cell.parent as Row);
        ((row.parent as Table).elements.toArray() as Row[])
            .forEach(row=>
                _.filter((row.elements.toArray() as Cell[]), c=>c.id != cell.id).forEach(c=>c.isEditing(false))
            );

        this.onNextEvent('cell-editing', cell);
    }

    onRowSelectionChanged:(row:Row) => void = (row)=> {

        var selected = _.filter((row.table.elements.toArray() as Row[]), r => r.isSelected());
        //Multiple Selection  
        this.onNextEvent("selected-rows", selected);
        //Single Selection
        this.onNextEvent("selected-row", selected && selected.length > 0 ? row : null)
    };
    
    onDropLayout: (e: EventArgs) => void = (e)=> {
        layouts.drop(e.sender as TableElement);
        this.onNextEvent('layout-changed', true);
    }

}

