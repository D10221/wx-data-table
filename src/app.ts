///<reference path="reference.d.ts"/>

import {DataSource, Visibility} from "./wx-data-table/interfaces";
import {TableCtrl} from "./wx-data-table/TableCtrl";
import {ViewModelBase} from "./wx-data-table/viewModelBase";
import {CheckBoxViewModel, ChekBoxContext} from "./wx-data-table/CheckBox";


declare var componentHandler : any ;

wx.app.devModeEnable();

class App extends ViewModelBase {

    dataSource = wx.property<DataSource>() ;
    
    tableCtrl :ViewModelBase ;
    
    hook = vm=> {
        
        this.tableCtrl = vm;
        
        vm.when('postBindingInit').take(1).subscribe(()=>{

                componentHandler.upgradeAllRegistered()
        });
        
        vm.when('table-layout-changed').take(1).subscribe(()=>{
            var dataSource = this.dataSource();
            this.dataSource({
                key: dataSource.key,    
                items: dataSource.items,
                hook: this.hook
            });
        });
    };

    constructor(){
        super();
        
        
        
        fetch('../data/materials.json')
            .then(r=>r.json())
            .then( data =>  this.dataSource({
                key: "materials",
                items: data,
                hook: this.hook
            }));
    }

    data: any[] = [] ;
}

var templates = (<iHTMLTemplateElement>document.getElementById('data-table-templates')).import;

wx.app.component("data-table", {
    template: templates.getElementById('data-table-template').innerHTML,
    viewModel: (params:DataSource)=> new TableCtrl(params),
    preBindingInit : 'preBindingInit' ,
    postBindingInit : 'postBindingInit'
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

wx.app.filter('visibility_icon', (value:Visibility)=>  { return value == Visibility.visible ? 'visibility' : 'visibility_off' } );
wx.app.filter("isVisible", (value: Visibility) =>  value == Visibility.visible);
wx.app.filter("isHidden", (value: Visibility) =>  value == Visibility.hidden);
wx.app.filter('toggleCheck', (input:boolean) => input == true ? 'check' : 'crop_square' ) ;
wx.app.filter("invert", value=> !value);
wx.app.filter("not", value=> !value);

wx.applyBindings( new App()  , document.getElementById("main-view"));

 