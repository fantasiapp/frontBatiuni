import { ThrowStmt } from "@angular/compiler";
import {  ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngxs/store";
import { interval, race } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { Recommandation } from "src/models/new/data.interfaces";
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

  hasSentRecommandation: boolean = false;
  recommandation: Recommandation = {
    id:-1,
    firstName: "",
    lastName: "",
    company: "",
    idCompany : this.companyId,
    qualityStars : 0,
    qualityComment : "",
    securityStars : 0,
    securityComment : "",
    organisationStars : 0,
    organisationComment : ""
  };

  constructor(private store: Store, private cd: ChangeDetectorRef, private route: ActivatedRoute) {
    super();
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

  getCompanyInfoByText(nature: string) {
    if (nature == "lastName") {
      let content = document.getElementById(
        "textLastName"
      ) as HTMLTextAreaElement;
      this.recommandation!.lastName = content!.value;
    } else if (nature == "firstName") {
      let content = document.getElementById(
        "textFirstName"
      ) as HTMLTextAreaElement;
      this.recommandation!.firstName = content!.value;
    } else if (nature == "companyName") {
      let content = document.getElementById(
        "textCompanyName"
      ) as HTMLTextAreaElement;
      this.recommandation!.company = content!.value;
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
    if (this.hasGeneralStars){
      console.log('coucou je note')
      this.store.dispatch(new GiveRecommandation(
            this.recommandation!.idCompany,
            this.recommandation!.firstName,
            this.recommandation!.lastName,
            this.recommandation!.company,
            this.recommandation!.qualityStars,
            this.recommandation!.qualityComment,
            this.recommandation!.securityStars,
            this.recommandation!.securityComment,
            this.recommandation!.organisationStars,
            this.recommandation!.organisationComment
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