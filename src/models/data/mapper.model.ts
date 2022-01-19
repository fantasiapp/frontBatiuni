//enforce the model and do operations

import { filterMap, getByValue } from 'src/common/functions';
import { RoleRow, JobRow, LabelRow, CompanyRow, UserProfileRow, JobForCompanyRow, LabelForCompanyRow, FilesRow } from './data.model';

type Dict<T> = {[key: string]: T};
type ValueConstructor = {
  new (id: number, name: string): object;
  getById(id: number): any;
}

type TableConstructor = {
  new (id: number, values: string[]): object;
  fields: Map<string, number>;
  getById(id: number): any;
}

const definedTables = ['Company', 'Userprofile', 'JobForCompany', 'LabelForCompany', 'Files'] as const;
const definedValues = ['Role', 'Label', 'Job'] as const;
export type tableName = typeof definedTables[number];
export type valueName = typeof definedValues[number];
type definedType = tableName | valueName;


export type Value = RoleRow | JobRow | LabelRow;
export type Table = UserProfileRow | CompanyRow;

export class Mapper {
  private static mapping: {[key: string]: ValueConstructor | TableConstructor } = {
    'Company': CompanyRow,
    'Userprofile': UserProfileRow,
    'Role': RoleRow, 'role': RoleRow, /* fix here: Report this to JLW */
    'Label': LabelRow,
    'Job': JobRow,
    'JobForCompany': JobForCompanyRow,
    'LabelForCompany': LabelForCompanyRow,
    'Files': FilesRow
  };

  private static mapped: Dict<boolean> = Object.keys(Mapper.mapping).reduce(
    (mapped, key) => {mapped[key] = false; return mapped}, ({} as Dict<boolean>)
  );

  static readonly definedValues = definedValues;
  static readonly definedTables = definedTables;

  static getField(name: string): {
    name: definedType;
    class: ValueConstructor | TableConstructor;
  } {
    if ( this.mapping[name] ) return {
      name: name as definedType,
      class: this.mapping[name]
    }

    throw `Unknown name ${name}`;
  }

  static follow(path: string, root: UserProfileRow) {
    const properties = path.split('.').slice(1);
    let node: any = root;
    
    for ( const child of properties )
      node = node.values[node.getIndex(child)];
    
    return node;
  }

  static isTable(data: any, name: string) {
    return !!data[name + 'Fields'];
  }

  static isValue(data: any, name: string) {
    return !data[name + 'Fields'];
  }

  static getTablesNames(data: any): tableName[] {
    return Object.keys(data).filter(
      key => key.endsWith('Fields')
    ).map(key => key.slice(0, -6)) as tableName[];
  }
  
  static getValuesNames(data: any): valueName[] {
    return this.definedValues.filter(valueName => data[valueName + 'Values']);
  }

  static getTableClass(name: tableName): TableConstructor {
    if ( this.definedTables.includes(name) )
      return Mapper.mapping[name] as TableConstructor;
    throw `Unknown table ${name}.`;
  }

  static getValueClass(name: valueName): ValueConstructor {
    if ( Mapper.definedValues.includes(name) )
      return Mapper.mapping[name] as ValueConstructor;
    throw `Unknown value ${name}.`;
  }

  private static readValue(data: any, name: valueName): Dict<string> {
    if ( this.definedValues.includes(name) )
      return data[name + 'Values'];
    throw `Unknown table ${name}.`;
  }

  
  private static readTable(data: any, name: tableName): Dict<any[]> {
    if ( this.definedTables.includes(name) )
      return data[name + 'Values'];
    throw `Unknown value ${name}.`;
  }

  private static mapFields(data: any, name: tableName) {
    if ( (this.mapping[name] as TableConstructor).fields.size )
      return; //already mapped

    let fields = data[name + 'Fields'],
      clazz = this.getTableClass(name);

    fields.forEach((field: string, index: number) => clazz.fields.set(field, index));
  };

  private static mapSimpleTable(data: any, name: tableName) {
    let clazz = this.getTableClass(name);
    Object.entries(this.readTable(data, name)).forEach(([id, values]) => new clazz(+id, values.slice()));
    this.mapped[name] = true;
  }
  
  private static isSimpleTable(data: any, name: string) {
    return !data[name + 'Indices'];
  }

  static staticMap(data: any) {
    let values = this.getValuesNames(data),
      classes = values.map(value => this.getValueClass(value)) as ValueConstructor[];
    
    values.forEach((name, index) => {
      if ( this.mapped[name] ) return;
      Object.entries<string>(this.readValue(data, name))
        .forEach(([id, name]: [string, string]) => {
          new classes[index](+id, name);
        })
      this.mapped[name] = true;
    })
  }

  //map field method
  static getTableDependencies(data: any, name: tableName) {
    this.mapFields(data, name);
    const table = this.mapping[name] as TableConstructor;
    const fields = [...table.fields.keys()];
    return filterMap<string, TableConstructor>(fields, field => {
      if ( this.mapping[field] ) return this.mapping[field] as TableConstructor;
      return null;
    });
  }

  private static mapTableDependencies(data: any, name: tableName) {
    let indices = data[name + 'Indices'] as number[],
      table = this.getTableClass(name);
        
    const _name = name;
    let dependencies = indices.map(index => {
      let name = getByValue(table.fields, index)!,
        field = this.getField(name);
      
        //map this class before
      if ( !this.mapped[field.name] ) {;
        if ( (definedTables as any).includes(field.name) )
          this.mapTable(data, field.name as tableName);
        else this.staticMap(data);
      };
      return field;
    });

    Object.entries(this.readTable(data, name)).forEach(([id, src]) => {
      let values = src.slice();
      indices.forEach((index, i) => {
        values[index] = Array.isArray(values[index]) ?
          values[index].map((id: string) => dependencies[i].class.getById(+id))
          : dependencies[i].class.getById(values[index])
      });

      new table(+id, values);
    });

    this.mapped[name] = true;
    (window as any).mapper = Mapper;
  };

  static mapTable(data: any, name: tableName, onlyIfUnmapped: boolean = true) {
    if ( onlyIfUnmapped && this.mapped[name] ) return;
    this.mapFields(data, name);
    if ( this.isSimpleTable(data, name) )
      this.mapSimpleTable(data, name);
    else
      this.mapTableDependencies(data, name);
  }

  static mapAllFields(data: any) {
    Mapper.getTablesNames(data).map(table => Mapper.mapFields(data, table));
  }

  static mapRequest(data: any) {
    console.log(data);
    this.mapAllFields(data);
    this.staticMap(data);
    this.getTablesNames(data).forEach(tableName => this.mapTable(data, tableName));
  };

  /*fix here: doesnt work with jobs and labels */
  /*fix here: Ask JLW to move company inside Userprofil */
  static updateFrom(table: TableConstructor, context: any, data: any) {
    const row = table.getById(context.id),
      newContext = row.update(data['Userprofile']);

    return newContext.serialize();
  }

  //Bad code !!
  //This should save the structure

  static mapArray(data: any, prop: string) {
    const clazz = prop == 'JobForCompany' ? JobRow : LabelRow,
      table = prop == 'JobForCompany' ? JobForCompanyRow : LabelForCompanyRow;
    return Object.entries<any>(data[prop]).map(([id, d]) => new table(+id, [clazz.getById(d[0]), d[1]]));
  }
};

(window as any).mapper = Mapper;