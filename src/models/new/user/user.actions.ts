import { FormGroup } from "@angular/forms";
import { FileUIOutput } from "src/app/shared/components/filesUI/files.ui";
import { PropertyTrap } from "src/app/shared/common/classes";
import { getDirtyValues } from "src/app/shared/common/functions";
import { DataTypes, Post, PostDetail, Profile, Mission } from "../data.interfaces";
import { CalendarUI, DayState } from "src/app/shared/components/calendar/calendar.ui";
import { availabilityToName } from "../data.mapper";
import { ApplyForm } from "src/app/mobile/ui/annonce-resume/annonce-resume.ui";

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

export class UploadImageSupervision {
  static readonly type = '[User] Upload Supervision Picture';
  ext: string = '';
  imageBase64: string = '';
  constructor(src: any, public missionId:number | null, public taskId:number | null) {
    this.ext = src.format;
    this.imageBase64 = src.base64String;
  }
  action = 'uploadImageSupervision';
};

export class ChangePassword {
  static readonly type = '[User] Change Password';
  readonly action = 'modifyPwd';
  constructor(public oldPwd: string, public newPwd: string) {}
};

export class GetUserData {
  static readonly type = '[Data] Get User data';
  constructor(public token: string) {}
  readonly action = 'getUserData';
};

export class ModifyUserProfile {
  static readonly type = '[User] Change User Profile';
  readonly action = 'modifyUser';
  onlyFiles?: boolean = false;
  labelFiles: any[] = [];
  adminFiles: any = {};
  
  //for now we mark job as dirty, but we should take it directly from the form
  constructor({profile, form}: {profile: Profile, form: FormGroup}) {    
    const changes = getDirtyValues(form);
    if ( Object.keys(changes).length == 0 ) return;

    const jobsForm = changes['UserProfile.Company.JobForCompany'],
      labelsForm = changes['UserProfile.Company.LabelForCompany'],
      adminFiles = changes['UserProfile.Company.admin'];
    
    if ( jobsForm ) {
      changes['UserProfile.Company.JobForCompany'] = Object.values<any>(jobsForm).map(
        ({job, number}) => ([job.id, number])
      );
    }

    if ( labelsForm ) {
      changes['UserProfile.Company.LabelForCompany'] = Object.values<any>(labelsForm).map(
        ({label, fileData}) => ([label.id, fileData.expirationDate!])
      );

      this.labelFiles = Object.values<any>(labelsForm).map(({fileData}: {fileData: FileUIOutput}) => fileData);
    }

    if ( adminFiles ) {
      const keys = Object.keys(adminFiles);
      for ( const key of keys ) {
        if ( !adminFiles[key].content ) continue;
        
        this.adminFiles[key] = adminFiles[key];
      }

      delete changes['UserProfile.Company.admin']; 
    }

    if ( Object.keys(changes).length == 0 )
      this.onlyFiles = true;
    
    const proxy = new Proxy(this, PropertyTrap);
    //write directly on this object
    proxy['UserProfile.id'] = profile.user!.id;
    for ( const [field, value] of Object.entries<any>(changes) ) 
      proxy[field] = value;
  }
};

export class UploadFile<K extends DataTypes = any> {
  static readonly type = '[File] Upload';
  action = 'uploadFile';
  ext: string;
  name: string;
  nature: string;
  expirationDate: string;
  fileBase64: string;
  companyFile: boolean = true;
  category?: K;
  assignedId?: number = -1;

  //tell JLW to unify formats
  constructor(src: FileUIOutput, nature: string, name?: string, category?: K) {
    this.fileBase64 = src.content;
    this.expirationDate = src.expirationDate;
    this.ext = src.ext;
    this.name = name || src.nature;
    this.nature = nature;
    if ( category ) {
      this.category = category;
      (this as any)[category] = -1;
    };
  }

  get target() { return (this as any)[this.category]; }
  set target(x: number) { (this as any)[this.category] = x; }
};

export class TakePicture<K extends DataTypes = any> {
  static readonly type = '[File] take Picture';
  ext: string = '';
  fileBase64: string = '';
  expirationDate: string = '2025-12-31';
  assignedId?: number = -1;
  constructor(src: any, public name: string, public nature: string) {
    this.fileBase64 = src.base64String;
    this.expirationDate = ''
    this.ext = src.format;
    this.name = name
    this.nature = nature
  }

  action = 'takePicture';
};

export class DeleteFile {
  static readonly type = '[File] Delete';
  action = 'deleteFile';
  companyFile: boolean = true;

  constructor(public id: number) {}
};

export class DownloadFile {
  action = 'downloadFile';
  static readonly type = '[File] Download';
  get companyFile() {return true;};
  constructor(public id: number, public notify: boolean = false) {}
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
    public DatePost: string[],
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
    public id?:number,
  ) {
    if ( this.id ) this.action = 'modifyPost';
    else delete this['id'];
  };

  static fromPostForm(value: any, draft: boolean, id?: number) {
    const documents: {fileData: File, name: string}[] = value.documents.filter((doc: any) => doc.fileData.content);

    const files: any = {};
    documents.forEach(doc => {
      files[doc.name] = doc.fileData;
    });
    console.log("fromPostForm", value.calendar)
    
    return new UploadPost(
      value.address,
      value.job?.[0]?.id || 0,
      value.numberOfPeople,
      value.dueDate,
      value.calendar.map((day: DayState) => day.date),
      typeof value.manPower == 'boolean' ? value.manPower : (value.manPower == "true"),
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

export class ModifyAvailability {
  static readonly type = '[User.ST] Modify Disponibility';
  action = 'modifyDisponibility';

  constructor(public disponibility: [string, string][]) {
  }

  static fromCalendar(calendar: CalendarUI) {
    return new ModifyAvailability(calendar.value!.map(
      day => [day.date, availabilityToName(day.availability)]
    ));
  }
};

export class ApplyPost {
  static readonly type = '[User.ST] Apply Post';
  action = 'applyPost';
  amount: number;
  devis: string;
  constructor(public Post: number, form: ApplyForm) {
    this.amount = form.amount;
    this.devis = form.devis;
  }
}

export class CandidateViewed {
  static readonly type = 'declare Candidate Viewed';
  action = 'candidateViewed';
  constructor(public candidateId: number) {}
}

export class GetGeneralData {
  static readonly type = '[Data] Get General data';
  action = 'getGeneralData';
};

export class HandleApplication {
  static readonly type = '[Data] Handle Application';
  action = 'handleCandidateForPost';
  
  constructor(public Candidate: number, public post: Post, public response: boolean) {}
};

export class SignContract {
  static readonly type = '[Data] Sign Contract';
  action = 'signContract';
  constructor(public missionId: number, public view: 'ST' | 'PME') {}
};

export class CreateDetailedPost {
  static readonly type = '[Data] Create DetailedPost';
  action = 'createDetailedPost';
  constructor(public missionId: number, public content: string, public date: string) {
  }
}

export class ModifyDetailedPost {
  static readonly type = '[Data] Modify DetailedPost';
  action = 'modifyDetailedPost';
  constructor(public detailedPost: PostDetail | null) {
  }
}

export class ModifyMissionDate {
  static readonly type = '[Data] modify date Mission';
  action = 'modifyMissionDate'
  constructor(public missionId: number, public hourlyStart:string, public hourlyEnd:string, public calendar:string[]) {
  }
}

export class CloseMission {
  static readonly type = '[Data] set stars and comments';
  action = 'closeMission'
  constructor(public missionId: number, public qualityStars:number, public qualityComment:string, public securityStars:number, public securityComment:string, public organisationStars:number, public organisationComment:string) {
  }
}

export class CloseMissionST {
  static readonly type = '[Data] set stars and comments';
  action = 'closeMissionST'
  constructor(public missionId: number, public vibeSTStars:number, public vibeSTComment:string, public securitySTStars:number, public securitySTComment:string, public organisationSTStars:number, public organisationSTComment:string) {
  }
}

export class CreateSupervision {
  static readonly type = '[Data] Create Supervision';
  action = 'createSupervision'
  constructor(public missionId: number, public detailedPostId: number | null, public parentId: number | null, public comment: string, public date:string) {}
}

export class NotificationViewed {
  static readonly type = '[Data] Notification has been viewed';
  action = 'notificationViewed'
  constructor(public companyId: number, public role: string) {}
}

export class SetFavorite {
  static readonly type = '[User.ST] Set Favorite';
  action = 'setFavorite';

  constructor(public value: boolean, public Post: number) {}
}

export class InviteFriend {
  static readonly type = 'invite Friend';
  action = 'inviteFriend';

  constructor(public emailAddress: string) {}
}

export class MarkViewed {
  static readonly type = '[User.ST] View Post';
  action = 'isViewed';
  constructor(public Post: number) {}
};

// export class ContractSignature {
//   static readonly type = '[User] Contract Signature';
//   action = 'downloadContract';

//   constructor(public Mission: number) {}
// };