import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  ViewChild,
} from "@angular/core";
import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
import { PopupService } from "src/app/shared/components/popup/popup.component";
import {
  CloseMission,
  ModifyMissionDate,
  DuplicatePost,
} from "src/models/new/user/user.actions";
import {
  Company,
  Mission,
  PostMenu,
  PostDetail,
  PostDetailGraphic,
  Profile,
  Supervision,
  Task,
  DatePost,
  PostDateAvailableTask,
} from "src/models/new/data.interfaces";
import { DataQueries, DataState } from "src/models/new/data.state";
import {
  CalendarUI,
  DayState,
} from "src/app/shared/components/calendar/calendar.ui";

// export type Task = PostDetail & {validationImage:string, invalidationImage:string}

// , validationImage:"assets/suivi-valider.svg", invalidationImage:"assets/suivi-refuser.svg"

@Component({
  selector: "suivi-chantier",
  templateUrl: "suivi-pme.page.html",
  styleUrls: ["suivi-pme.page.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuiviPME {
  company: Company | null = null;
  subContractor: Company | null = null;
  track: { [key: string]: Map<PostDetail, Supervision[]> } = {};
  isNotSigned: boolean = true;
  isNotSignedByUser: boolean = true;
  dates: PostDateAvailableTask[] = [];
  datesNew: PostDateAvailableTask[] = []
  currentDateId: number | null = null;
  tasks: Task[] | null = null;
  companyName: string = "";
  contactName: string = "";
  view: "ST" | "PME" = "PME";
  mission: Mission | null = null;
  swipeupModifyDate: boolean = false;
  alert: string = "";

  _missionMenu: PostMenu<Mission> = new PostMenu<Mission>();
  get missionMenu() {
    return this._missionMenu;
  }
  
  calendarForm = new FormControl([])
  AdFormDate = new FormGroup({
    hourlyStart: new FormControl("07:00"),
    hourlyEnd: new FormControl("17:30:00"),
    calendar: this.calendarForm
  });

  @Input()
  set missionMenu(mM: PostMenu<Mission>) {
    this._missionMenu = mM;
    const mission = mM.post;
    this.view = this.store.selectSnapshot(DataState.view);
    this.mission = mission;
    this.company = mission ? this.store.selectSnapshot(DataQueries.getById("Company", mission.company)) : null;
    this.subContractor = mission
      ? this.store.selectSnapshot(
          DataQueries.getById("Company", mission.subContractor)
        )
      : null;
    if (mission) {
      this.isNotSigned = !(
        mission.signedByCompany && mission.signedBySubContractor
      );
      this.isNotSignedByUser =
        (!mission.signedByCompany && this.view == "PME") ||
        (!mission.signedBySubContractor && this.view == "ST");
      this.computeDates(mission);
      this.companyName =
        this.view == "ST" ? this.company!.name : this.subContractor!.name;
      this.contactName =
        this.view == "ST" ? "" : this.mission!.subContractorContact ;
    }
    if (mission) this.updateDate(mission!);
  }

  updateDate(mission: Mission) {
    this.AdFormDate.get("hourlyStart")?.setValue(mission.hourlyStart);
    this.AdFormDate.get("hourlyEnd")?.setValue(mission.hourlyEnd);

    let daystates: DayState[] = [];
    if (typeof mission!.dates === "object" && !Array.isArray(mission.dates))
      daystates = Object.values(mission.dates).map((date) => {
        return { date: date as string, availability: "selected" };
      });
    else
      daystates = this.store
        .selectSnapshot(DataQueries.getMany("DatePost", mission.dates))
        .map((date) => ({ date: date.date, availability: "selected" }));

    this.AdFormDate.get("calendar")?.setValue(daystates);
    this.calendar?.viewCurrentDate();
  }

  @Input() callBackParent: (b: boolean, type: string) => void = (
    b: boolean,
    type: string
  ): void => {};
  @Input() toogle: boolean = false;

  @ViewChild(CalendarUI, { static: false }) calendar!: CalendarUI;

  constructor(
    private store: Store,
    private popup: PopupService,
    private cd: ChangeDetectorRef
  ) {}

  // computeDates(mission: Mission) {
  //   let supervisionsTaks: number[] = [];
  //   this.tasks = this.store
  //     .selectSnapshot(DataQueries.getMany("DetailedPost", mission.details))
  //     ?.map((detail) => ({
  //       id: detail.id,
  //       date: detail.date,
  //       content: detail.content,
  //       validated: detail.validated,
  //       refused: detail.refused,
  //       supervisions: detail.supervisions,
  //       supervisionsObject: this.computeSupervisionsforTask(detail.supervisions,supervisionsTaks),
  //       validationImage: SuiviPME.computeTaskImage(detail, "validated"),
  //       invalidationImage: SuiviPME.computeTaskImage(detail, "refused"),
  //     }));
  //   let dates = mission.dates;
  //   if (typeof mission.dates === "object" && !Array.isArray(mission.dates))
  //     dates = Object.keys(mission.dates).map((key) => +key as number);
  //   this.dates = dates?.map((value: number, id) => {
  //     let dateObject: PostDate = this.store.selectSnapshot(DataQueries.getById("DatePost", value))!;

  //     let supervisionId = dateObject.supervisions;
  //     if (typeof supervisionId === "object" && !Array.isArray(supervisionId))
  //       supervisionId = Object.keys(supervisionId).map((key) => +key as number);

  //     let supervision = this.store.selectSnapshot(DataQueries.getMany("Supervision", supervisionId))
  //     return {
  //       id: id,
  //       date: dateObject,
  //       tasks: this.tasks,
  //       selectedTasks: this.computeSelectedTask(dateObject.date),
  //       taskWithoutDouble: this.dateWithoutDouble(),
  //       view: this.view,
  //       supervisions: supervision,
  //     } as DateG;
  //   })
  //   this.dates.sort((date1:DateG, date2:DateG) => {return date1.date.date > date2.date.date ? 1 : -1})
  // }

  computeDates(mission: Mission) {
    let dates:DatePost[] = []
    if (typeof (mission.dates) === "object" && !Array.isArray(mission.dates)) dates = mission.dates
    else dates = this.store.selectSnapshot(DataQueries.getMany("DatePost", mission.dates))
    const allPostDetails = this.computeAllPostDetails(mission.details)
    this.dates = dates.map((date) => {
      const [supervisions, postDetail] = this.computeFieldOfDate(date)
      return {
        "id":date.id,
        "date": date.date,
        "validated":date.validated,
        "deleted":date.deleted,
        "supervisions":supervisions,
        "postDetails":postDetail,
        "allPostDetails":allPostDetails
      } as unknown as PostDateAvailableTask
    })
  }

  computeFieldOfDate(date:DatePost) {
    let supervisions:Supervision[] = []
    let postDetails:PostDetail[] = []
    let avaliableDetails:PostDetail[] = []
    if (typeof(date.supervisions) === "object" && !Array.isArray(date.supervisions))
      supervisions = Object.values(date.supervisions) as Supervision[]
    else
      supervisions = this.store.selectSnapshot(DataQueries.getMany("Supervision", date.supervisions))
      console.log("supervisions", supervisions, date.supervisions)

    if (typeof(date.details) === "object" && !Array.isArray(date.details))
      postDetails = Object.values(date.details)
    else
      postDetails = this.store.selectSnapshot(DataQueries.getMany("DetailedPost", date.details))

    let postDetailsGraphic = postDetails.map((postDetail) => {
      let supervisions:Supervision[]
      if ((typeof(postDetail.supervisions) === "object") && !Array.isArray(postDetail.supervisions)) {
        supervisions = Object.values(postDetail.supervisions) as unknown as Supervision[]
      } else {
        supervisions = this.store.selectSnapshot(DataQueries.getMany("Supervision", postDetail.supervisions as unknown as number[]))
      }
      return {
        "id": postDetail.id,
        "date": postDetail.date,
        "content": postDetail.content,
        "validated": postDetail.validated,
        "refused": postDetail.refused,
        "supervisions": supervisions,
      } as PostDetailGraphic
    })
    return [supervisions, postDetailsGraphic, avaliableDetails]
  }

  computeAllPostDetails(details:any[]) {
    let avaliableTasks: PostDetail[] = []
    if (typeof(details) === "object" && !Array.isArray(details)) avaliableTasks = details
    else avaliableTasks = this.store.selectSnapshot(DataQueries.getMany("DetailedPost", details))
    return avaliableTasks
    }

  // computeSupervisionsforTask(
  //   supervisionsId: number[],
  //   supervisionsTask: number[]
  // ) {
  //   let supervisions: Supervision[] = [];
  //   supervisionsId.forEach((id) => {
  //     let supervision = this.store.selectSnapshot(
  //       DataQueries.getById("Supervision", id)
  //     );
  //     if (supervision) {
  //       supervisions.push(supervision!);
  //       supervisionsTask.push(supervision.id);
  //     }
  //   });
  //   return supervisions;
  // }

  // computeSupervisionsForMission(date: string, supervisionsTask: number[]): Supervision[] {
  //   let supervisions: Supervision[] = [];
  //   // console.log('supervision', this.mission);
  //   let allSupervisions: (Supervision | null)[] = this.mission!.supervisions.map((id) => {
  //       // console.log('supervision', id);
  //       let supervision = this.store.selectSnapshot(DataQueries.getById("Supervision", id));
  //       // console.log('apresDAtaqiurei');
  //       if (
  //         supervision &&
  //         supervision.date == date &&
  //         !supervisionsTask.includes(supervision.id)
  //       ) {
  //         return supervision;
  //       }
  //       return null;
  //     });
  //   for (let index in allSupervisions) {
  //     if (allSupervisions[index]) {
  //       supervisions.push(allSupervisions[index]!);
  //     }
  //   }
  //   return supervisions;
  // }

  // dateWithoutDouble(): Task[] {
  //   return this.tasks!.filter((task) => !task.date);
  // }

  // computeSelectedTask(date: string) {
  //   let selectedTask: Task[] = [];
  //   this.tasks?.forEach((task) =>
  //     this.computeSelectedTaskAction(selectedTask, date, task)
  //   );
  //   return selectedTask;
  // }

  // computeSelectedTaskAction(selectedTask: Task[], date: string, task: Task) {
  //   if (date == task.date) {
  //     selectedTask.push(task);
  //   }
  // }

  closeMission() {
    if (this.mission!.subContractor && !this.mission!.isClosed) {
      const company = this.store.selectSnapshot(
        DataQueries.getById("Company", this.mission!.subContractor)
      );
      this.popup.openCloseMission(company!, this);
    }
    this.callBackParent(false, "menu");
    this.cd.markForCheck();
  }

  openCloseMission() {
    this.callBackParent(true, "closeMission");
    this.getArrayStar("quality");
    this.cd.markForCheck();
  }

  starAction(index: number, nature: string) {
    if (nature == "quality") this.mission!.quality = index + 1;
    if (nature == "security") this.mission!.security = index + 1;
    if (nature == "organisation") this.mission!.organisation = index + 1;
    this.cd.markForCheck();
  }

  get hasGeneralStars() {
    return this.getArrayStar("general")[0] == true;
  }

  get classSubmit() {
    if (this.hasGeneralStars) {
      return "submitActivated";
    } else {
      return "submitDisable";
    }
  }

  textStarAction(nature: string) {
    if (nature == "quality") {
      let content = document.getElementById(
        "starTextQuality"
      ) as HTMLTextAreaElement;
      this.mission!.qualityComment = content!.value;
    } else if (nature == "security") {
      let content = document.getElementById(
        "starTextSecurity"
      ) as HTMLTextAreaElement;
      this.mission!.securityComment = content!.value;
    } else if (nature == "organisation") {
      let content = document.getElementById(
        "starTextOrganisation"
      ) as HTMLTextAreaElement;
      this.mission!.organisationComment = content!.value;
    }
  }

  getArrayStar(nature: string) {
    let array = new Array<boolean>(5);
    if (this.mission) {
      let lastStar = 0;
      if (nature == "quality") {
        lastStar = this.mission!.quality;
      } else if (nature == "security") {
        lastStar = this.mission!.security;
      } else if (nature == "organisation") {
        lastStar = this.mission!.organisation;
      } else if (nature == "general") {
        if (
          this.mission!.quality &&
          this.mission!.security &&
          this.mission!.organisation
        ) {
          lastStar = Math.round(
            (this.mission!.quality +
              this.mission!.security +
              this.mission!.organisation) /
              3
          );
        }
      }
      for (let index = 0; index < 5; index++) {
        array[index] = index < lastStar ? true : false;
      }
    }
    return array;
  }

  submitStar() {
    if (this.hasGeneralStars)
      this.store
        .dispatch(
          new CloseMission(
            this.mission!.id,
            this.mission!.quality,
            this.mission!.qualityComment,
            this.mission!.security,
            this.mission!.securityComment,
            this.mission!.organisation,
            this.mission!.organisationComment
          )
        )
        .pipe(take(1))
        .subscribe(() => {
          this._missionMenu.swipeupCloseMission = false;
          this.cd.markForCheck();
        });
  }

  @Select(DataQueries.currentProfile)
  currentProfile$!: Observable<Profile>;

  signContract() {
    console.log("sign contract")
    this.popup.openSignContractDialog(this.mission!);
  }

  reloadMission = (dateId: number): (PostDateAvailableTask | Mission)[] => {
    this.mission = this.store.selectSnapshot(
      DataQueries.getById("Mission", this.mission!.id)
    )
    const newDate = this.store.selectSnapshot(DataQueries.getById("DatePost", dateId))
    const supervisions = this.store.selectSnapshot(DataQueries.getAll("Supervision"))
    console.log("reloadMission supervision", dateId, newDate, supervisions)
    this.computeDates(this.mission!);
    console.log("reloadMission", this.dates)
    let dateNew = this.dates[0]
    this.dates.forEach((date) => {
      if (date.id === dateId) dateNew = date
    })
    console.log("dateNew", dateNew)
    return [dateNew, this.mission!]
  };

  modifyTimeTable() {
    this.missionMenu.swipeup = false;
    this.swipeupModifyDate = true;
    this.cd.markForCheck();
  }

  duplicateMission() {
    this.missionMenu.swipeup = false;
    // this.info.show("info", "Duplication en cours...", Infinity);
    this.store.dispatch(new DuplicatePost(this.mission!.id)).pipe(take(1)).subscribe(
        () => {},
        () => {
          // this.info.show("error", "Erreur lors de la duplication de l'annonce");
        }
      );
  }

  async submitAdFormDate(setup: boolean = false) {
    let datesSelected: string[] = this.calendarForm!.value.filter((day : DayState) => day.availability == 'selected').map((day: DayState) => day.date)
    let blockedDates = this.computeBlockedDate();
    let pendingDates = this.computePendingDate()

    this.alert = "";
    let dateToBeSelected: string[] = [];
    let dateToBeUnSelected: string[] = [];

    blockedDates.forEach((date) => {
      if (!datesSelected.includes(date)) {
        this.alert += `La date ${date} doit obligatoirement être sélectionnée.\r\n`;
        dateToBeSelected.push(date);
      }
    });

    pendingDates.pendingValidated.forEach((date) => {
      if(!datesSelected.includes(date)){
        this.alert += `La date ${date} est en cours de validation.\r\n`
        dateToBeSelected.push(date)
      }
    })

    pendingDates.pendingDeleted.forEach((date)=>{
      if(datesSelected.includes(date)){
        this.alert += `La date ${date} est en cours de suppression.\r\n`
        dateToBeUnSelected.push(date)
      }
    })

    dateToBeSelected.map(date => {
      if(!datesSelected.includes(date)) datesSelected.push(date)
    })

    this.setupDayState(datesSelected, dateToBeUnSelected);
    if(!setup) this.saveToBackAdFormDate()

  }

  // Reset le calendrier si on a deselectionner ou selectionner des dates bloquer
  setupDayState(dateToBeSelected: string[], dateToBeUnSelected: string[]) {
    let dayStates: DayState[] = dateToBeSelected.map((date) => {
      return { date: date, availability: "selected" };
    });

    dayStates = dayStates.filter(day => !dateToBeUnSelected.includes(day.date))
    
    this.calendarForm.setValue(dayStates);
  }

  saveToBackAdFormDate() {
    const selectedDate: string[] = this.calendarForm!.value.map(
      (dayState: DayState) => {
        return dayState.date;
      }
    );
    this.store.dispatch(new ModifyMissionDate(this.mission!.id, this.AdFormDate.get("hourlyStart")!.value, this.AdFormDate.get("hourlyEnd")!.value, selectedDate)).pipe(take(1)).subscribe(() => {
      if (!this.alert) this.swipeupModifyDate = false;
      // Update de mission et accordionData puis update la vue
      this.mission = this.store.selectSnapshot(DataQueries.getById("Mission", this.mission!.id))!;
      this.computeDates(this.mission);

      this.cd.markForCheck();
    });
  }

  computeBlockedDate(): string[] {
    if(!this.mission){
      return []
    }
    let listBlockedDate: string[] = [];
    let listDetailedPost = this.mission!.details;

    listDetailedPost.forEach((detailId) => {
      let detailDate = this.store.selectSnapshot(DataQueries.getById("DetailedPost", detailId))!;
      // si la date a une Task, la considerer bloquer
      if (detailDate && detailDate.date && !listBlockedDate.includes(detailDate.date))
        listBlockedDate.push(detailDate.date);
    });
    return listBlockedDate;
  }

  computePendingDate() :{pendingDeleted: string[], pendingValidated: string[]}{
    if(!this.mission || !this.mission.dates) return {pendingDeleted: [], pendingValidated: []}   
    let pendingDeleted: string[] = [] 
    let pendingValidated: string[] = []

    let datesId = this.mission.dates;
    if (typeof datesId === "object" && !Array.isArray(datesId))
      datesId = Object.keys(datesId).map((key) => +key as number);
    this.store.selectSnapshot(DataQueries.getMany("DatePost", datesId)).forEach(date => {
      if(date.deleted) pendingDeleted.push(date.date)
      else if (!date.validated) pendingValidated.push(date.date)
    })
    return {pendingDeleted: pendingDeleted, pendingValidated:pendingValidated}
  }
}
