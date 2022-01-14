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

  getIndex(key: string) {
    return this.structure.fields.get(key);
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
  get job(): Job { return this.values[this.getIndex('Job')!]; }
  get number(): number { return this.values[this.getIndex('number')!]; }
}


export class LabelForCompany extends createTable<LabelForCompany>() {
  get label() { return this.values[this.getIndex('Label')!]; }
  get date() { return this.values[this.getIndex('date')!]; }
};

export class Files extends createTable<Files>() {
  get nature() { return this.values[this.getIndex('nature')!]; }
  get name() { return this.values[this.getIndex('name')!]; }
  get ext() { return this.values[this.getIndex('ext')!]; }
  get expiration() { return this.values[this.getIndex('expirationDate')!]; }
  get timestamp() { return this.values[this.getIndex('timestamp')!]; }
  get content() { return this.values[this.getIndex('content')!]; }

  serialize() {
    console.log('-- custom serialize -- ');
    return super.serialize();
  }
}

// Tables
export class Company extends createTable<Company>() {

  get name() { return this.values[this.getIndex('name')!]; }
  get siret() { return this.values[this.getIndex('siret')!]; }
  get capital() { return this.values[this.getIndex('capital')!]; }
  // get revenue() { return this.values[this.getIndex('revenue')!]; }
  get logo() { return this.values[this.getIndex('logo')!]; }
  get webSite() { return this.values[this.getIndex('webSite')!]; }
  get stars() { return this.values[this.getIndex('stars')!]; }
  get companyPhone() { return this.values[this.getIndex('companyPhone')!]; }

  get jobs(): JobForCompany[] { return this.values[this.getIndex('JobForCompany')!]; }
  get labels():  LabelForCompany[] { return this.values[this.getIndex('LabelForCompany')!]; }
};

export class UserProfile extends createTable<UserProfile>() {
  get user(): string { return this.values[this.getIndex('userName')!]; }
  get company(): Company { return this.values[this.getIndex('Company')!]; }
  get firstName(): string { return this.values[this.getIndex('firstName')!]; }
  get lastName(): string { return this.values[this.getIndex('lastName')!]; }
  get proposer(): string { return this.values[this.getIndex('proposer')!]; }
  get role(): Role { return this.values[this.getIndex('role')!]; } /*fix here: role -> Role */
  get cellPhone(): string { return this.values[this.getIndex('cellPhone')!]; }
};