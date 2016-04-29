import {ViewModelBase} from "./viewModelBase";
import {TableCtrl} from "./TableCtrl";

export interface DataSource {
    key:string;
    items: any[] ;
    onLoaded? : Rx.Observer<TableCtrl>;
    pages?: PageData
}

export interface PageData {
    count: number ;
    current: number ;
}
export enum PageRequestType {
    next,
    prev,
    page
}

export interface PageRequest {
     current: number ;
     next: number;
     type: PageRequestType
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