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
  'File': 'files',
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

  getFieldIndex(data: any, type: DataTypes, child: DataTypes) {
    return data[type + 'Fields'].indexOf(child);
  }

  getValueById(data: any, type: DataTypes, id: number) {
    return data[type + 'Values'][id];
  }

  getField(data: any, type: DataTypes, id: number, child: DataTypes) {
    const index = this.getFieldIndex(data, type, child);
    return this.getValueById(data, type, id)[index];
  }

  readCurrentUserId(data: any) {
    return data['currentUser'];
  }

  readCurrentUser(data: any) {
    const id = this.readCurrentUserId(data);
    return this.getValueById(data, 'UserProfile', id);
  }

  readCurrentCompanyId(data: any) {
    const userId = this.readCurrentUserId(data);
    return this.getField(data, 'UserProfile', userId, 'Company');
  }

  readCurrentCompany(data: any) {
    const id = this.readCurrentCompanyId(data);
    return this.getValueById(data, 'Company', id);
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