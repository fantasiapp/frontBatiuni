import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { MyStore } from "src/app/shared/common/classes";


@Component({
  selector: 'annonce-valide-resumer',
  templateUrl: 'annonce.valide.html',
  styleUrls:['annonce.valide.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AnnonceValidePage {
  constructor(private store: MyStore){}
    
  ngOnInit() {
      
  }
}