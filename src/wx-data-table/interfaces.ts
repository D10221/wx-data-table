import {ViewModelBase} from "./viewModelBase";
export interface DataSource {
    key:string;
    items: any[] ;
    hook?(viewModel: ViewModelBase);
}

export enum Visibility {
    visible, hidden
}

export interface KeyValue {
    key:string;
    value:any;
}
