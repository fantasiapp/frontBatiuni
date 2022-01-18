//find a way to mark objects as serialized

import { Serialized } from "src/common/types";
import { Mapper } from "./mapper.model";

export interface Table {
  new (id: number, values: string[]): object;
  fields: Map<string, number>;
  getById(id: number): any;
  destroy(id: number): void;
};

export interface Value {
  new (id: number, name: string): object;
  getById(id: number): any;
};

/* base table metaclass */
/* instance stuff and all that */
class __table__ {
  static isTable(value: any) { return value instanceof __table__; }

  constructor(public id: number, protected values: any[]) {}

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
    }; return output;
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
  /* but has the benefit that the only way to set data is from the back */
  update(data: any) {
    const props = Object.getOwnPropertyNames(data);
    console.log('updating', this, 'from', data);
    console.log('------------------------------------------------------')
    console.log('props', props);

    for( const prop of props ) {
      let index = this.structure.fields.get(prop);
      if ( !index ) throw `Unknown property ${prop} of table ${this.structure.name}`;

      if ( Array.isArray(this.values[index]) ) {
        //Destroy
        this.values[index].forEach((value: __table__) => {
          value.structure.destroy(value.id);
        });
        

        this.values[index] = Mapper.mapArray(data, prop);
      } else {
        if ( __table__.isTable(this.values[index]) )
          this.values[index].update(data[prop]);
        else
          this.values[index] = data[prop];
      }
    }

    return this;
  }

  getIndex(key: string) {
    return this.structure.fields.get(key);
  }

  getField(key: string) {
    return this.values[this.getIndex(key)!];
  }
};

/* hold information about the table instance */
function createTable<T>() {
  return class __table_instance__ extends __table__ {

    static fields = new Map<string, number>();
    static instances = new Map<number, T>();
    static getById(id: number): T { return __table_instance__.instances.get(id)! as unknown as T; }
    static destroy(id: number) { __table_instance__.instances.delete(id); }

    constructor(id: number, values: any[]) {
      super(id, values);
      __table_instance__.instances.set(id, this as unknown as T);
    }

    //for now to add types
    serialize(): Serialized<T> {
      return super.serialize();
    }

    asRaw(): Readonly<Serialized<T>> {
      return this as unknown as Readonly<Serialized<T>>;
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
export class RoleRow extends createValue() {};
export class JobRow extends createValue() {};
export class LabelRow extends createValue() {} ;

// Tables
export class JobForCompanyRow extends createTable<JobForCompanyRow>() {
  get job(): JobRow { return this.getField('Job'); }
  get number(): number { return this.getField('number'); }
}


export class LabelForCompanyRow extends createTable<LabelForCompanyRow>() {
  get label() { return this.getField('Label') }
  get date() { return this.getField('date') }
};

export class FilesRow extends createTable<FilesRow>() {
  get nature() { return this.getField('nature') }
  get name() { return this.getField('name') }
  get ext() { return this.getField('ext') }
  get expiration() { return this.getField('expirationDate') }
  get timestamp() { return this.getField('timestamp') }
  get content() { return this.getField('content') }

  serialize() {
    console.log('-- custom serialize -- ');
    return super.serialize();
  }
}

// Tables
export class CompanyRow extends createTable<CompanyRow>() {

  get name() { return this.getField('name') }
  get siret() { return this.getField('siret') }
  get capital() { return this.getField('capital') }
  // get revenue() { return this.getField('revenue') }
  get logo() { return this.getField('logo') }
  get webSite() { return this.getField('webSite') }
  get stars() { return this.getField('stars') }
  get companyPhone() { return this.getField('companyPhone') }

  get jobs(): JobForCompanyRow[] { return this.getField('JobForCompany') }
  get labels():  LabelForCompanyRow[] { return this.getField('LabelForCompany') }
};

export class UserProfileRow extends createTable<UserProfileRow>() {
  get user(): string { return this.getField('userName') }
  get company(): CompanyRow { return this.getField('Company') }
  get firstName(): string { return this.getField('firstName') }
  get lastName(): string { return this.getField('lastName') }
  get proposer(): string { return this.getField('proposer') }
  get role(): RoleRow { return this.getField('role') } /*fix here: role -> Role */
  get cellPhone(): string { return this.getField('cellPhone') }
};

//Objectives
//Move mapper here
//Make a model interface and these types should implement it
// -- Serialized stuff is the model


//Type aliases
export type Profile = Serialized<UserProfileRow>;
export type Company = Serialized<CompanyRow>;
export type Files = Serialized<FilesRow>;
export type JobForCompany = Serialized<JobForCompanyRow>;
export type LabelForCompany = Serialized<LabelForCompanyRow>;
export type Role = Serialized<RoleRow>;
export type Label = Serialized<LabelRow>;
export type Job = Serialized<JobRow>;