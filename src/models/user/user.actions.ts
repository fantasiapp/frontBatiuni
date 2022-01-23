import { FormGroup } from "@angular/forms";
import { FileUI, FileUIOutput } from "src/app/shared/components/filesUI/files.ui";
import { PropertyTrap } from "src/common/classes";
import { getDirtyValues } from "src/common/functions";
import { JobForCompanyRow, JobRow, LabelForCompanyRow, LabelRow, UserProfileRow } from "../data/data.model";

export class ChangeProfileType {
  static readonly type = '[User] Change Profile Type';
  constructor(public type: boolean) {};
};

export class ChangeProfilePicture {
  static readonly type = '[User] Change Profile Picture';
  ext: string = '';
  imageBase64: string = '';
  expirationDate: string = '31-02-2022';
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
  
  //for now we mark job as dirty, but we should take it directly from the form
  constructor({profile, form}: {profile: UserProfileRow, form: FormGroup}) {    
    const changes = getDirtyValues(form);
    if ( Object.keys(changes).length == 0 ) return;

    const jobs = changes['Userprofile.Company.JobForCompany'],
      labels = changes['Userprofile.Company.LabelForCompany'];
    
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

    const proxy = new Proxy(this, PropertyTrap);
    //write directly on this object
    proxy['Userprofile.id'] = profile.id;
    for ( const [field, value] of Object.entries<any>(changes) ) 
      proxy[field] = value;
    
    console.log(this);
  }
};

export class GetImage {
  static readonly type = '[User] Get File';
  action: string = 'loadImage';
  constructor(public id: number) { }
};


export class UploadFile {
  static readonly type = '[File] Upload';
  action = 'uploadFile';
  ext: string;
  name: string;
  nature: string;
  expirationDate: string;
  fileBase64: string;

  //tell JLW to unify formats
  constructor(src: FileUIOutput, nature: string) {
    this.fileBase64 = src.content;
    this.expirationDate = src.expirationDate;
    this.ext = src.ext;
    this.name = src.nature;
    this.nature = nature;
  }
};

export class DownloadFile {
  action = 'downloadFile';
  static readonly type = '[File] Download';
  constructor(public id: number) {}
}