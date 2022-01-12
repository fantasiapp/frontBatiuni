import { getByValue } from 'src/common/functions';
import { UserState } from '../user/user.state';
import { Role, Job, Label, Company, UserProfile, JobForCompany, LabelForCompany } from './data.model';

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

export type Value = Role | Job | Label;
export type Table = UserProfile | Company;


export class Mapper {
  private static mapping: {[key: string]: ValueConstructor | TableConstructor } = {
    'Company': Company,
    'Userprofile': UserProfile,
    'Role': Role,
    'Label': Label,
    'Job': Job,
    'JobForCompany': JobForCompany,
    'LabelForCompany': LabelForCompany
  };

  private static mapped: Dict<boolean> = Object.keys(Mapper.mapping).reduce(
    (mapped, key) => {mapped[key] = false; return mapped}, ({} as Dict<boolean>)
  );

  private static fieldMap: {[key: string]: string} = {
    'job': 'Job',
    'company': 'Company',
    'role': 'Role',
    'label': 'Label'
  };

  static readonly definedValues = [
    'Role', 'Label', 'Job'
  ];

  static readonly definedTables = [
    'Company', 'Userprofile', 'JobForCompany', 'LabelForCompany'
  ];

  static getField(name: string): {
    name: string;
    class: ValueConstructor | TableConstructor;
    multiple: boolean;
  } {
    if ( this.fieldMap[name] ) return {
      name: this.fieldMap[name],
      class: this.mapping[this.fieldMap[name]],
      multiple: false
    }

    if ( name[name.length-1] == 's' ) {
      name = name.slice(0, -1);
      let result = this.getField(name);
      if ( result ) return {...result, multiple: true}
    }

    throw `Unknown name ${name}`;
  }

  static isTable(data: any, name: string) {
    return !!data[name + 'Fields'];
  }

  static isValue(data: any, name: string) {
    return !data[name + 'Fields'];
  }

  static getTablesNames(data: any) {
    return Object.keys(data).filter(
      key => key.endsWith('Fields')
    ).map(key => key.slice(0, -6));
  }
  
  static getValuesNames(data: any) {
    return this.definedValues.filter(valueName => data[valueName + 'Values']);
  }

  static getTableClass(name: string): TableConstructor {
    if ( this.definedTables.includes(name) )
      return Mapper.mapping[name] as TableConstructor;
    throw `Unknown table ${name}.`;
  }

  static getValueClass(name: string): ValueConstructor {
    if ( Mapper.definedValues.includes(name) )
      return Mapper.mapping[name] as ValueConstructor;
    throw `Unknown value ${name}.`;
  }

  private static readValue(data: any, name: string): Dict<string> {
    if ( this.definedValues.includes(name) )
      return data[name + 'Values'];
    throw `Unknown table ${name}.`;
  }

  
  private static readTable(data: any, name: string): Dict<any[]> {
    if ( this.definedTables.includes(name) )
      return data[name + 'Values'];
    throw `Unknown value ${name}.`;
  }

  private static mapFields(data: any, name: string) {
    let fields = data[name + 'Fields'],
      clazz = this.getTableClass(name);

    fields.forEach((field: string, index: number) => clazz.fields.set(field, index));
  };

  private static mapSimpleTable(data: any, name: string) {
    let clazz = this.getTableClass(name);
    Object.entries(this.readTable(data, name)).forEach(([id, values]) => new clazz(+id, values));
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

  private static mapTableDependencies(data: any, name: string) {
    let indices = data[name + 'Indices'] as number[],
      table = this.getTableClass(name);
    
    let dependencies = indices.map(index => {
      let name = getByValue(table.fields, index)!,
        field = this.getField(name);
      
        //map this class before
      if ( !this.mapped[field.name] ) {
        if ( this.definedTables.includes(field.name) )
          this.mapTable(data, field.name);
        else this.staticMap(data);
      };
      return field;
    });

    Object.entries(this.readTable(data, name)).forEach(([id, values]) => {
      indices.forEach((index, i) => {
        values[index] = dependencies[i].multiple ?
          values[index].map((id: string) => dependencies[i].class.getById(+id))
          : dependencies[i].class.getById(values[index])
      });

      new table(+id, values.slice());
    })
  };

  static mapTable(data: any, name: string) {
    this.mapFields(data, name);
    if ( this.isSimpleTable(data, name) )
      this.mapSimpleTable(data, name);
    else
      this.mapTableDependencies(data, name);
  }

  static mapRequest(data: any) {
    this.staticMap(data);
    this.getTablesNames(data).forEach(tableName => this.mapTable(data, tableName));
    console.log([...UserProfile.instances.values()]);
    console.log([...JobForCompany.instances.values()]);
  };

  static mapModifyForm(user: UserProfile, changes: any) {
    const keys = Object.keys(changes),
      profileKeys = keys.filter(key => key.startsWith('Userprofile')),
      companyKeys = keys.filter(key => key.startsWith('Company'));

    const output: any = {action: 'modifyUser'};

    if ( profileKeys.length ) {
      output['Userprofile'] = {id: user.id};
      for ( let key of profileKeys )
        output['Userprofile'][key.split('.')[1]] = changes[key];
    }

    if ( companyKeys.length ) {
      output['Company'] = {id: user.company.id};
      for ( let key of companyKeys )
        output['Company'][key.split('.')[1]] = changes[key];
    }

    if ( changes['JobForCompany'] ) output['JobForCompany'] = changes['JobForCompany'];
  
    return output;
  };
};