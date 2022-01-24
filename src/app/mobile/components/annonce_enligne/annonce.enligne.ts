import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "annonce-enligne",
  templateUrl:"annonce.enligne.html",
  styleUrls:['annonce.enligne.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnonceEnlignePage {

 swipemenu: boolean = false;
 annoncePause: boolean = false;
 showResponse: boolean = false;
}