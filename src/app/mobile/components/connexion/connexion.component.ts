import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { BooleanService } from "src/app/shared/services/boolean.service";
import { GetUserData } from "src/models/new/user/user.actions";

@Component({
  selector: 'connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnexionComponent {
  isLoading: boolean

  constructor(private cd: ChangeDetectorRef ,private isLoadingService: BooleanService) {
    this.isLoading = isLoadingService.isLoading
    this.isLoadingService.getLoadingChangeEmitter().subscribe((bool) => {
      this.isLoading = bool
      this.cd.markForCheck()
    })
  }
};