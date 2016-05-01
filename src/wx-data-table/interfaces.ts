


import {Column} from "./Column";
export interface DataSource {
    key:string;
    items: any[] ;
    observer? : Rx.Observer<EventArgs>;
    columns?: ColumnDefinition[];
    pages?: PageData
}

export interface ColumnDefinition {
    key: string;
    index?:number;
    header?:any;
    getter?:(item:{}) => any;
    disabledFeatures?:string[];
    configureCell?:(cell) => void;
    commandAction?:(col:Column ,  parameter: any) => void;
    //inputType?: string;
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