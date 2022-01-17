import { FormArray, FormGroup } from "@angular/forms";
import { FileinputOutput } from "src/app/shared/components/filesUI/files.ui";
import { getDirtyValues } from "src/common/functions";
import { JobForCompanyRow, JobRow, LabelForCompanyRow, LabelRow, UserProfileRow } from "../data/data.model";

export class ChangeProfileType {
  static readonly type = '[User] Change Profile Type';
  constructor(public type: boolean) {};
};

export class ChangeProfilePicture {
  static readonly type = '[User] Change Profile Picture';
  constructor(public src: any, public name: string) {}
};

export class ChangePassword {
  static readonly type = '[User] Change Password';
  readonly action = 'modifyPwd';
  constructor(public oldPwd: string, public newPwd: string) {}
};

export class GetUserData {
  static readonly type = '[User] Get User data';
  constructor(public token: string) {}
  readonly action = 'getUerData';
};

export class ModifyUserProfile {
  static readonly type = '[User] Change User Profile';
  readonly action = 'modifyUser';
  changes: any = {};
  
  //for now we mark job as dirty, but we should take it directly from the form
  constructor({profile, form}: {profile: UserProfileRow, form: FormGroup}) {    
    const changes = getDirtyValues(form);
    if ( Object.keys(changes).length == 0 ) return;

    const jobs = changes['Userprofile.Company.JobForCompany'],
      labels = changes['Userprofile.Company.LabelForCompany'];
    
    if ( jobs ) {
      changes['Userprofile.Company.JobForCompany'] = Object.values<JobForCompanyRow>(jobs).map(
        ({job, number}: {job: JobRow, number: number}) => ([job.id, number])
      );
    }

    if ( labels ) {
      changes['Userprofile.Company.LabelForCompany'] = Object.values<any>(labels).map(
        ({label, fileData}: {label: LabelRow, fileData: FileinputOutput}) => ([label.id, fileData.date!.replace(/-/g, '/')])
      );
    }

    this.changes['Userprofile'] = {id: profile.id};
    for ( const [field, value] of Object.entries<any>(changes) ) {
      const tree = field.split('.'), lastKey = tree[tree.length-1];
      let root = this.changes;
      for ( const level of tree.slice(0, -1) ) {
        if ( !root[level] ) root[level] = {}   
        root = root[level];
      }
      root[lastKey] = value;
    }

  }
};