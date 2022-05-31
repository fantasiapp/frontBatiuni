import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild, ViewRef } from "@angular/core";
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
  }

  ngAfterViewInit() {
    console.log("modal")
    console.log(this.src)
  }

};