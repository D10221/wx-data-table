import {TableElement, InputTypes} from "./TableElement";
import {Column} from "./Column";
import {Row} from "./Row";

export class Cell extends TableElement {

    value = wx.property();

    constructor(key: string, private _value: any) {
        super(key);

        this.undoCmd = wx.command(()=> this.value(_value));

        this.value(_value);

        this.addSubscription(this.value.changed.where(x=> this.column.isEnabled("isDirty")), this.dirtyCheck);
        
        this.addSubscription(this.isEditing.changed.where(x=> this.column.isEnabled("isEditing")), this.onEditing);
        
    }

    private _column ;
    
    get column(): Column {
        return this._column || (
                this._column = _.find(this.row.table.columns.toArray(),
                    c=>c.key == this.key)
            );
    }
    
    get row():Row {
        return (this.parent as Row)
    }

    isDirty = wx.property(false);

    dirtyCheck: ()=> void = () => {
        this.isDirty(this.value()!= this._value);
    };


    undoCmd: wx.ICommand<any>;

    isEditing = wx.property(false);

    setIsEditing = wx.command( (parameter)=> {
        if(_.isBoolean(parameter)){
            this.isEditing(parameter as boolean);
            return;
        }
        this.isEditing(!this.isEditing());
    });
    
    onEditing: (editing: boolean ) => void  = editing => {
        if(editing){
            this.isSelected(true);
        }
    };

    private inputType;
    
    getInputType():string {

        // Override ?
        if (InputTypes.any(this.inputType)) {
            return this.inputType;
        }

        var value = this.value();

        if ( _.isDate(value)) return "date";
        if (_.isNumber(value)) return "number";
        if (_.isBoolean(value)) return "checkbox";
        //if ( value == 'true' || value == 'false') return "checkbox";
        return "text";
    }

    isInputTypeOf(type:string):boolean {
        return this.getInputType() == type;
    }

}
