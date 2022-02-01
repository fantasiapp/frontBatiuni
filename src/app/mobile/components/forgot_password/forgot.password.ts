import { ChangeDetectionStrategy } from "@angular/core";
import { Component } from "@angular/core";

@Component({
    selector:'forgot-password',
    templateUrl:'forgot.password.html',
    styleUrls:['forgot.password.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush

})
export class ForgotPassword {}