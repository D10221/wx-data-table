import {ViewModelBase} from "../../src/wx-data-table/viewModelBase";

import {Visibility} from "../../src/wx-data-table/interfaces";

export class ComponentCommand {

    key:string;
    visibility = wx.property(Visibility.visible);
    enabled = wx.property(true);
    command:wx.ICommand<any>;

    constructor(target:TableElement, key:string, action:(target:TableElement, x:any)=> void) {
        this.key = key;
        this.command = wx.command(params=> {
            action(target, params);
        })
    }
}

export class TableElement extends ViewModelBase implements Rx.IDisposable {

    parent:TableElement;

    elements = wx.list<TableElement>();

    commands = wx.list<ComponentCommand>();

    isSelected = wx.property(false);

    visibility = wx.property(Visibility.visible);

    enabled = wx.property(true);

    index = wx.property(0);

    constructor(public key:string) {
        super();
    }

    moveCmd = wx.command((p)=> {
        if (p == "+") {
            this.index(this.index() + 1);
        }
        if (p == '-') {
            this.index(this.index() - 1);
        }
    }, this.canMove);

    canMove:(x:any)=> boolean = x => {
        return x == '-' ? this.index() > 0 : this.index() < 100
    };

    getCommand(key:string) {
        return _.find(this.commands.toArray(), c=>c.key == key);
    }

    toggleCmd:wx.ICommand<any> = wx.command((parameter)=> {
        if (parameter == 'visibility') {
            this.visibility(this.visibility() == Visibility.visible ? Visibility.hidden : Visibility.visible)
        }
        if (parameter == "isSelected") {
            this.isSelected(!this.isSelected())
        }
        if (parameter.key) {
            var cmd = _.find(this.commands.toArray(), x => x.key == parameter.key);
            if (cmd) {
                cmd.command.execute(parameter.parameter);
            }
        }
    });

    public toJson():string {
        return JSON.stringify({
            key: this.key,
            index: this.index(),
            visibility: this.visibility(),
            enabled: this.enabled(),
            selected: this.isSelected(),
            elements : this.elements.map(x=> x.toJson())
        });
    }

    public fromJson(json:string) {
        var x = JSON.parse(json);
        this.key = x.key;
        this.index(x.index);
        this.visibility(x.visibility);
        this.enabled(x.enabled);
        this.isSelected(x.selected);
        for(var element of this.elements.toArray()){
            element.fromJson(x.elements);
        }
    }
}

export interface TableElementLayout {
    key: string ; 
    index: number,
    visibility: Visibility,
    enabled: boolean,
    selected: boolean,
    elements : TableElementLayout[]
}


