/***
 * if quacks!
 * @param x
 * @returns {boolean}
 */

export function isEventArgs(x:any) : boolean {
    return x && x.hasOwnProperty('sender') && x.hasOwnProperty('args');
}
