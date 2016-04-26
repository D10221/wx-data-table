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

    public getLayout():string {
        return JSON.stringify({
            key: this.key,
            index: this.index(),
            visibility: this.visibility(),
            enabled: this.enabled(),
            selected: this.isSelected(),
            elements : this.elements.map(x=> x.getLayout())
        });
    }

    public setLayout(json:string) {
        var layout = JSON.parse(json);
        this.key = layout.key;
        this.index(layout.index);
        this.visibility(layout.visibility);
        this.enabled(layout.enabled);
        this.isSelected(layout.selected);
        for(var element of this.elements.toArray()){
            element.setLayout(layout.elements);
        }
    }
}



