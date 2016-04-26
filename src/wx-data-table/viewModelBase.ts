
import {Guid} from "./guid";
import {KeyValue} from "./interfaces";
export class ViewModelBase {

    constructor(){
        this.onNextEvent = (key, value) =>  {
            this.events({key: key, value:value});
        };
    }
    id = Guid.newGuid();

    /***
     * if action provided returns  Idisposable, if No Action provided returns Observable<KeyValue>
     * @param params
     * @returns {any}
     */
    when(key:string):Rx.Observable<KeyValue> ;
    when(key:string, action?:(kv:KeyValue)=> void):Rx.IDisposable ;
    when(key:string, action?:(kv:KeyValue)=> void):any {
        if (!action) {
            return this.events.changed.where(e=> e.key == key);
        }
        return this.events.changed.where(e=> e.key == key).subscribe(action);

    }

    addTwoWaySubscribtion<T>(left:wx.IObservableProperty<T>, right:wx.IObservableProperty<T>, x?:ViewModelBase):void;
    addTwoWaySubscribtion<T>(left:wx.IObservableProperty<T>, right:wx.IObservableProperty<T>, x?:Rx.CompositeDisposable):void;
    addTwoWaySubscribtion<T>(left:wx.IObservableProperty<T>, right:wx.IObservableProperty<T>, x?:any):void {
        if (!x || x instanceof ViewModelBase) {
            (x || this).disposables.add(this.twoWaySubscription(left, right));
            return;
        }
        if (x instanceof Rx.CompositeDisposable) {
            x.add(this.twoWaySubscription(left, right));
        }
    }

    addChangeSubscription<T>(prop:wx.IObservableProperty<T>, action:((x:T)=>void), vm?:ViewModelBase):void {
        (vm || this).disposables.add(prop.changed.subscribe(action));
    }

    addSubscription<T>(observable:Rx.Observable<T>, action:(t:T)=> void, x?:ViewModelBase):void;
    addSubscription<T>(observable:Rx.Observable<T>, action:(t:T)=> void, x?:Rx.CompositeDisposable):void;
    addSubscription<T>(observable:Rx.Observable<T>, action:(t:T)=> void, x?:any):void {

        if (!x || x instanceof ViewModelBase) {
            (x || this).disposables.add(
                observable.subscribe(action)
            );
            return;
        }

        if (x instanceof Rx.CompositeDisposable) {
            x.add(observable.subscribe(action));
        }

    }

    twoWaySubscription<T>(left:wx.IObservableProperty<T>, right:wx.IObservableProperty<T>):Rx.IDisposable {

        var disposables = new Rx.CompositeDisposable();

        disposables.add(
            left.changed.where(value=> value != right()).subscribe(value=> right(value))
        );

        disposables.add(
            right.changed.where(value=> value != left()).subscribe(value=> left(value))
        );
        return disposables;
    }

    disposables = new Rx.CompositeDisposable();

    events = wx.property<KeyValue>();

    onNextEvent(key: string, value: any) {};

    dispose: ()=> void = () => {
        this.disposables.dispose();
    };


    view: HTMLElement;

    preBindingInit :any = (view: HTMLElement)=> {
        this.view = view;
        this.onNextEvent("preBindingInit", view);
    };

    postBindingInit : any = (view:HTMLElement)=>{
        this.view = view;
        this.onNextEvent("postBindingInit", view);
    };
}
