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

  pinchScaling: boolean = false;

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
      if (event.touches.length === 2) {
        this.pinchScaling = true;
        this.pinchStart(event);
      } else {
        event.preventDefault();
        console.log("touchstart")
        console.log(event)
        
        img = document.getElementById("target")!;
        
        this.xDown = event.touches[0].clientX;
        this.yDown = event.touches[0].clientY;

        console.log("start", this.xDown, this.yDown)
      }
    };

    img.ontouchmove = (event) => {
      if (this.pinchScaling) {
        this.pinchMove(event);
      } else {
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
      }
    };

    img.ontouchend = (event) => {
      if (this.pinchScaling) {
        this.pinchEnd(event);
        this.pinchScaling = false;
      } else {
        event.preventDefault();
        console.log("end")
        console.log(event);
        this.xTranslation += event.changedTouches[0].clientX - this.xDown;
        this.yTranslation += event.changedTouches[0].clientY - this.yDown;
      };
    };

  }

  baseDist: number = 0;

  getDistance(touch1: Touch, touch2: Touch) {
    return Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
  }

  pinchStart(event: TouchEvent) {
    event.preventDefault();
    console.log("pinch start")
    console.log(event)
    this.baseDist = this.getDistance(event.touches[0], event.touches[1]);
  }

  pinchMove(event: TouchEvent) {
    event.preventDefault();
    console.log("pinch")
    console.log(event)
    let dist = this.getDistance(event.touches[0], event.touches[1]);
    console.log(dist);
    
    this.scale = this.scale * dist / this.baseDist;

    let img = document.getElementById("target")!;
    img.style.transform = `scale(${this.scale}) translate(${this.xTranslation}px, ${this.yTranslation}px)`;
  }

  pinchEnd(event: TouchEvent) {
    event.preventDefault();
    console.log("pinch end")
    console.log(event)
    this.baseDist = this.getDistance(event.changedTouches[0], event.changedTouches[1]);
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