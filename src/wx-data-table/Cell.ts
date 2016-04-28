import {TableElement, InputTypes} from "./table_component";

export class Cell extends TableElement {

    value = wx.property();
    

    constructor(key: string, value: any) {
        super(key);

        this.undoCmd = wx.command(()=> this.value(value));

        this.value(value);

        this.addChangeSubscription(this.value, ()=> this.isDirty(this.value()!= value));
        
        this.addSubscription(this.isEditing.changed, this.onEditing);

    }

    isDirty = wx.property(false);

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
