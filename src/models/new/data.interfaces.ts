import { Observable } from "rxjs";
import { DataTypes } from "./data.state";

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
  Post: Ref<Post>[];
  availabilities: Ref<Availability>[];
};

export interface PostDetail {
  id: Ref<PostDetail>;
  content: string;
  supervisions: Ref<Supervision>[];
};

export interface Supervision {
  id: Ref<Supervision>;
  //???
}

export interface Availability {
  id: Ref<Availability>;
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
  draft: string;
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
  applications: Ref<JobApplication>[];
};


export interface JobApplication {
  id: Ref<JobApplication>;
  company: Company;
};

export type Mission = Omit<Post, 'applications'>;

export type Interface<K extends DataTypes> =
  K extends 'Job' ? Job :
  K extends 'Label' ? Label :
  K extends 'Role' ? Role :
  K extends 'UserProfile' ? User :
  K extends 'Company' ? Company :
  K extends 'Post' ? Post :
  K extends 'DetailedPost' ? PostDetail :
  K extends 'Supervision' ? Supervision :
  K extends 'Disponibility' ? Availability :
  K extends 'File' ? File :
  K extends 'JobForCompany' ? JobForCompany :
  K extends 'LabelForCompany' ? LabelForCompany :
  K extends 'JobApplication' ? JobApplication :
  K extends 'Mission' ? Mission :
  K;

export type Profile = {
  user: User | null;
  company: Company;
}