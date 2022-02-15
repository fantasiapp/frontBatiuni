import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Store } from "@ngxs/store";


@Component({
  selector: 'annonce-valide-resumer',
  templateUrl: 'annonce.valide.html',
  styleUrls:['annonce.valide.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AnnonceValidePage {
  constructor(private store: Store){}
    
  ngOnInit() {
      
  }
}