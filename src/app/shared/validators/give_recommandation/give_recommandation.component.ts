import {  ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngxs/store";
import { interval, race } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import { Destroy$ } from "src/app/shared/common/classes";
import { ConfirmAccount } from "src/models/auth/auth.actions";
import { Recommandation } from "src/models/new/data.interfaces";

@Component({
  selector: 'give_recommandation',
  templateUrl: 'give_recommandation.component.html',
  styleUrls: ['give_recommandation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GiveRecommandation extends Destroy$ {

  recommandation: Recommandation = {
    id:-1,
    firstName: "",
    lastName: "",
    company: "",
    idCompany : 0,
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

  submitStar() {
    if (this.hasGeneralStars){
      console.log('coucou je note')
      // this.store
      //   .dispatch(
      //     new Closerecommandation(
      //       this.recommandation!.id,
      //       this.recommandation!.qualityStars,
      //       this.recommandation!.qualityComment,
      //       this.recommandation!.securityStars,
      //       this.recommandation!.securityComment,
      //       this.recommandation!.organisationStars,
      //       this.recommandation!.organisationComment
      //     )
      //   )
      //   .pipe(take(1))
      //   .subscribe(() => {
      //     // this._recommandationMenu.swipeupCloserecommandation = false;
      //     this.cd.markForCheck();
      //   });
    }
  }

};