import { Injectable } from "@angular/core";
import { Store } from "@ngxs/store";
import { DataTypes, Load, Mutate } from "./data.state";

export const NameMapping: any = {
  'JobForCompany': 'jobs',
  'LabelForCompany': 'labels',
  'Role': 'role',
  'Job': 'job',
  'Label': 'label',
  'Userprofile': 'User',
  'Company': 'company',
  'Files': 'files',
  'File': 'file',
  'Post': 'posts',
  'userName': 'username',
  'Candidate': 'application',
  'DeailedPost': 'details',
  'Supervisions': 'supervisions',
  'Disponibility': 'availabilities'
};

@Injectable({
  providedIn: 'root'
})
export class DataReader {

  constructor(private store: Store) {
    
  }

  readStaticData(data: any) {
    const suffix = 'Values',
      keys = Object.keys(data),
      names = keys.map(key => key.slice(0, -suffix.length)) as DataTypes[];
    
    for ( let i = 0; i < names.length; i++ )
      this.store.dispatch(new Load(names[i], [], data[keys[i]]));
  }

  readInitialData(data: any) {
    const suffix = 'Values',
      keys = Object.keys(data).filter(key => key.endsWith('Values')),
      names = keys.map(key => key.slice(0, -suffix.length)) as DataTypes[];
    
    const loads = [];
    for ( let i = 0; i < names.length; i++ ) {
      const fields = data[names[i] + 'Fields'] as string[];
      loads.push(new Load(names[i], fields, data[keys[i]]));
    }

    this.store.dispatch(loads);
  }

  readManyUpdates(data: any) {
    for ( const name in data )
      this.store.dispatch(new Mutate(name as DataTypes, data[name]));
  }
};