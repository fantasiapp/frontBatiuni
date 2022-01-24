import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
import { Login } from "src/models/auth/auth.actions";
import { AuthModel } from "src/models/auth/auth.model";
import { AuthState } from "src/models/auth/auth.state";
import { Destroy$ } from "src/app/shared/common/classes";
import { setErrors } from "src/validators/verify";
import { GetUserData } from "src/models/user/user.actions";

@Component({
  selector: 'connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnexionComponent {};