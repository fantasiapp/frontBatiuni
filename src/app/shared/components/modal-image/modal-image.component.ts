import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { SafeResourceUrl } from "@angular/platform-browser";
import { delay } from "../../common/functions";
import { ImageGenerator } from "../../services/image-generator.service";


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

  scale: number = 1;

  constructor(private cd: ChangeDetectorRef) {
  }
  ngOnInit() {
    document.onreadystatechange = (state) => {
      console.log("plop")
    }
  }


  xDown: number = 0;
  yDown: number = 0;

  xTranslation: number = 0;
  yTranslation: number = 0;

  ngAfterViewInit() {
    console.log("modal");
    console.log(this.src);
    let img = document.getElementById("target")!;
    console.log("div", img);

    img.onwheel = (event) => {
      event.preventDefault();
      console.log("zoom")
      console.log(event)
      console.log(this)
      console.log("scale before", this.scale)

      this.scale += event.deltaY / 100;
      this.scale = Math.max(1, Math.min(this.scale, 10));
      console.log("scale after", this.scale);

      img = document.getElementById("target")!;
      img.style.transform = `scale(${this.scale}) translate(${this.xTranslation}px, ${this.yTranslation}px)`;
    };

    img.ontouchstart = (event) => {
      event.preventDefault();
      console.log("touchstart")
      console.log(event)
      
      img = document.getElementById("target")!;
      
      this.xDown = event.touches[0].clientX;
      this.yDown = event.touches[0].clientY;

      console.log("start", this.xDown, this.yDown)
    };

    img.ontouchmove = (event) => {
      event.preventDefault();
      console.log("slide")
      console.log(event);

      let x = event.touches[0].clientX;
      let y = event.touches[0].clientY;

      let deltaX = x - this.xDown;
      let deltaY = y - this.yDown;

      console.log("move", deltaX, deltaY);

      img = document.getElementById("target")!;

      console.log("scale move", this.scale)
      console.log("move", this.xTranslation + deltaX, this.yTranslation + deltaY)
      img.style.transform = `scale(${this.scale}) translate(${this.xTranslation + deltaX}px, ${this.yTranslation + deltaY}px)`;
    };

    img.ontouchend = (event) => {
      event.preventDefault();
      console.log("end")
      console.log(event);
      this.xTranslation += event.changedTouches[0].clientX - this.xDown;
      this.yTranslation += event.changedTouches[0].clientY - this.yDown;
    };

  }

  async test() {
    let bool = true
    while(true) {
      if (bool){
        bool = false
        console.log("modal image component")
        console.log(this.src)
        console.log(this.scale)
        console.log("this", this)
        await delay(1000)
        bool=true}
    }
  }
};