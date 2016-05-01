///<reference path="reference.d.ts"/>

import {DataSource, Visibility, PageRequest, PageRequestType, EventArgs, KeyValue} from "./wx-data-table/interfaces";
import {TableCtrl} from "./wx-data-table/TableCtrl";
import {ViewModelBase} from "./wx-data-table/viewModelBase";
import {CheckBoxViewModel, ChekBoxContext} from "./wx-data-table/CheckBox";
import {Row} from "./wx-data-table/Row";
import {isEventArgs} from "./wx-data-table/Util";
import {InputTypes, InputType} from "./wx-data-table/TableElement";

/***
 * Material design lite
 */
declare var componentHandler:{ upgradeAllRegistered:() => void };

wx.app.devModeEnable();

interface Material {
    created:string ;
}

class App extends ViewModelBase {

    get controllerEvents():Rx.Observable<EventArgs> {
        return this.listener.asObservable();
    }

    listener = new Rx.Subject<EventArgs>();

    constructor() {
        super();

        this.loadData = (x) => {

            if (_.isArray(x)) {
                this.dataSource({
                    key: "materials",
                    items: x /*As data[]*/,
                    observer: this.listener,
                    columns: [
                        {key: 'quantity', header: 'Quantity'},
                        {
                            key: 'created',
                            //Maybe: HTML?
                            header: 'Created',
                            //Maybe: Expression<Cell>
                            configureCell: (cell)=> cell.inputType = InputTypes.getString(InputType.date)
                        }
                    ],
                    pages: {
                        count: 4,
                        current: this.currentPage
                    },
                });
                return;
            }
            if (!x || isEventArgs(x)) {
                fetch('../data/materials.json')
                    .then(r=>r.json())
                    .then(x=>
                        this.loadData(x)
                    );
                return;
            }
        };

        // OPTIONAL:
        this.controllerEvents
            .where(e=>e.args.key == 'loaded')
            .select(e=> e.sender as TableCtrl)
            .subscribe(controller =>
                this.tableCtrl = controller
            );

        // OPTIONAL:
        this.controllerEvents
            .where(e=> e.args.key == 'postBindingInit')
            //.take(1)
            .subscribe(()=> {
                componentHandler.upgradeAllRegistered()
            });

        // NOTE: this is required ,
        // current UI implementations requiress
        // to rebuild the table , this should be done by the
        // table controller , instead of here 
        this.controllerEvents
            .where(e=> e.args.key == 'layout-changed')
            //.select(e=>e.value as EventArgs)
            //.take(1)
            .subscribe(this.loadData);

        // OPTIONAL: 
        this.controllerEvents
            .where(e=> e.args.key == 'selected-row')
            .select(event => event.args.value as Row)
            .subscribe(row => {
                var key = row ? row.key : 'none';
                console.log(`Row Selected: ${key}`);
            });

        // OPTIONAL:
        this.controllerEvents.where(e=> e.args.key == 'selected-rows')
            .select(event => event.args.value as Row[])
            .subscribe(rows=> {
                var keys = _.chain(rows)
                    .map(x=> x.key)
                    .join(',')
                    .value();
                console.log(`Many Row Selected: ${keys}`);
            });

        // OPTIONAL:
        this.controllerEvents.where(e=> e.args.key == "PageRequest")
            .select(e=>e.args.value as PageRequest)
            .where(request=> request.type == PageRequestType.next)
            .subscribe((x:PageRequest) => {
                this.currentPage++;
                console.log(`from ${x.current} to next page ... ${this.currentPage}`);
                this.loadData();
            });

        // OPTIONAL:
        this.controllerEvents.where(e=> e.args.key == "PageRequest")
            .select(e=>e.args.value as PageRequest)
            .where(request=> request.type == PageRequestType.prev)
            .subscribe((x:PageRequest) => {
                this.currentPage--;
                console.log(`from ${x.current} to prev page ... ${this.currentPage}`);
                this.loadData();
            });

        // OPTIONAL:
        this.controllerEvents
            .where(e=> e.args.key == "PageRequest")
            .select(e=>e.args.value as PageRequest)
            .where(request=> request.type == PageRequestType.page)
            .subscribe((x:PageRequest)=> {
                this.currentPage = x.next;
                console.log(`from ${x.current} goto page ${this.currentPage }...`);
                this.loadData();
            });

        this.loadData = this.loadData.bind(this);

        this.loadData();
    }

    dataSource = wx.property<DataSource>();

    tableCtrl:ViewModelBase;


    loadData(e?:EventArgs);
    loadData(data?:any[]) ;
    loadData(x?:any) {
    };

    currentPage = 0;

    data:any[] = [];
}

var templates = (<iHTMLTemplateElement>document.getElementById('data-table-templates')).import;

wx.app.component("data-table", {
    template: templates.getElementById('data-table-template').innerHTML,
    viewModel: (params:DataSource)=> new TableCtrl(params),
    preBindingInit: 'preBindingInit',
    postBindingInit: 'postBindingInit'
});


wx.app.component("column-actions", {
    template: templates.getElementById("column-actions").innerHTML,
    viewModel: (params)=> params
});

wx.app.component("table-actions", {
    template: templates.getElementById("table-actions").innerHTML,
    viewModel: (params)=> params
});

wx.app.component('table-columns-visibility', {
    template: templates.getElementById('table-columns-visibility').innerHTML
});

wx.app.component('column-header', {
    template: templates.getElementById('column-header').innerHTML
});

wx.app.component('table-cell', {
    template: templates.getElementById('table-cell').innerHTML
});

wx.app.component('checkbox-value', {
    template: templates.getElementById('checkbox-value').innerHTML,
    viewModel: (params:ChekBoxContext) => new CheckBoxViewModel(params)
});

wx.app.component('pages', {
    template: templates.getElementById('pages').innerHTML
});

wx.app.filter('visibility_icon', (value:Visibility)=> {
    return value == Visibility.visible ? 'visibility' : 'visibility_off'
});

wx.app.filter("isVisible", (value:Visibility) => value == Visibility.visible);
wx.app.filter("isHidden", (value:Visibility) => value == Visibility.hidden);
wx.app.filter('toggleCheck', (input:boolean) => input == true ? 'check' : 'crop_square');
wx.app.filter("invert", value=> !value);
wx.app.filter("not", value=> !value);

wx.applyBindings(new App(), document.getElementById("main-view"));

 