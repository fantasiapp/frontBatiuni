import { RegistrationModel } from "./register.model";

export class Update {
  static readonly type = '[Register] update';
  constructor(public model: RegistrationModel) {}
};