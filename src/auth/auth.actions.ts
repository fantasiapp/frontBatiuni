import { FormGroup } from "@angular/forms";
import { Option } from "src/components/options/options";

export class Login {
  static readonly type = '[Auth] Login';
  constructor(public username: string, public password: string) {}
};

export class Logout {
  static readonly type = '[Auth] Logout';
};

export class Register {
  static readonly type = '[Auth] Register';
  private constructor(
    public firstname: string,
    public lastname: string,
    public email: string,
    public company: string,
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
      input.company,
      +input.role,
      input.proposer,
      input.jobs.map((job: Option) => job.id)
    );
  };
};