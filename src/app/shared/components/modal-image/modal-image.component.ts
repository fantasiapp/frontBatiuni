import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { SafeResourceUrl } from "@angular/platform-browser";


//simple component for showing images
@Component({
  selector: 'modal-image',
  templateUrl: './modal-image.component.html',
  styleUrls: ['./modal-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalImage {

  @Input()
  src: SafeResourceUrl = "";

  ngOnInit() {
    console.log("modal")
    console.log(this.src)
    document.onreadystatechange = (state) => {
      console.log("plop")
    }
    console.log(document.getElementById("modalImage"))
    console.log(document.getElementsByName("modalImage"))
  }

  ngAfterViewInit() {
    console.log("modal")
    console.log(this.src)
  }

};