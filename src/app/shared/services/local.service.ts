import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class LocalService {

  generalKeys: string[] = ['getUserData', 'getGeneralData']

  constructor() {}

  public saveData(key: string, value: string){
      localStorage.setItem(key, value)
  }

  public getData(key: string): string | null {
      return localStorage.getItem(key)
  }

  public getAllData() : string[] {
    let n = localStorage.length
    let localKeys: string[] = []
    for (let index = 0; index < localStorage.length; index++) {
      let key = localStorage.key(index)!
      if (!this.generalKeys.includes(key)){
        localKeys.push(key)
      }
    }
    return localKeys
  }

  public getAllTimestampValues(): string[]{
    let allTimestampValues: string[] = []
    this.getAllData().forEach((key: string) => {
      allTimestampValues.push(localStorage.getItem(key)!)
    })
    return allTimestampValues
  }

  public removeData(key: string){
    localStorage.removeItem(key)
  }

  public clearData() {
    localStorage.clear()
  }

  public createKey(timestamp: string, name: string) {
    return timestamp + '/' + name
  }
}

