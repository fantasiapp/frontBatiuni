import { FormArray, FormGroup } from "@angular/forms";
import { getDirtyValues } from "src/common/functions";
import { Job, UserProfile } from "../data/data.model";

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
  action = 'modifyPwd';
  constructor(public oldPwd: string, public newPwd: string) {}
};

export class GetUserData {
  static readonly type = '[User] Get User data';
  constructor(public token: string) {}
  action = 'getUerData';
};

export class ModifyUserProfile {
  static readonly type = '[User] Change User Profile';
  changes: any;
  
  constructor({profile, form}: {profile: UserProfile, form: FormGroup}) {
    this.changes = getDirtyValues(form);
    delete this.changes['Userprofile.jobs'];
    if ( form.controls['Userprofile.jobs']!.dirty ) {
      const jobs = (form.controls['Userprofile.jobs']! as FormArray).value;
      this.changes['JobForCompany'] = jobs.map(
        ({job, number}: {job: Job, number: number}) => ([job.id, number, profile.company.id])
      )
    }

    console.log('before post', this.changes);
  }
  action = 'modifyUser';
};