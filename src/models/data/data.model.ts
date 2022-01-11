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
};

export class UserProfile {
  constructor(public id: number, private values: any[]) {
    UserProfile.instances.set(id, this);
  }

  static fields = new Map<string, number>();
  static instances = new Map<number, UserProfile>();
  static getById(id: number) { return this.instances.get(id); }

  get user(): string { return this.values[UserProfile.fields.get('userName')!]; }
  get company(): Company { return this.values[UserProfile.fields.get('company')!]; }
  get firstName(): string { return this.values[UserProfile.fields.get('firstName')!]; }
  get lastName(): string { return this.values[UserProfile.fields.get('lastName')!]; }
  get proposer() { return this.values[UserProfile.fields.get('proposer')!]; }
  get role(): number { return this.values[UserProfile.fields.get('role')!]; }
  get cellPhone() { return this.values[UserProfile.fields.get('cellPhone')!]; }
  get jobs() { return this.values[UserProfile.fields.get('jobs')!]; }
};