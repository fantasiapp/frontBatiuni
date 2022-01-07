import { filterSplit, getByValue } from 'src/common/functions';
import { Optional } from 'src/common/types';
import { Role, Job, Label, Company, UserProfile } from './data.model';

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
    'Job': Job
  };

  private static mapped: Dict<boolean> = Object.keys(Mapper.mapping).reduce(
    (mapped, key) => {mapped[key] = false; return mapped}, ({} as Dict<boolean>)
  );

  private static fieldMap: {[key: string]: string} = {
    'job': 'Job',
    'company': 'Company',
    'role': 'Role',
  };

  static readonly definedValues = [
    'Role', 'Label', 'Job'
  ];

  static readonly definedTables = [
    'Company', 'Userprofile'
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
    console.trace();
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
};

let data = {
  JobValues: {1: 'TCE', 2: 'Cuisiniste', 3: 'Ingénieur en Aménagement et Urbanisme', 4: "Ingénieur d'affaires du BTP", 5: 'Economiste de la construction', 6: 'Dessinateur technique', 7: 'Conducteur de travaux bâtiment', 8: "Chef d'équipe BTP", 9: 'Calculateur projeteur en béton armé', 10: 'Technicien Expert VRD', 11: 'Métreur', 12: 'Maître d’œuvre', 13: 'Ingénieur en Génie Civil', 14: 'Géomètre topographe', 15: 'Assistant d’entrepreneur du BTP', 16: 'Aide-conducteur de travaux', 17: 'Acousticien', 18: 'Ingénieur études de prix', 19: 'Peintre décorateur', 20: 'Chef de chantier', 21: 'Conducteur d’engins', 22: 'Agenceur de cuisines et de salles de bains', 23: 'Vitrier', 24: 'Vitrailliste', 25: 'Restaurateur d’art', 26: 'Menuisier', 27: 'Terrassier', 28: 'Maçon', 29: 'Dessinateur-Projeteur', 30: 'Couvreur-zingueur', 31: 'Serrurier', 32: 'Plombier', 33: 'Electricien', 34: 'Chauffagiste', 35: 'Carreleur faïenceur', 36: 'Câbleur', 37: 'Bainiste', 38: 'Collaborateur d’architecte', 39: 'Charpentier', 40: 'Designer', 41: 'Ferronnier d’art'},
  LabelValues: {1: 'Qualibat', 2: 'RGE', 3: 'RGE Eco Artisan', 4: 'NF', 5: 'Effinergie', 6: 'Handibat', 7: 'Qualifelec', 8: 'Qualit’EnR', 9: 'Quali’Sol', 10: 'Quali’Bois', 11: 'Quali’PV', 12: 'Quali’Pac', 13: 'Certibat', 14: 'CERQUAL Qualitel Certification', 15: 'Autres...'},
  RoleValues: {1: 'Une entreprise à la recherche de sous-traitances', 2: "Un sous-traitant à la recherche d'une entreprise", 3: 'Les deux'},
  "UserprofileFields": [
    "user",
    "company",
    "firstName",
    "lastName",
    "proposer",
    "role",
    "cellPhone",
    "jobs"
  ],
  "UserprofileIndices": [
    1,
    5,
    7
  ],
  "UserprofileValues": {
    "2": [
      "anasschatoui@gmail.com",
      1,
      "Majed",
      "Majed",
      null,
      1,
      null,
      [
        1,
        2,
        3
      ]
    ]
  },
  "CompanyFields": [
    "name",
    "siret",
    "capital",
    "logo",
    "webSite",
    "stars",
    "companyPhone"
  ],
  "CompanyValues": {
    "1": [
      "Fantasiapp",
      null,
      null,
      null,
      null,
      null,
      null
    ]
  }
};

export function main() {
  Mapper.mapTable(data, 'Userprofile');
  console.log(Company.instances)
  console.log(UserProfile.instances);
}