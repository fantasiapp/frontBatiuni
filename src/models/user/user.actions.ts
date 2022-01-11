import { FormGroup } from "@angular/forms";
import { getDirtyValues } from "src/common/functions";

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
  constructor(form: any) {
    this.changes = getDirtyValues(form);
  }
  action = 'modifyUser';
};