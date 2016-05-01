export class Builder<T> {

    constructor(public value:T) {
        
    }

    with: (func: (t:T)=> void )=>  Builder<T> = (func) => {
        func(this.value);
        return this;
    };
    
    transform<R>(func: (t:T) => R): Builder<R> {
        return new Builder<R>(func(this.value));
    }
}