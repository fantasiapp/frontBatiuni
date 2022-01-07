const mapping = new Map<string, any>();

function nonNullable(x: any) { return x; } 

function getByValue<K, V>(map: Map<K, V>, searchValue: V): K | null {
  for (let [key, value] of map.entries()) {
    if (value === searchValue)
      return key;
  }
  return null;
}

function staticMap(data: any, cls: any) {
  if ( cls.mapped || !data[cls.fieldName + 'Values']) return cls;

  Object.entries(data[cls.fieldName + 'Values']).map(
    ([id, value]: [string, any]) => new cls(+id, value.slice())
  );
  cls.mapped = true;
  return cls;
};

function map(data: any, cls: any) {
  const field = cls.fieldName;

  if ( !data[field + 'Fields'] ) return staticMap(data, cls);

  data[field + 'Fields']?.forEach((field: string, index: number) =>
    cls.fields.set(field, index)
  );

  console.log('>>', !data[field + 'Indices']);

  if ( !data[field + 'Indices'] ) {
    //Instances can be created from data immediately;
    Object.entries(data[field + 'Values']).forEach(
      ([id, values]: [string, any]) => new cls(+id, values.slice())
    );
    cls.mapped = true;
  } else {
    //Class cannot be mapped unless all references are loaded
    const indices = data[field + 'Indices'];
    const classes = indices.map((index: number) => {
      let className = getByValue<string, number>(cls.fields, index),
        c = className ? mapping.get(className) : null;
      return c;
    }).filter(nonNullable)
    .map((cls: any) => cls.mapped ? cls : map(data, cls)).filter(nonNullable)

    console.log(classes);
        
    Object.entries(data[field + 'Values']).forEach(
      ([id, values]: [string, any]) => {
        let inc = 0;
        values = values.map((value: any, index: number) => {          
          if ( indices.includes(index) ) {
            const src = classes[inc++];
            return Array.isArray(value) ? value.map(v => src.getById(+v)) : src.getById(+value);
          } return value;
        });

        new cls(+id, values);
      }
    )

    cls.mapped = true;
  }

  return cls;
};

export class Role {
  private constructor(private id: number, public name: string) {
    Role.instances.set(id, this);
  }

  static instances = new Map<number, Role>();
  static getById(id: number) { return this.instances.get(id); }
  static mapped: boolean = false;
  static fieldName = 'Role';
};

export class Job {
  private constructor(private id: number, public name: string) {
    Job.instances.set(id, this);
  }

  static instances = new Map<number, Job>();
  static getById(id: number) { return this.instances.get(id); }
  static mapped: boolean = false;
  static fieldName = 'Job';
};

export class Label {
  private constructor(private id: number, public name: string) {
    Label.instances.set(id, this);
  }

  static instances = new Map<number, Label>();
  static getById(id: number) { return this.instances.get(id); }
  static mapped: boolean = false;
  static fieldName = 'Label';
};

export class Company {
  private constructor(private id: number, private values: any[]) {
    Company.instances.set(id, this);
  }

  static fields = new Map<string, number>();
  static instances = new Map<number, Company>();
  static getById(id: number) { return this.instances.get(id); }

  static fieldName: string = 'Company';
  static mapped: boolean = false;

  get name() { return this.values[Company.fields.get('name')!]; }
  get siret() { return this.values[Company.fields.get('siret')!]; }
  get capital() { return this.values[Company.fields.get('capital')!]; }
  get logo() { return this.values[Company.fields.get('logo')!]; }
  get webSite() { return this.values[Company.fields.get('webSite')!]; }
  get stars() { return this.values[Company.fields.get('stars')!]; }
  get companyPhone() { return this.values[Company.fields.get('companyPhones')!]; }
};

export class UserProfile {
  private constructor(private id: number, private values: any[]) {
    UserProfile.instances.set(id, this);
  }

  static fields = new Map<string, number>();
  static instances = new Map<number, UserProfile>();
  static getById(id: number) { return this.instances.get(id); }

  static fieldName: string = 'Userprofile';
  static mapped: boolean = false;

  get user(): string { return this.values[UserProfile.fields.get('user')!]; }
  get company(): Company { return this.values[UserProfile.fields.get('company')!]; }
  get firstName(): string { return this.values[UserProfile.fields.get('firstName')!]; }
  get lastName(): string { return this.values[UserProfile.fields.get('lastName')!]; }
  get proposer() { return this.values[UserProfile.fields.get('proposer')!]; }
  get role(): number { return this.values[UserProfile.fields.get('role')!]; }
  get cellPhone() { return this.values[UserProfile.fields.get('cellPhone')!]; }
  get jobs() { return this.values[UserProfile.fields.get('jobs')!]; }
};

mapping.set('company', Company);
mapping.set('role', Role);
mapping.set('userprofile', UserProfile);
mapping.set('jobs', Job);
mapping.set('label', Label);

export function main() {

  let generalData = {
    "JobValues": {
      1: "TCE",
      2: "ABC",
      3: "EDX"
    },
    "RoleValues": {
      1: "ST",
      2: "PME",
      3: "Les deux"
    }
  };

  staticMap(generalData, Job);
  staticMap(generalData, Role);


  let data = {
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

  map(data, UserProfile);
  const anass = UserProfile.getById(2);
  console.log(anass?.firstName, anass?.company.name)
  
}

