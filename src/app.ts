///<reference path="reference.d.ts"/>

import {DataSource, Visibility, PageRequest, PageRequestType} from "./wx-data-table/interfaces";
import {TableCtrl} from "./wx-data-table/TableCtrl";
import {ViewModelBase} from "./wx-data-table/viewModelBase";
import {CheckBoxViewModel, ChekBoxContext} from "./wx-data-table/CheckBox";
import {Row} from "./wx-data-table/Row";

/***
 * Material design lite
 */
declare var componentHandler:{ upgradeAllRegistered:() => void };

wx.app.devModeEnable();

class App extends ViewModelBase {

    constructor() {
        super();
        
        this.loadData = this.loadData.bind(this);
        
        this.loadData();
    }

    dataSource = wx.property<DataSource>();

    tableCtrl:ViewModelBase;

    hook = vm=> {

        this.tableCtrl = vm;         
        
        this.hookSubscriptions = this.reneSubscriptions(this.hookSubscriptions,
           [
               vm.when('postBindingInit').take(1)
                   .subscribe(()=> {
                       componentHandler.upgradeAllRegistered()
                   }),
               vm.when('table-layout-changed').take(1)
                   .subscribe(()=> {
                       var dataSource = this.dataSource();
                       this.dataSource({
                           key: dataSource.key,
                           items: dataSource.items,
                           hook: this.hook
                       });
                   }),
               vm.when('selected-row')
                   .subscribe(event=> {
                       var key = event.args.value ? (event.args.value as Row).key : 'none';
                       console.log(`Row Selected: ${key}`);
                   }),
               //--
               vm.when('selected-rows')
                   .subscribe(event=> {
                       var keys = _.chain(event.args.value as Row[])
                           .map(x=> x.key)
                           .join(',')
                           .value();
                       console.log(`Many Row Selected: ${keys}`);
                   }),
               // --
               // pages Simply forwards the request back as events
               // Do the service call , or whatever , and send back the chuck of pages 
               vm.pages
                   .onPageQuest(PageRequestType.next)
                   .subscribe( (x: PageRequest) => {
                       this.currentPage++;
                       console.log(`from ${x.current} to next page ... ${this.currentPage}`);
                       this.loadData();
               }),
               //--
               vm.pages
                   .onPageQuest(PageRequestType.prev)
                   .subscribe( (x: PageRequest) => {
                       this.currentPage--;
                       console.log(`from ${x.current} to prev page ... ${this.currentPage}`);
                       this.loadData();
               }),
               //--
               vm.pages
                   .onPageQuest(PageRequestType.page)
                   .subscribe( (x:PageRequest )=> {
                       this.currentPage = x.next;    
                       console.log(`from ${x.current} goto page ${this.currentPage }...`);
                       this.loadData();
               }),
           ]
        );
    };

    hookSubscriptions = new Rx.CompositeDisposable();

    loadData(data?:any[]) {
        
        if (!data) {
            fetch('../data/materials.json')
                .then(r=>r.json())
                .then(this.loadData);
            return;
        }

        this.dataSource({
            key: "materials",
            items: data,
            hook: this.hook,
            pages: {
                count: 4,
                current: this.currentPage
            },
        });
    }
    currentPage =  0;

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

 