import { Component, Input } from "@angular/core";

@Component({
    selector: "comment-suivi",
    templateUrl: "comment.suivi.html",
    styleUrls: ['comment.suivi.scss']
})
export class SuiviComments {
    // We can get the name and the profile image from the state
    @Input()
    name: string = 'Gabriel Dubois'

    @Input()
    datetime: any = 'Le 13/11/2021 à 18h:09'

    @Input()
    coverimage: any = "assets/Building.png"

    @Input()
    comments: string = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore'

}