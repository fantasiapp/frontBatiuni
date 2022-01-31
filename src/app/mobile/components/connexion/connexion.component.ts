import { ChangeDetectionStrategy, Component } from "@angular/core";
import { GetUserData } from "src/models/user/user.actions";

@Component({
  selector: 'connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnexionComponent {};