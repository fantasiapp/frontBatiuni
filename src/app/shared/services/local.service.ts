import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { DataTypes } from 'src/models/new/data.interfaces';
import { DataQueries } from 'src/models/new/data.state';

@Injectable({
  providedIn: 'root'
})


export class LocalService {

  generalKeys: string[] = ['getUserData', 'getGeneralData']

  constructor(private store: Store) {
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

  public getAllLocalData() : string[] {
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
    // this.dumpLocalStorage()
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
    let localUserData = JSON.parse(localStorage.getItem('getUserData')!)
    let newLocalUserData: any = localUserData
    let DataTypeslist: DataTypes[] = this.getAllDataTypes(localUserData)
    newLocalUserData = this.updateLocalUserData(DataTypeslist, newLocalUserData)
    console.log("LA FIIIIIIIIIIIIIN", newLocalUserData)
    localStorage.setItem('getUserData', newLocalUserData)
  }

  public getAllDataTypes(localUserData: any){
    let list = Object.keys(localUserData).filter((value) => {
      if(value.includes('Values')){
        return value
      }
      return
    })
    let DataTypeslist = list.map((value) => {
        return value.substring(0,value.length-6) as DataTypes
    }) as DataTypes[]
    return DataTypeslist
  }

  public updateLocalUserData(DataTypesList: DataTypes[], newLocalUserData: any){
    DataTypesList.forEach((value) => {
      let getUserDataQuery: any = {}
      let localquery = this.store.selectSnapshot(DataQueries.getAll(value))
      localquery.forEach((element: any) => {
        let id = element["id"] 
        delete element["id"]
        getUserDataQuery[String(id)] = element
      })
      newLocalUserData[value + "Values"] = getUserDataQuery
    })
    return newLocalUserData
  }

  toResponse(type: DataTypes, data: any){
    let arrayResponse: any[] = []
    let response: any = {}
    let id: number
    const allKeys = Object.keys(data)
    console.log("allKeys", allKeys)
    allKeys.forEach((value) => {
      if(value != "id"){
        arrayResponse.push(data[value])
      }
      else{
        id = data[value]
      }
    })
    console.log("tout c'est bien passé", id!, response)
    response[id!] = arrayResponse;
    console.log("tout c'est bien passé après", id!, response)
    return response
  }
}

