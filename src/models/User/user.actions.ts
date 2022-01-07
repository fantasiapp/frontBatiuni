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
export class getGeneraleData {
  static readonly type = '[any] Get General data';
  action = 'getGeneralData';
}

export class getUserData {
  static readonly type = '[User] Get User data';
  constructor(public token: string) {}
  action = 'getUerData';
}