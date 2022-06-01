import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, Sanitizer, SimpleChanges } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { single, take } from "rxjs/operators";
import { File, Company, Profile, User } from "src/models/new/data.interfaces";
import { DataQueries, QueryProfile } from "src/models/new/data.state";
import { DownloadFile } from "src/models/new/user/user.actions";
import { Destroy$ } from "../../common/classes";
import { FileDownloader } from "../../services/file-downloader.service";
import { ImageGenerator } from "../../services/image-generator.service";
import { SingleCache } from "src/app/shared/services/SingleCache";

@Component({
  selector: 'profile-image',
  templateUrl: './profile-image.component.html',
  styleUrls: ['./profile-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIProfileImageComponent extends Destroy$ {

  image: File | null = null;
  src: SafeResourceUrl | string = '';
  color1 = "#C95555"
  color2 = "#FFD375"
  color3 = "#D2FFCB"
  color4 = "#BBEFB1"

  @QueryProfile()
  @Input()
  profile!: number | Observable<Profile> | Profile;

  @Input()
  companyId:number | null = null

  @Input()
  borders: boolean = true;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['profile']) {
      this.changePicture()
    }
  }

  changePicture(){
    (this.profile as Observable<Profile>).pipe(take(1)).subscribe(profile => {
      this.setColor(profile.company)
      if (!SingleCache.checkValueInCache("companyImage" + profile.company.id.toString())){
        this.image = this.store.selectSnapshot(DataQueries.getProfileImage(profile.company.id));
        if ( !this.image ) {
          const fullname = profile.company.name[0].toUpperCase();
          this.src = this.imageGenerator.generate(fullname);
          SingleCache.setValueByName("companyImage" + profile.company.id.toString(), this.src)
          this.cd.markForCheck();
        } else {
          this.downloader.downloadFile(this.image).subscribe(image => {
            this.src = this.downloader.toSecureBase64(image);
            SingleCache.setValueByName("companyImage" + profile.company.id.toString(), this.src)
            this.cd.markForCheck();
          });
        }}
      else {
        this.src = SingleCache.getValueByName("companyImage" + profile.company.id.toString())
        this.cd.markForCheck()
      }
    });
    
  }

  updateProfile(profile: Profile){
    this.profile = profile;
    SingleCache.deleteValueByName("companyImage" + profile.company.id.toString())
    this.changePicture()
    this.cd.markForCheck()
  }

  setColor(company:Company) {
    const colorList:{ [key: string]: string } = {"red":"#C95555", "orange":"#FFD375", "lightGreen":"#D2FFCB", "green":"#BBEFB1", "grey":"#aaa"}
    const files: (File | null)[] = company.files?.map(fileId => this.store.selectSnapshot(DataQueries.getById('File', fileId)))
    const filesName = files.map(file => {
      if (file) {
        return file.name
      }
      return null
    })
    const checkFile = ["URSSAF", "Kbis", "Trav Dis", "Impôts", "Congés Payés"].map(name => filesName.includes(name))
    const filesNature = files.map(file => {
      if (file) {
        return file.nature
      }
      return null
    })
    const levelStart = company.amount && company.address && company.companyPhone && company.siret && company.jobs
    let step = "start"
    if (levelStart) {
      step = "beginner"
    }
    if (filesNature.includes("labels")) {
      step = "label"
    }
    if (levelStart && filesNature.includes("labels")) {
      step = "medium"
    }
    if (levelStart && !checkFile.includes(false)) {
      step = "advanced"
    }
    if (levelStart && !checkFile.includes(false) && filesNature.includes("labels")) {
      step = "completed"
    }

    if (step == "start") {
      this.color1 = colorList.grey
      this.color2 = colorList.grey
      this.color3 = colorList.red
      this.color4 = colorList.grey
      
    } else if (step == "beginner") {
      this.color1 = colorList.grey
      this.color2 = colorList.grey
      this.color3 = colorList.orange
      this.color4 = colorList.orange
    
    } else if (step == "label") {
      this.color1 = colorList.grey
      this.color2 = colorList.lightGreen
      this.color3 = colorList.red
      this.color4 = colorList.grey

    } else if (step == "medium") {
      this.color1 = colorList.grey
      this.color2 = colorList.lightGreen
      this.color3 = colorList.orange
      this.color4 = colorList.orange

    } else if (step == "advanced") {
      this.color1 = colorList.green
      this.color2 = colorList.grey
      this.color3 = colorList.green
      this.color4 = colorList.green

    } else if (step == "completed") {
      this.color1 = colorList.green
      this.color2 = colorList.lightGreen
      this.color3 = colorList.green
      this.color4 = colorList.green
    }
  }
  
  constructor(private cd: ChangeDetectorRef, private store: Store, private imageGenerator: ImageGenerator, private downloader: FileDownloader) {
    super();
  }

};