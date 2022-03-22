import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { Profile, File } from "src/models/new/data.interfaces";
import { DataQueries, DataState } from "src/models/new/data.state";
import { ChangeProfileType } from "src/models/new/user/user.actions";

@Component({
  selector: 'profile-resume',
  templateUrl: './profile-resume.component.html',
  styleUrls: ['./profile-resume.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileResume {

  constructor(private store: Store) {}

  @Input()
  profile!: Profile;  

  @Select(DataState.view)
  view$!: Observable<string>;

  @Input()
  switch: boolean = true;

  @Input()
  showMore: boolean = false;

  @Input()
  star: boolean = true;

  @Input()
  canChangePicture: boolean = false;

  @Output()
  ratingsClicked = new EventEmitter();

  @Output()
  changePicture = new EventEmitter();

  changeProfileType(type: boolean) {
    this.store.dispatch(new ChangeProfileType(type));
  }
  color1 = "#C95555"
  color2 = "#FFD375"
  color3 = "#D2FFCB"
  color4 = "#BBEFB1"

  ngOnChanges() {
    const colorList:{ [key: string]: string } = {"red":"#C95555", "orange":"#FFD375", "lightGreen":"#D2FFCB", "green":"#BBEFB1", "grey":"#aaa"}
    console.log("profile", this.profile)
    const user = this.profile.user!
    const company = this.profile.company
    const files: (File | null)[] = company.files.map(fileId => this.store.selectSnapshot(DataQueries.getById('File', fileId)))
    const filesName = files.map(file => {
      if (file) {
        return file.name
      }
      return null
    })
    const checkFile = ["URSSAF", "Kbis", "Trav. Dis", "Impôts", "Congés Payés"].map(name => filesName.includes(name))
    const filesNature = files.map(file => {
      if (file) {
        return file.nature
      }
      return null
    })
    const levelStart = user.firstName && user.lastName && company.amount && company.address && company.companyPhone && company.siret && company.jobs
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
    console.log("color", this.color1, this.color2, this.color3, this.color4)
  }

};