//find a way to mark objects as serialized

import { Serialized } from "src/app/shared/common/types";
import { Mapper } from "./mapper.model";

export interface Table {
  new (id: number, values: string[]): object;
  //getName(): string;
  fields: Map<string, number>;
  dependencyMap: Map<number, Table | Value>;
  getById(id: number): any;
  destroy(id: number): void
  getName(): string;
};

export interface Value {
  new (id: number, name: string): object;
  //getName(): string;
  getById(id: number): any;
  destroy(id: number): void;
  getName(): string;
};

/* base table metaclass */
/* instance stuff and all that */
class __table__ {
  static isTable(table: Table | Value): table is Table {
    return table && (table instanceof __table__  || (table.prototype && table.prototype instanceof __table__));
  }
  static getName(): string { return this.name.slice(0, -3); }

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

    for( const prop of props ) {
      let index = this.structure.fields.get(prop);
      if ( !index ) throw `Unknown property ${prop} of table ${this.structure.name}`;

      console.log(prop, index, this.values[index], Array.isArray(this.values[index]));
      if ( Array.isArray(this.values[index]) ) {
        //Destroy
        this.values[index].forEach((value: __table__) => {
          value.structure.destroy(value.id);
        });
        
        this.values[index] = Mapper.mapArray(data, prop);
      } else {
        console.log('prop', prop, 'val', this.values[index]);
        if ( __table__.isTable(this.values[index]) )
          this.values[index].update(data[prop]);
        else
          this.values[index] = data[prop];
      }
    }

    return this;
  }

  pushValue(field: string, data: any) {
    const value = this.getField(field);
    if ( !value ) throw `Unknow field ${field} on ${this.structure.getName()}`;
    if ( !Array.isArray(value) ) throw `Field ${field} on ${this.structure.getName()} is not an array.`;
    value.push(data);
  };

  getIndex(key: string) {
    return this.structure.fields.get(key);
  }

  getField(key: string) {
    return this.values[this.getIndex(key)!];
  }

  copy(value: any) {
    this.values = value.slice();
  }
};

/* hold information about the table instance */
function createTable<T>() {
  class __table_instance__ extends __table__ {

    static dependencyMap = new Map<number, Table | Value>();
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
  };

  return __table_instance__;
};

function createValue() {
  return class __value__ {

    static instances = new Map<number, __value__>();
    static getById(id: number) { return this.instances.get(id); }
    static destroy(id: number) { this.instances.delete(id); }
    static getName() { return __table__.getName.call(this); }

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
  get label(): LabelRow { return this.getField('Label') }
  get date() { return this.getField('date') }
};

export class FilesRow extends createTable<FilesRow>() {
  get nature(): string { return this.getField('nature') }
  get name(): string { return this.getField('name') }
  get ext(): string { return this.getField('ext') }
  get expirationDate(): string { return this.getField('expirationDate') }
  get timestamp(): number { return this.getField('timestamp') }
  get content(): string { return this.getField('content') }

  serialize() {
    console.log('-- custom serialize -- ');
    return super.serialize();
  }

  static imageExtension = ['png', 'jpeg', 'jpg'];
  static getFileType(ext: string) {
    if ( this.imageExtension.includes(ext) ) return 'image/' + ext;
    return 'application/' + ext;
  }
  
  static fileColors: {[key: string]: string} = {
    'impôts': "#156C9D",
    'kbis': "#156c9d",
    'urssaf': "#F9C067",
    'trav. dis': "#054162",
    'rc + dc': "#999999",
    'congés payés': "32A290",
  };

  static getFileColor(name: string) {
    name = name.toLowerCase();
    if ( this.fileColors[name] ) return this.fileColors[name];
    return "#32a290";
  }
}

// Tables
export class CompanyRow extends createTable<CompanyRow>() {

  get name() { return this.getField('name') }
  get siret() { return this.getField('siret') }
  get capital() { return this.getField('capital') }
  get revenue() { return this.getField('revenue') }
  get logo() { return this.getField('logo') }
  get webSite() { return this.getField('webSite') }
  get stars() { return this.getField('stars') }
  get companyPhone() { return this.getField('companyPhone') }
  get files(): FilesRow[] { return this.getField('Files'); }

  get jobs(): JobForCompanyRow[] { return this.getField('JobForCompany') }
  get labels():  LabelForCompanyRow[] { return this.getField('LabelForCompany') }
};

export class UserProfileRow extends createTable<UserProfileRow>() {
  static getName() { return 'Userprofile'; }

  get user(): string { return this.getField('userName') }
  get company(): CompanyRow { return this.getField('Company') }
  get firstName(): string { return this.getField('firstName') }
  get lastName(): string { return this.getField('lastName') }
  get proposer(): string { return this.getField('proposer') }
  get role(): RoleRow { return this.getField('role') } /*fix here: role -> Role */
  get cellPhone(): string { return this.getField('cellPhone') }
};

export class EstablishmentsRow extends createTable<EstablishmentsRow>() {

  get name() { return this.getField('nom'); }
  get address() { return this.getField('adresse'); }
  get activity() { return this.getField('activity'); }
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

// /* new mapper */
// export class DataMapper {

//   private static fieldToClass: {[key: string]: Table | Value} = {
//     'Company': CompanyRow,
//     'Userprofile': UserProfileRow,
//     'Role': RoleRow, 'role': RoleRow, /* fix here: Report this to JLW */
//     'Label': LabelRow,
//     'Job': JobRow,
//     'JobForCompany': JobForCompanyRow,
//     'LabelForCompany': LabelForCompanyRow,
//     'Files': FilesRow
//   };

//   private static getClassName(table: Table | Value) {
//     return table.getName();
//   }

//   static readonly definedValues = ['Role', 'Label', 'Job'] as const;
//   static readonly definedTables = ['Company', 'Userprofile', 'JobForCompany', 'LabelForCompany', 'Files'] as const;

//   static getField(name: string) {
//     const clazz = this.fieldToClass[name];
//     if ( !clazz ) throw `Unknown field ${name}`; //only during tests
//     return { name, class: clazz }
//   };

//   static isDefined(name: string) {
//     if ( this.isDefinedValue(name) ) return true;
//     return this.isDefinedValue(name);
//   };

//   static isDefinedTable(name: string) {
//     if ( this.definedTables.includes(name as any) ) return true;
//     return false;
//   }

//   static isDefinedValue(name: string) {
//     if ( this.definedValues.includes(name as any) ) return true;
//     return false;
//   }

//   static fieldIsTable(data: any, name: string) { return data.hasOwnProperty(name + 'Fields') }; 
//   static fieldIsSimple(data: any, name: string) { return data.hasOwnProperty(name + 'Indices'); };
//   static fieldIsValue(data: any, name: string) { return !this.fieldIsTable(data, name); };

//   static getFeatures(data: any) {
//     const tables: string[] = [], values: string[] = [];
//     Object.keys(data).forEach(key => {
//       if ( !this.isDefined(key) ) throw `Undefined feature ${key}.`; //only during tests
//       if ( this.fieldIsTable(data, key) ) tables.push(key);
//       else values.push(key);
//     });
//     return {tables, values};
//   };

//   static getValuesOf(data: any, name: string) {
//     const value = data[name + 'Values'];
//     if ( !value ) throw `Unknown field ${value}.`;
//     return value;
//   }
  
//   static mapFields(data: any, table: Table) {
//     const name = this.getClassName(table),
//       fields = data[name + 'Fields'] as string[],
//       indices = data[name + 'Indices'] as string[];

//     fields.forEach((field, index) => table.fields.set(field, index));
//     indices.forEach(index => {
//       table.dependencyMap.set(+index, this.fieldToClass[fields[+index]]);
//     });
//   }

//   private static mapSimpleTable(data: any, table: Table) {
//     const name = this.getClassName(table),
//       content = this.getValuesOf(data, name);
    
//     Object.entries<any[]>(content).forEach(([id, values]) => {
//       new table(+id, values);
//     });
//   }

//   // important function
//   // only works on tables but not values
//   static recursiveGetById(data: any, table: Table | Value, id: number) {
//     const name = this.getClassName(table);
//     let ref = table.getById(id);
//     if ( ref ) return ref;
    
//     if ( !__table__.isTable(table) )
//       return new table(id, data[name + 'Values'][id]);
    
//     const values = data[name + 'Values'][id] as any[];
//     const refValues = values.map((value, index) => {
//       if ( table.dependencyMap.has(index) ) {
//         const refTable = table.dependencyMap.get(index)!;
//         if ( Array.isArray(value) )
//           value = value.map(v => this.recursiveGetById(data, refTable, v))
//         else
//           value = this.recursiveGetById(data, refTable, value);
//       }
//       return value;
//     });

//     return new table(id, refValues);
//   }

//   private addEntry(table: Table, id: number, values: any) {
//     new table(id, values);
//   }

//   private static mapTable(data: any, table: Table) {
//     const name = this.getClassName(table),
//       content = this.getValuesOf(data, name);    
    
//     Object.keys(content).forEach(id => this.recursiveGetById(data, table, +id));
//   };
// };

// const data = {
//   "RoleValues": {1: "Eminem", 2: "Sad-LiveKid", 3: "Gorillaz"},
//   "UserprofileFields": ["email", "password", "Role"],
//   "UserprofileIndices": [2],
//   "UserprofileValues": {
//     1: ["anas.chatou@gmail.com", "12345678", [1]],
//     2: ["majed.abdennadher@gmail.com", "12345678", 2],
//     3: ["jlw@gmail.com", "12345678", 3],
//     4: ["anas@gmail.com", "12345678", 1]
//   }
// };

// DataMapper.mapFields(data, UserProfileRow);
// console.log(UserProfileRow.dependencyMap);
// console.log(DataMapper.recursiveGetById(data, UserProfileRow, 1));
// console.log([...RoleRow.instances.values()])

(window as any).RoleRow = RoleRow;