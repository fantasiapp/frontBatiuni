import { Component, Input} from "@angular/core";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';


@Component({
    selector: 'camera',
    templateUrl: './home.menu.html',
    styleUrls: ['./home.menu.scss']
  })
export class HomeMenu { 
  currentIndex : number = 0;
  @Input()
  HomeButton : HomeMenuI[] = [
      {name: "Home", src:"/assets/confirmation.svg", activeSrc:"/assets/Fleche.svg"},
      {name: "Missions", src:"/assets/confirmation.svg",activeSrc:"/assets/Fleche.svg"},
      {name: "Availibity", src:"/assets/confirmation.svg",activeSrc:"/assets/Fleche.svg"},
      {name: "Profile", src:"/assets/confirmation.svg", activeSrc:"/assets/Fleche.svg"},
    ] 
} 

export interface HomeMenuI {
  name : string // Nom de la page / tab
  src : string // src de la photo non active
  activeSrc : string // src de la photo active
}

