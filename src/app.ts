///<reference path="reference.d.ts"/>

import {DataSource, Visibility, PageRequest, PageRequestType, EventArgs} from "./wx-data-table/interfaces";
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

    Onloaded = (controller: TableCtrl )=> {

        this.tableCtrl = controller;         
        
        this.hookSubscriptions = this.reneSubscriptions(this.hookSubscriptions,
           [
               controller.when('postBindingInit').take(1)
                   .subscribe(()=> {
                       componentHandler.upgradeAllRegistered()
                   }),
               //--
               controller.when('table-layout-changed').take(1).subscribe(this.loadData),
               //--
               controller.when('selected-row')
                   .subscribe(event=> {
                       var key = event.args.value ? (event.args.value as Row).key : 'none';
                       console.log(`Row Selected: ${key}`);
                   }),
               //--
               controller.when('selected-rows')
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
               controller.pages
                   .onPageQuest(PageRequestType.next)
                   .subscribe( (x: PageRequest) => {
                       this.currentPage++;
                       console.log(`from ${x.current} to next page ... ${this.currentPage}`);
                       this.loadData();
               }),
               //--
               controller.pages
                   .onPageQuest(PageRequestType.prev)
                   .subscribe( (x: PageRequest) => {
                       this.currentPage--;
                       console.log(`from ${x.current} to prev page ... ${this.currentPage}`);
                       this.loadData();
               }),
               //--
               controller.pages
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

    loadData(e?:EventArgs);
    loadData(data?:any[]) ;
    loadData(x?:any){
        if(_.isArray(x)){
            this.dataSource({
                key: "materials",
                items: x /*As data[]*/,
                onLoaded: this.asObserver,
                pages: {
                    count: 4,
                    current: this.currentPage
                },
            });
            return;
        }
        if (!x || this.isEventArgs(x))  {
            fetch('../data/materials.json')
                .then(r=>r.json())
                .then(this.loadData);
            return;
        }
    }

    /***
     * if quacks!
     * @param x
     * @returns {boolean}
     */
    private isEventArgs(x:any) {
        return (x as EventArgs).sender && (x as EventArgs).args;
    }
    
    onError(e){
        console.log(`TableCtrl: Error: ${e}`);
    }
    
    get asObserver() :Rx.Observer<TableCtrl> {
        return Rx.Observer.create<TableCtrl>(this.Onloaded, this.onError)
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

 