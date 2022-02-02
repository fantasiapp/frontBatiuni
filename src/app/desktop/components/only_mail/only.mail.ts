import { ChangeDetectionStrategy } from "@angular/core";
import { Component } from "@angular/core";

@Component({
    selector:'only-mail-web',
    templateUrl:'mail.page.html',
    styleUrls:['only.mail.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush

})
export class MailSender {}