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
    public Role: number,
    public proposer: string,
    public jobs: string[]
  ) {}

  static fromFormGroup(group: FormGroup) {
    let input = group.value;
    return new Register(
      input.firstPage.firstname,
      input.firstPage.lastname,
      input.firstPage.email,
      input.firstPage.password,
      input.secondPage.company,
      +input.secondPage.role[0].id,
      input.secondPage.proposer,
      input.secondPage.jobs.map((job: Option) => job.id)
    );
  };
};


export class ForgotPassword {
  static readonly type= "[Auth] Frogot password"
  constructor(public token: string,public password: string){
  }
}