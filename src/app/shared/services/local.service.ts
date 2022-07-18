import { EventEmitter, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

@Injectable({
  providedIn: 'root'
})


export class LocalService {

  constructor(private store: Store) {}

  public saveData(key: string, value: string){
      localStorage.setItem(key, value)
  }

  public getData(key: string): string | null {
      return localStorage.getItem(key)
  }

  public removeData(key: string){
    localStorage.removeItem(key)
  }

  public clearData() {
    localStorage.clear()
  }
}

