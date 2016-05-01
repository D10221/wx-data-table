import {ViewModelBase} from "../../src/wx-data-table/viewModelBase";

import {Visibility, TableElementLayout, Func} from "../../src/wx-data-table/interfaces";
import {layouts} from "./Layouts";

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

    index : wx.IObservableProperty<number> = wx.property(0);

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
            return;
        }
        if (parameter == "isSelected") {
            this.isSelected(!this.isSelected())
            return;
        }
        var prop = this[parameter] as wx.IObservableProperty<boolean>;
        if(prop) {
            prop(!prop());
            return;
        }
        if (parameter.key) {
            var cmd = _.find(this.commands.toArray(), x => x.key == parameter.key);
            if (cmd) {
                cmd.command.execute(parameter.parameter);
            }
        }
    });

    

    public getLayout():TableElementLayout {
        return {
            key: this.key,
            index: this.index(),
            visibility: this.visibility(),
            enabled: this.enabled(),
            selected: this.isSelected(),
            elements : this.elements.map(x=> x.getLayout())
        };
    }

    public setLayout(layout: TableElementLayout) {
        
        if(!layout) {
            return ;
        }
        
        this.key = layout.key;
        this.index(layout.index);
        this.visibility(layout.visibility);
        this.enabled(layout.enabled);
        this.isSelected(layout.selected);
        for(var element of this.elements.toArray()){
            element.setLayout(_.find(layout.elements, l=>l.key == element.key));
        }
    }
    
    dropLayout = wx.command(()=> { this.onNextEvent('drop-layout', this) ; });
}

export function setSilently<T extends TableElement,TR>(e:T , func:Func<T,wx.IObservableProperty<TR>>, value: TR) : void {
    try {
        (<any>func(e)).value = value;
    } catch (e) {
        console.log(`setSilently: error: ${e}`);
    }
};

export enum InputType {
    
    date, number, text, checkbox
}

export class InputTypes  {
    
    static getString(inputType: InputType) : string {
        return InputTypes.values[inputType]; 
    }
    
    static values: string [] = ['date', 'number', 'text', 'checkbox'];

    static any(inputType: string) : boolean  {
        return inputType && _.find(InputTypes.values, x=> x == inputType) ? true : false;
    }
}

