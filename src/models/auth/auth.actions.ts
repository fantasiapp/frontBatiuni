import { FormGroup } from "@angular/forms";
import { Option } from "../option";

export class Login {
  static readonly type = '[Auth] Login';
  constructor(public username: string, public password: string) {}
};

export class Logout {
  static readonly type = '[Auth] Logout';
};

export class ConfirmAccount {
  static readonly type = '[Auth] Confirm Account';
  constructor(public token: string) {}
};

export class Register {
  static readonly type = '[Auth] Register';
  private constructor(
    public firstname: string,
    public lastname: string,
    public email: string,
    public password: string,
    public company: any,
    public role: number,
    public proposer: string,
    public jobs: string[]
  ) {}

  static fromFormGroup(group: FormGroup) {
    let input = group.value;
    return new Register(
      input.firstname,
      input.lastname,
      input.email,
      input.password,
      input.company,
      +input.role[0].id,
      input.proposer,
      input.jobs.map((job: Option) => job.id)
    );
  };
};