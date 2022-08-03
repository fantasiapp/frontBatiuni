import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { StripeAffirmMessageElement } from '@stripe/stripe-js';
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

  public saveData(key: string, value: string){
      localStorage.setItem(key, value)
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
    console.log("yooooooo", allTimestamps)
    return allTimestamps!.split('/')
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

  public createPendingRequest(timestamp: string, format: string, api: string, name: string, argument: any) {
    let key = timestamp
    let value = format + '/' + api + '/' + JSON.stringify(argument) +'/' + name
    localStorage.setItem(key, value)
    this.addTimestamp(timestamp) 
  }

  public addTimestamp(timestamp: string) {
    console.log("add", timestamp)
    let allTimestamps = localStorage.getItem("allTimestamps")
    if (!allTimestamps){
      allTimestamps = ''
    }
    this.saveData('allTimestamps', allTimestamps + timestamp + '/')
    console.log(this.getData('allTimestamps'))
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
    console.log(data)
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
    response[id!] = arrayResponse;
    return response
  }

  generateId(type: DataTypes){
    let idMax = parseInt(localStorage.getItem(type)!)
    if (!idMax){
      idMax = this.getIdMax(type)
    }
    localStorage.setItem(type, String(idMax!+1))
    return idMax!+1
  }

  getIdMax(type: DataTypes){
    let idMax = 0
    this.store.selectSnapshot(DataQueries.getAll(type)).map((value) => {
      if (value.id > idMax){
        idMax = value.id
      }
    })
    return idMax
  }
}

