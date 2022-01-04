export class ChangeProfileType {
  static readonly type = '[User] Change Profile Type';
  constructor(public type: boolean) {};
};

export class ChangeProfilePicture {
  static readonly type = '[User] Change Profile Picture';
  constructor(public src: string) {}
};


export class ChangePassword {
  static readonly type = '[User] Change Password';
  action = 'modifyPwd';
  constructor(public oldPwd: string, public newPwd: string) {}
}