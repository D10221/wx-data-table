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


export interface TableElementLayout {
    key: string ;
    index: number,
    visibility: Visibility,
    enabled: boolean,
    selected: boolean,
    elements : TableElementLayout[]
}


export interface EventArgs {
    sender : any ; 
    args : KeyValue;
}

export interface Func<T,TR>{
    (t: T) :  TR;
}