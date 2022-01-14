import produce from "immer";

export interface Table {
  new (id: number, values: string[]): object;
  fields: Map<string, number>;
  getById(id: number): any;
};

export interface Value {
  new (id: number, name: string): object;
  getById(id: number): any;
};

/* base table class */
abstract class __table__ {

  static isTable(value: any) { return value instanceof __table__; }

  abstract id: number;
  abstract values: any[];

  get structure() { return this.constructor as Table; }

  /* used as ngxs state */
  serialize() {
    const descriptors = Object.getOwnPropertyDescriptors(this.structure.prototype);
    delete descriptors['constructor']; //ignore constructor

    const output: any = {id: this.id};
    for ( const prop of Object.keys(descriptors) ) {
      let value = descriptors[prop].get?.call(this);
      value = this.deepSerialize(value);
      output[prop] = value;
    }
    return output;
  }

  /* recursive helper */
  private deepSerialize(value: any): any {
    if ( Array.isArray(value) )
      return value.map(v => this.deepSerialize(v));
    if ( value instanceof __table__ )
      return value.serialize();
    else
      return value;
  }

  /* recursive update by mutating the data */
  /* one issue with this is that .serialize() will be called to update the app model */
  /* try to find a way to prune unmodified nodes */
  update(data: any) {
    const props = Object.getOwnPropertyNames(data);
    
    for( const prop of props ) {
      let index = this.structure.fields.get(prop);
      if ( !index ) throw `Unknown property ${prop} of table ${this.structure.name}`;
      
      if ( __table__.isTable(this.values[index]) )
        this.values[index].update(data[prop]);
      else
        this.values[index] = data[prop];
    }

    return this;
  }
};

/* hold information about the table + enforces some types */
function createTable<T>() {
  return class __new_table__ extends __table__ {
    
    static fields = new Map<string, number>();
    static instances = new Map<number, T>();
    static getById(id: number): T { return __new_table__.instances.get(id)! as unknown as T; }

    constructor(public id: number, public values: any[]) {
      super();
      __new_table__.instances.set(id, this as unknown as T);
    }
  }
};

function createValue() {
  return class __value__ {

    static instances = new Map<number, __value__>();
    static getById(id: number) { return this.instances.get(id); }

    constructor(public id: number, public name: string) {
      __value__.instances.set(id, this);
    }

    serialize() {
      return Object.assign({}, this);
    }
  };
};

// Values
export class Role extends createValue() {};
export class Job extends createValue() {};
export class Label extends createValue() {} ;

// Tables
export class JobForCompany extends createTable<JobForCompany>() {
  get job(): Job { return this.values[JobForCompany.fields.get('Job')!]; }
  get number(): number { return this.values[JobForCompany.fields.get('number')!]; }
}


export class LabelForCompany extends createTable<LabelForCompany>() {
  get label() { return this.values[LabelForCompany.fields.get('Label')!]; }
  get date() { return this.values[LabelForCompany.fields.get('date')!]; }
};

export class Files extends createTable<Files>() {
  get nature() { return this.values[Files.fields.get('nature')!]; }
  get name() { return this.values[Files.fields.get('name')!]; }
  get ext() { return this.values[Files.fields.get('ext')!]; }
  get expiration() { return this.values[Files.fields.get('expirationDate')!]; }
  get timestamp() { return this.values[Files.fields.get('timestamp')!]; }
  get content() { return this.values[Files.fields.get('content')!]; }

  serialize() {
    console.log('-- custom serialize -- ');
    return super.serialize();
  }
}

// Tables
export class Company extends createTable<Company>() {

  get name() { return this.values[Company.fields.get('name')!]; }
  get siret() { return this.values[Company.fields.get('siret')!]; }
  get capital() { return this.values[Company.fields.get('capital')!]; }
  // get revenue() { return this.values[Company.fields.get('revenue')!]; }
  get logo() { return this.values[Company.fields.get('logo')!]; }
  get webSite() { return this.values[Company.fields.get('webSite')!]; }
  get stars() { return this.values[Company.fields.get('stars')!]; }
  get companyPhone() { return this.values[Company.fields.get('companyPhone')!]; }

  get jobs(): JobForCompany[] { return this.values[Company.fields.get('JobForCompany')!]; }
  get labels(): LabelForCompany[] { return this.values[Company.fields.get('LabelForCompany')!]; }
};

export class UserProfile extends createTable<UserProfile>() {
  get user(): string { return this.values[UserProfile.fields.get('userName')!]; }
  get company(): Company { return this.values[UserProfile.fields.get('Company')!]; }
  get firstName(): string { return this.values[UserProfile.fields.get('firstName')!]; }
  get lastName(): string { return this.values[UserProfile.fields.get('lastName')!]; }
  get proposer() { return this.values[UserProfile.fields.get('proposer')!]; }
  get role(): Role { return this.values[UserProfile.fields.get('role')!]; } /*fix here: role -> Role */
  get cellPhone() { return this.values[UserProfile.fields.get('cellPhone')!]; }
};