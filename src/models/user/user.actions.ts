import { FormGroup } from "@angular/forms";
import { FileUIOutput } from "src/app/shared/components/filesUI/files.ui";
import { PropertyTrap } from "src/app/shared/common/classes";
import { getDirtyValues } from "src/app/shared/common/functions";
import { JobForCompanyRow, JobRow, LabelForCompanyRow, LabelRow, UserProfileRow } from "../data/data.model";

export class ChangeProfileType {
  static readonly type = '[User] Change Profile Type';
  constructor(public type: boolean) {};
};

export class ChangeProfilePicture {
  static readonly type = '[User] Change Profile Picture';
  ext: string = '';
  imageBase64: string = '';
  expirationDate: string = '2025-12-31';
  constructor(src: any, public name: string) {
    this.ext = src.format;
    this.imageBase64 = src.base64String;
  }

  action = 'changeUserImage';
};

export class ChangePassword {
  static readonly type = '[User] Change Password';
  readonly action = 'modifyPwd';
  constructor(public oldPwd: string, public newPwd: string) {}
};

export class GetUserData {
  static readonly type = '[User] Get User data';
  constructor(public token: string) {}
  readonly action = 'getUserData';
};

export class ModifyUserProfile {
  static readonly type = '[User] Change User Profile';
  readonly action = 'modifyUser';
  files: any[] = [];
  adminFiles: any = {};
  
  //for now we mark job as dirty, but we should take it directly from the form
  constructor({profile, form}: {profile: UserProfileRow, form: FormGroup}) {    
    const changes = getDirtyValues(form);
    if ( Object.keys(changes).length == 0 ) return;

    const jobs = changes['Userprofile.Company.JobForCompany'],
      labels = changes['Userprofile.Company.LabelForCompany'],
      adminFiles = changes['Userprofile.Company.admin'];
    
    if ( jobs ) {
      changes['Userprofile.Company.JobForCompany'] = Object.values<JobForCompanyRow>(jobs).map(
        ({job, number}: {job: JobRow, number: number}) => ([job.id, number])
      );
    }

    if ( labels ) {
      console.log('label:', labels, Object.values<LabelForCompanyRow>(labels));
      changes['Userprofile.Company.LabelForCompany'] = Object.values<any>(labels).map(
        ({label, fileData}: {label: LabelRow, fileData: FileUIOutput}) => ([label.id, fileData.expirationDate!])
      );

      this.files = Object.values<any>(labels).map(({fileData}: {fileData: FileUIOutput}) => fileData);
    }

    if ( adminFiles ) {
      const keys = Object.keys(adminFiles);
      for ( const key of keys ) {
        if ( !adminFiles[key].content ) continue;
        
        this.adminFiles[key] = adminFiles[key];
      }
    }

    const proxy = new Proxy(this, PropertyTrap);
    //write directly on this object
    proxy['Userprofile.id'] = profile.id;
    for ( const [field, value] of Object.entries<any>(changes) ) 
      proxy[field] = value;
  }
};

export class UploadFile {
  static readonly type = '[File] Upload';
  action = 'uploadFile';
  ext: string;
  name: string;
  nature: string;
  expirationDate: string;
  fileBase64: string;
  Post?: number;

  //tell JLW to unify formats
  constructor(src: FileUIOutput, nature: string, name?: string) {
    this.fileBase64 = src.content;
    this.expirationDate = src.expirationDate;
    this.ext = src.ext;
    this.name = name || src.nature;
    this.nature = nature;
  }
};

export class DownloadFile {
  action = 'downloadFile';
  static readonly type = '[File] Download';
  constructor(public id: number) {}
};

export class DeletePost {
  static readonly type = '[User.PME] Delete Post';
  action = 'deletePost';
  constructor(public id: number) { }
};

export class UploadPost {
  static readonly type = '[User.PME] Create Post';
  action = 'uploadPost';

  private constructor(
    public address: string,
    public Job: number,
    public numberOfPeople: number,
    public dueDate: string,
    public startDate: string,
    public endDate: string,
    public manPower: boolean,
    public counterOffer: boolean,
    public hourlyStart: string,
    public hourlyEnd: string,
    public currency: string,
    public description: string,
    public amount: number,
    public DetailedPost: string[],
    public files: any,
    public draft: boolean,
    public id?:number
  ) {
    if ( this.id ) this.action = 'modifyPost';
    console.log('sending', this);
  };

  static fromPostForm(value: any, draft: boolean, id?: number) {
    const documents = value.documents.filter((doc: any) => doc.fileData.content),
      added = value.addedDocuments.filter((doc: any) => doc.fileData.content),
      allDocs = [...documents, ...added];

    const files: any = {};
    allDocs.forEach(doc => {
      files[doc.name] = doc.fileData;
    });
    
    return new UploadPost(
      value.address,
      value.job?.[0]?.id || 0,
      value.numberOfPeople,
      value.dueDate,
      value.startDate,
      value.endDate,
      value.manPower == "true",
      value.counterOffer,
      value.hourlyStart,
      value.hourlyEnd,
      value.currency?.[0]?.name || '$',
      value.description,
      value.amount,
      value.detailedPost.map((detail: any) => detail.description),
      files,
      draft,
      id
    );
  }
};

export class SwitchPostType {
  static readonly type = '[User.PME] Switch Post Type';
  action = 'switchDraft';
  constructor(public id: number) {}
};

export class DuplicatePost {
  static readonly type = '[User.PME] Duplicate Post';
  action = 'duplicatePost';
  constructor(public id: number) {}
};