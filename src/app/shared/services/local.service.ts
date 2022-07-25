import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class LocalService {

  generalKeys: string[] = ['getUserData', 'getGeneralData']

  constructor() {
    if (!localStorage.getItem('allTimestamps')){
      localStorage.setItem('allTimestamps', '')
    }
  }

  public saveData(key: string, value: string, isTimestamp?: boolean){
      localStorage.setItem(key, value)
      if (isTimestamp){
        this.addTimestamp(key)
      }
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
    let allTimestamps = localStorage.getItem("allTimestamps")
    return allTimestamps!.split('/').map<string>((value: string) => {
      return localStorage.getItem(value)!
    })
  }

  public removeData(key: string){
    localStorage.removeItem(key)
  }

  public clearData() {
    let email = this.getLastEmail()
    localStorage.clear()
    if(email)
      this.setLastEmail(email)
  }

  public createKey(actionOrActions: any, name: string) {
    return JSON.stringify(actionOrActions) + '/' + name
  }

  public addTimestamp(timestamp: string) {
    let allTimestamps = localStorage.getItem("allTimestamps")
    if (!allTimestamps){
      allTimestamps = ''
    }
    this.saveData('allTimestamps', allTimestamps + timestamp + '/')
  }

  public removeFirstTimestamp() {
    let allTimestamps = localStorage.getItem("allTimestamps")
    if (allTimestamps){
      let keepGoing = true
      while(keepGoing && allTimestamps != ''){
        if (allTimestamps[0] != '/') {
          allTimestamps = allTimestamps.substring(1)
        }
        else{
          keepGoing = false
        }
      }
    } 
  }

  public getLastEmail(){
    return localStorage.getItem('lastEmail')
  }

  public setLastEmail(lastEmail: string){
    localStorage.setItem('lastEmail', lastEmail)
  }

  public dumpLocalStorage(){
    
  }
}

