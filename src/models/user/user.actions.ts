import { FormArray, FormGroup } from "@angular/forms";
import { FileinputOutput } from "src/app/shared/components/filesUI/files.ui";
import { getDirtyValues } from "src/common/functions";
import { JobRow, LabelRow, UserProfileRow } from "../data/data.model";

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
  
  constructor({profile, form}: {profile: UserProfileRow, form: FormGroup}) {
    this.changes = getDirtyValues(form);
    console.log(this.changes['Company.labels']);
    delete this.changes['Userprofile.jobs'];
    if ( form.controls['Userprofile.jobs']!.dirty ) {
      const jobs = (form.controls['Userprofile.jobs']! as FormArray).value;
      this.changes['JobForCompany'] = jobs.map(
        ({job, number}: {job: JobRow, number: number}) => ([job.id, number, profile.company.id])
      );
    }

    delete this.changes['Company.labels'];
    if ( form.controls['Company.labels']!.dirty ) {
      const labels = (form.controls['Company.labels'] as FormArray).value;
      console.log(labels);
      this.changes['LabelForCompany'] = labels.map(
        ({label, fileData}: {label: LabelRow, fileData: FileinputOutput}) => ([label.id, fileData.date!.replace(/-/g, '/'), profile.company.id])
      )
    }

    console.log('before post', this.changes);
  }
  action = 'modifyUser';
};