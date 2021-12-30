import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from "@angular/core";
import { UIDefaultAccessor } from "src/common/classes";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: 'commentaire-ui',
  templateUrl: './commentaire.ui.html',
  styleUrls: ['./commentaire.ui.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: CommentaireUI
  }]
})
export class CommentaireUI extends UIDefaultAccessor<FileList>{ 
    imagepath: any;
    imgSrc : any;
    url : any;
    constructor(private cd: ChangeDetectorRef) {
        super();
    }
    
    showImage(e :any) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
    
    reader.onload = (e: any) => {
        this.imgSrc = e.target.result;
        this.cd.detectChanges();
    };
  reader.readAsDataURL(e.target.files[0]);
        }
    
    }
  
};
