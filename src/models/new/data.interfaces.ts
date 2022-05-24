export type Record<T = any> = {
  [key: string]: T;
};

export type DataTypes = 'Job' | 'Label' | 'Role' | 'UserProfile' | 'Company' |
  'Post' | 'DetailedPost' | 'Supervision' | 'Disponibility' | 'File' |
  'JobForCompany' | 'LabelForCompany' | 'Candidate' | 'Mission' |
  'Establishments'| 'DatePost' | 'Notification' ; //..

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
  function: string;
  tokenFriend: string;
  favoritePosts: Ref<Post>[];
  viewedPosts: Ref<Post>[];
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
  starsST: string;
  starsPME: string;
  latitude: number;
  longitude: number;
  companyPhone: string;
  email: string;
  webSite: string;
  jobs: Ref<JobForCompany>[];
  labels: Ref<LabelForCompany>[];
  files: Ref<File>[];
  posts: Ref<Post>[];
  missions: Ref<Mission>[];
  availabilities: Ref<Disponibility>[];
  unity: string;
  amount: number;
  saturdayDisponibility: boolean
  allQualifications : boolean
  Notification: Ref<Notification>[]
};

export interface PostDetail {
  id: Ref<PostDetail>;
  date: string;
  content: string;
  validated : boolean;
  refused : boolean;
  supervisions: Ref<Supervision>[];
};

export interface Supervision {
  id: Ref<Supervision>;
  author: string;
  companyId: number;
  date: string;
  comment: string;
  files: Ref<File>[];
  // Supervisions: Ref<Supervision>[];
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
  manPower: boolean;
  dueDate: string;
  startDate: string;
  endDate: string;
  hourlyStart: string;
  hourlyStartChange:string;
  hourlyEnd: string;
  hourlyEndChange: string;
  amount: number;
  currency: string;
  unitOfTime: string;
  counterOffer: boolean;
  description: string;
  details: Ref<PostDetail>[];
  files: Ref<File>[];
  candidates: Ref<Candidate>[];
  dates: Ref<PostDate>[];
  boostTimestamp: number;
};

export interface Candidate {
  id: Ref<Candidate>;
  company: Ref<Company>;
  contact:string
  amount: number;
  devis: string;
  isChoosen : boolean;
  isRefused : boolean;
  isViewed: boolean
};

export interface Establishement {
  id: Ref<Establishement>;
  name: string;
  address: string;
  principalActivity: string;
  siret: string;
  NTVAI: string;
};

export type Notification = {
  id: Ref<Notification>
  company: Ref<Company>
  subContractor: Ref<Company>
  posts: Ref<Post>
  missions: Ref<Mission>
  role: string
  timestamp: number
  content: string
  hasBeenViewed: boolean
  nature: string
};

export type Mission = Post & {
  subContractor: Ref<Company>;
  subContractorContact: string;
  subContractorName: string;
  signedByCompany: boolean;
  signedBySubContractor: boolean;

  quality: number;
  qualityComment: string;
  security: number;
  securityComment: string;
  organisation: number;
  organisationComment: string;

  vibeST: number;
  vibeCommentST: string;
  securityST: number;
  securityCommentST: string;
  organisationST: number;
  organisationCommentST: string;

  isClosed: boolean;
  contract: Ref<File>;
  supervisions: Ref<Supervision>[]
};

export type PostDate = {
  id: Ref<PostDate>;
  date: string;
  validated: boolean;
  deleted: boolean
};

export type Task = PostDetail & {
  validationImage:string,
  invalidationImage:string
  supervisionsObject: Supervision[]
}

export type DateG = {
  id: number
  value: string
  tasks: Task[] | null
  selectedTasks: Task[]
  taskWithoutDouble: Task[]
  view: 'ST' | 'PME';
  supervisions: Supervision[]
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
  K extends 'Notification' ? Notification :
  K;

export type Profile = {
  user?: User | null;
  company: Company;
}

export class PostMenu<T extends Post | Mission = Post> {
  open: boolean = false;
  post: T | null = null;
  swipeup: boolean = false;
  swipeupCloseMission: boolean = false;
  favorite: boolean = false;

  get candidates() { return this.post?.candidates || []; }

  isBoosted(time: number) { 
    if (this.post?.boostTimestamp) {
      return this.post?.boostTimestamp >= time || false
    }
    return false;
  }
};