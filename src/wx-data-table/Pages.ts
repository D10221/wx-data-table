import {ViewModelBase} from "./viewModelBase";
import {DataSource, PageRequest, PageRequestType} from "./interfaces";

export class Pages extends ViewModelBase {

    constructor(private dataSource:DataSource) {
        //super!
        super();
    }

    get pageCount():number {
        return this.dataSource && this.dataSource.pages && this.dataSource.pages.count ? this.dataSource.pages.count : 0;
    }

    get pages():number[] {
        return _.range(this.pageCount);
    };

    get current():number {
        return this.dataSource && this.dataSource.pages && this.dataSource.pages.current ?
            this.dataSource.pages.current : 0;
    };

    nextPage = wx.command(()=> {
        var next = this.current + 1;
        if(!this.canGoNext(next)) { return ;}

        this.onNextEvent('PageRequest', <PageRequest>{
            current: this.current,
            next: next,
            type: PageRequestType.next
        });
    });

    prevPage = wx.command(()=> {
        var next = this.current - 1;
        if(!this.canGoNext(next)) { return ;}
        
        this.onNextEvent('PageRequest', <PageRequest>{
            current: this.current,
            next: next,
            type: PageRequestType.prev
        });
    });

    gotoPage = wx.command((n:number)=> {

        if(!this.canGoNext(n)) { return ;}

        this.onNextEvent('PageRequest', <PageRequest>{
            current: this.current,
            next: n,
            type: PageRequestType.page
        });
    });

    canGoNext(n:number) : boolean{
        return n <= this.pageCount && n >=  0
    }
    
    onPageQuest(ofType: PageRequestType) : Rx.Observable<PageRequest>{
        return this.when('PageRequest')
            .select(e=> e.args.value as PageRequest)
            .where(e=> e.type == ofType );
    }
}
