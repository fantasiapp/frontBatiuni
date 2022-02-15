import { Injectable } from "@angular/core";
import { Store } from "@ngxs/store";
import { DataTypes } from "./data.interfaces";
import { addValues, addRecord, replace, update } from "./state.operators";
import { patch } from '@ngxs/store/operators';
import { Availability } from "src/app/shared/components/calendar/calendar.ui";


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
  'Candidate': 'candidates',
  'DetailedPost': 'details',
  'Supervisions': 'supervisions',
  'Disponibility': 'availabilities',
  'Mission': 'missions'
};

export function getOriginalName(name: string) {
  for ( const transformed in NameMapping ) {
    if ( NameMapping[transformed] == name )
      return transformed;
  }
  return name;
};

export function getAvailabilityName(availability: Availability) {
  return availability;
};

@Injectable({
  providedIn: 'root'
})
export class DataReader {

  constructor(private store: Store) {
    
  }

  getFieldIndex(data: any, type: DataTypes, child: DataTypes) {
    //HACK
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
      names = keys.map(key => key.slice(0, -suffix.length)) as DataTypes[],
      operations = names.map((name, i) => addValues(name, data[keys[i]]));

    return operations;    
  }

  readInitialData(data: any) {
    const suffix = 'Values',
      keys = Object.keys(data).filter(key => key.endsWith('Values')),
      names = keys.map(key => key.slice(0, -suffix.length)) as DataTypes[],
      operations = names.map((name, i) => addRecord(name, data[name + 'Fields'], data[keys[i]]));

    return operations;
  }

  readCurrentSession(data: any) {
    const companyId = this.readCurrentCompanyId(data),
      roles = this.getField(data, 'Company', companyId, 'Role');
    
    return patch({
      session: {
        currentUser: data['currentUser'],
        view: roles == 2 ? 'PME' : 'ST'
      }
    })
  }

  readUpdates(data: any) {
    return Object.keys(data).map(name => update(name as DataTypes, data[name]));
  }
};