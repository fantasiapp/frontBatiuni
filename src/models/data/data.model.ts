export class Role {
  constructor(public id: number, public name: string) {
    Role.instances.set(id, this);
  }

  static instances = new Map<number, Role>();
  static getById(id: number) { return this.instances.get(id); }
};

export class Job {
  constructor(public id: number, public name: string) {
    Job.instances.set(id, this);
  }

  static instances = new Map<number, Job>();
  static getById(id: number) { return this.instances.get(id); }
};

export class Label {
  constructor(public id: number, public name: string) {
    Label.instances.set(id, this);
  }

  static instances = new Map<number, Label>();
  static getById(id: number) { return this.instances.get(id); }
};

export class Company {
  constructor(public id: number, private values: any[]) {
    Company.instances.set(id, this);
  }

  static fields = new Map<string, number>();
  static instances = new Map<number, Company>();
  static getById(id: number) { return this.instances.get(id); }

  get name() { return this.values[Company.fields.get('name')!]; }
  get siret() { return this.values[Company.fields.get('siret')!]; }
  get capital() { return this.values[Company.fields.get('capital')!]; }
  // get revenue() { return this.values[Company.fields.get('revenue')!]; }
  get logo() { return this.values[Company.fields.get('logo')!]; }
  get webSite() { return this.values[Company.fields.get('webSite')!]; }
  get stars() { return this.values[Company.fields.get('stars')!]; }
  get companyPhone() { return this.values[Company.fields.get('companyPhone')!]; }

  get jobs(): {job: Job, number: number}[] {
    //stop using ids
    return [...JobForCompany.instances.values()].filter(
      (t: JobForCompany) => t.company == this
    );
  }

  get labels(): {label: Label, date: string}[] {
    return [...LabelForCompany.instances.values()].filter(
      (t: LabelForCompany) => t.company == this
    );
  }

  //mutabe data
  update(data: any) { }
};

export class UserProfile {
  constructor(public id: number, private values: any[]) {
    UserProfile.instances.set(id, this);
  }

  static fields = new Map<string, number>();
  static instances = new Map<number, UserProfile>();
  static getById(id: number) { return this.instances.get(id); }

  get user(): string { return this.values[UserProfile.fields.get('userName')!]; }
  //user or userName ?
  get company(): Company { return this.values[UserProfile.fields.get('company')!]; }
  get firstName(): string { return this.values[UserProfile.fields.get('firstName')!]; }
  get lastName(): string { return this.values[UserProfile.fields.get('lastName')!]; }
  get proposer() { return this.values[UserProfile.fields.get('proposer')!]; }
  get role(): Role { return this.values[UserProfile.fields.get('role')!]; }
  get cellPhone() { return this.values[UserProfile.fields.get('cellPhone')!]; }
};

export class JobForCompany {
  constructor(public id: number, private values: any[]) {
    JobForCompany.instances.set(id, this);
  }

  static fields = new Map<string, number>();
  static instances = new Map<number, JobForCompany>();
  static getById(id: number) { return this.instances.get(id); }

  get job(): Job { return this.values[JobForCompany.fields.get('job')!]; }
  get company(): Company { return this.values[JobForCompany.fields.get('company')!]; }
  get number(): number { return this.values[JobForCompany.fields.get('number')!]; }
};

export class LabelForCompany {
  constructor(public id: number, private values: any[]) {

  }

  static fields = new Map<string, number>();
  static instances = new Map<number, LabelForCompany>();
  static getById(id: number) { return this.instances.get(id); }

  get label() { return this.values[LabelForCompany.fields.get('label')!]; }
  get date() { return this.values[LabelForCompany.fields.get('date')!]; }
  get company() { return this.values[LabelForCompany.fields.get('company')!]; }
}