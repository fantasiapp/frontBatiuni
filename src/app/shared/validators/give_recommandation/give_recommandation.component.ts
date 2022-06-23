import {  ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngxs/store";
import { interval, race } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { Company, Recommandation } from "src/models/new/data.interfaces";
import { DataQueries } from "src/models/new/data.state";
import { GiveRecommandation } from "src/models/new/user/user.actions"

@Component({
  selector: 'give_recommandation',
  templateUrl: 'give_recommandation.component.html',
  styleUrls: ['give_recommandation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GiveARecommandation extends Destroy$ {

  @Input()
  companyId: number = -1;
  companyNameRecommended: string;

  hasSentRecommandation: boolean = false;
  recommandation: Recommandation = {
    id:-1,
    firstNameRecommanding: "",
    lastNameRecommanding: "",
    companyNameRecommanding: "",
    companyRecommanded : this.companyId,
    qualityStars : 0,
    qualityComment : "",
    securityStars : 0,
    securityComment : "",
    organisationStars : 0,
    organisationComment : "",
    LastWorksiteDate: ""
  };

  userNameForm: FormGroup = new FormGroup({
    lastName: new FormControl('', [Validators.required]),
    firstName: new FormControl('', [Validators.required])
  })
  
  ngOnInit() {
    
  }

  constructor(private store: Store, private cd: ChangeDetectorRef, private route: ActivatedRoute) {
    super();
    this.companyId = this.route.snapshot.params.companyId;
    this.recommandation.companyRecommanded = this.companyId
    this.companyNameRecommended = this.route.snapshot.params.companyName
  }

  starAction(index: number, nature: string) {
    if (nature == "quality") this.recommandation!.qualityStars = index + 1;
    if (nature == "security") this.recommandation!.securityStars = index + 1;
    if (nature == "organisation") this.recommandation!.organisationStars = index + 1;
    this.cd.markForCheck();
  }

  get hasGeneralStars() {
    return this.getArrayStar("general")[0] == true;
  }

  get classSubmit() {
    if (this.hasGeneralStars && this.recommandation.companyNameRecommanding && this.recommandation.firstNameRecommanding && this.recommandation.lastNameRecommanding && this.recommandation.LastWorksiteDate) {
      return "submitActivated";
    } else {
      return "submitDisable";
    }
  }

  textStarAction(nature: string, textarea: HTMLTextAreaElement) {
    if (nature == "quality") {
      let content = document.getElementById(
        "starTextQuality"
      ) as HTMLTextAreaElement;
      this.recommandation!.qualityComment = content!.value;
    } else if (nature == "security") {
      let content = document.getElementById(
        "starTextSecurity"
      ) as HTMLTextAreaElement;
      this.recommandation!.securityComment = content!.value;
    } else if (nature == "organisation") {
      let content = document.getElementById(
        "starTextOrganisation"
      ) as HTMLTextAreaElement;
      this.recommandation!.organisationComment = content!.value;
    }
  }

  getCompanyInfoByText(nature: string, input: HTMLInputElement) {
    if (nature == "lastName") {
      this.recommandation!.lastNameRecommanding = input.value;
    } else if (nature == "firstName") {
      this.recommandation!.firstNameRecommanding = input.value;
    } else if (nature == "companyName") {
      this.recommandation!.companyNameRecommanding = input.value;
    } else if (nature == "lastWorksiteDate") {
      this.recommandation!.LastWorksiteDate = input.value;
    }
  }

  getArrayStar(nature: string) {
    let array = new Array<boolean>(5);
    if (this.recommandation) {
      let lastStar = 0;
      if (nature == "quality") {
        lastStar = this.recommandation!.qualityStars;
      } else if (nature == "security") {
        lastStar = this.recommandation!.securityStars;
      } else if (nature == "organisation") {
        lastStar = this.recommandation!.organisationStars;
      } else if (nature == "general") {
        if (
          this.recommandation!.qualityStars &&
          this.recommandation!.securityStars &&
          this.recommandation!.organisationStars
        ) {
          lastStar = Math.round(
            (this.recommandation!.qualityStars +
              this.recommandation!.securityStars +
              this.recommandation!.organisationStars) /
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

  submitRecommandation() {
    this.hasSentRecommandation =true
    if (this.hasGeneralStars){
      this.store.dispatch(new GiveRecommandation(
            this.recommandation!.companyRecommanded,
            this.recommandation!.firstNameRecommanding,
            this.recommandation!.lastNameRecommanding,
            this.recommandation!.companyNameRecommanding,
            this.recommandation!.qualityStars,
            this.recommandation!.qualityComment,
            this.recommandation!.securityStars,
            this.recommandation!.securityComment,
            this.recommandation!.organisationStars,
            this.recommandation!.organisationComment,
            this.recommandation!.LastWorksiteDate
          )
        )
        .pipe(take(1))
        .subscribe(() => {
          this.hasSentRecommandation = true
          this.cd.markForCheck();
        });
    }
  }

};