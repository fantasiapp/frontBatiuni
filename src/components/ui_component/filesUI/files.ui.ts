import { Component, Input } from "@angular/core";

@Component({
    selector: "fileinput",
    templateUrl: "./file.ui.html",
    styleUrls: ["./file.ui.scss"]
})
export class FileUI {
    @Input()
    filename : string = "Kbis ( Moins de 3 mois )";

    @Input()
    expiry : Date = new Date(Date.now());

    @Input()
    imgsrc : string = "/assets/files/Impot.svg";

    // Edit true or false
    // @Input()
    // Edit : boolean = true
}