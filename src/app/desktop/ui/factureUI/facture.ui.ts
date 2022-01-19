import { ChangeDetectionStrategy, Component, Input} from "@angular/core";

@Component({
  selector: 'facture-ui',
  templateUrl: './facture.ui.html',
  styleUrls: ['./facture.ui.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FactureUI { 
  @Input()
  date : string = "Le 18 novembre 2021";
  @Input()
  idFacture : string = "23 94832";
  @Input()
  service : string = "sous-traitance";
  @Input()
  price : string  = '12'
  
};
