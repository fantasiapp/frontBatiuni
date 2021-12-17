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
    comment : string = "(Moins que 3 mois)"

    @Input()
    imgsrc : string = "";

    @Input()
    showtitle : boolean = false;
    show(e : any) {
    console.log(e.view.Capacitor.platform)
        }
    // Edit true or false
    // @Input()
    // Edit : boolean = true
}