
import {ViewModelBase} from "./viewModelBase";

export interface ChekBoxContext {
    value: wx.IObservableProperty<boolean> ;
}

export class CheckBoxViewModel extends ViewModelBase{

    value= wx.property(false);

    command =  wx.command( () => {
        this.value(!this.value());
    });

    constructor(private context: ChekBoxContext) {
        super();
        this.addTwoWaySubscribtion(this.value , context.value);
    }

}
