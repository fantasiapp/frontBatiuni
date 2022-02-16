export type Record<T = any> = {
  [key: string]: T;
};

export type DataTypes = 'Job' | 'Label' | 'Role' | 'UserProfile' | 'Company' |
  'Post' | 'DetailedPost' | 'Supervision' | 'Disponibility' | 'File' |
  'JobForCompany' | 'LabelForCompany' | 'Candidate' | 'Mission' |
  'Establishments'| 'DatePost' ; //..

//just to indicate
export type Ref<T> = number;

export type Job = {
  id: Ref<Job>;
  name: string;
};

export type Role = {
  id: Ref<Role>;
  name: string;
};

export type Label = {
  id: Ref<Label>;
  name: string;
};

export interface User {
  id: Ref<User>;
  email: string;
  username: string;
  company: Ref<Company>;
  firstName: string;
  lastName: string;
  proposer: string;
  cellPhone: string;
};

export interface Company {
  id: Ref<Company>;
  name: string;
  role: Ref<Role>;
  siret: string;
  address: string;
  activity: string;
  ntva: string;
  capital: string;
  revenue: number;
  logo: any;
  stars: string;
  companyPhone: string;
  webSite: string;
  jobs: Ref<JobForCompany>[];
  labels: Ref<LabelForCompany>[];
  files: Ref<File>[];
  posts: Ref<Post>[];
  availabilities: Ref<Disponibility>[];
  unity: string;
  amount: number;
};

export interface PostDetail {
  id: Ref<PostDetail>;
  content: string;
  supervisions: Ref<Supervision>[];
};

export interface Supervision {
  id: Ref<Supervision>;
  author: string;
  date: string;
  comment: string;
  files: Ref<File>[];
}

export interface Disponibility {
  id: Ref<Disponibility>;
  date: string;
  nature: string;
};

export interface File {
  id: Ref<File>;
  nature: string;
  name: string;
  ext: string;
  expirationDate: string;
  timestamp: number;
  content: string;
};

export interface JobForCompany {
  id: Ref<JobForCompany>;
  job: Ref<Job>;
  number: number;
};

export interface LabelForCompany {
  id: Ref<LabelForCompany>;
  label: Ref<Label>;
  date: string;
};

export interface Post {
  id: Ref<Post>;
  company: Ref<Company>;
  job: Ref<Job>;
  numberOfPeople: number;
  address: string;
  latitude: number;
  longitude: number;
  contactName: string;
  draft: boolean;
  manPower: number;
  dueDate: string;
  startDate: string;
  endDate: string;
  hourlyStart: string;
  hourlyEnd: string;
  amount: number;
  currency: string;
  unitOfTime: string;
  counterOffer: number;
  description: string;
  details: Ref<PostDetail>[];
  files: Ref<File>[];
  candidates: Ref<Candidate>[];
  dates: Ref<PostDate>[];
};

export interface Candidate {
  id: Ref<Candidate>;
  company: Ref<Company>;
};

export interface Establishement {
  id: Ref<Establishement>;
  name: string;
  address: string;
  principalActivity: string;
  siret: string;
  NTVAI: string;
};

export type Mission = Omit<Post, 'applications'>;

export type PostDate = {
  id: Ref<PostDate>;
  name: string;
}

export type Interface<K extends DataTypes> =
  K extends 'Job' ? Job :
  K extends 'Label' ? Label :
  K extends 'Role' ? Role :
  K extends 'UserProfile' ? User :
  K extends 'Company' ? Company :
  K extends 'Post' ? Post :
  K extends 'DetailedPost' ? PostDetail :
  K extends 'Supervision' ? Supervision :
  K extends 'Disponibility' ? Disponibility :
  K extends 'File' ? File :
  K extends 'JobForCompany' ? JobForCompany :
  K extends 'LabelForCompany' ? LabelForCompany :
  K extends 'Candidate' ? Candidate :
  K extends 'Mission' ? Mission :
  K extends 'DatePost' ? PostDate :
  K extends 'Establishments' ? Establishement :
  K;

export type Profile = {
  user: User | null;
  company: Company;
}