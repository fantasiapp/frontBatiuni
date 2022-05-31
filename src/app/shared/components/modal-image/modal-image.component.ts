import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { SafeResourceUrl } from "@angular/platform-browser";
import { Capacitor } from "@capacitor/core";
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

  isMobile: boolean = true;

  ngOnInit() {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }


  xDown: number = 0;
  yDown: number = 0;

  xTranslation: number = 0;
  yTranslation: number = 0;

  // This function comes from StackOverflow:
  // https://stackoverflow.com/questions/18011099/pinch-to-zoom-using-hammer-js
  // It is used to zoom and translate the image on mobile devices.
  hammerIt(elm: HTMLElement) {
    let hammertime = new Hammer(elm, {});
    hammertime.get('pinch').set({
      enable: true
    });
    var posX = 0,
      posY = 0,
      scale = 1,
      last_scale = 1,
      last_posX = 0,
      last_posY = 0,
      max_pos_x = 0,
      max_pos_y = 0,
      transform = "",
      el = elm;

    hammertime.on('doubletap pan pinch panend pinchend', function (ev) {
      if (ev.type == "doubletap") {
        transform =
          "translate3d(0, 0, 0) " +
          "scale3d(2, 2, 1) ";
        scale = 2;
        last_scale = 2;
        try {
          if (window.getComputedStyle(el, null).getPropertyValue('-webkit-transform').toString() != "matrix(1, 0, 0, 1, 0, 0)") {
            transform =
              "translate3d(0, 0, 0) " +
              "scale3d(1, 1, 1) ";
            scale = 1;
            last_scale = 1;
          }
        } catch (err) { }
        el.style.webkitTransform = transform;
        transform = "";
      }

      //pan    
      if (scale != 1) {
        posX = last_posX + ev.deltaX;
        posY = last_posY + ev.deltaY;
        max_pos_x = Math.ceil((scale - 1) * el.clientWidth / 2);
        max_pos_y = Math.ceil((scale - 1) * el.clientHeight / 2);
        if (posX > max_pos_x) {
          posX = max_pos_x;
        }
        if (posX < -max_pos_x) {
          posX = -max_pos_x;
        }
        if (posY > max_pos_y) {
          posY = max_pos_y;
        }
        if (posY < -max_pos_y) {
          posY = -max_pos_y;
        }
      }

      //pinch
      if (ev.type == "pinch") {
        scale = Math.max(.999, Math.min(last_scale * (ev.scale), 4));
      }
      if (ev.type == "pinchend") { last_scale = scale; }

      //panend
      if (ev.type == "panend") {
        last_posX = posX < max_pos_x ? posX : max_pos_x;
        last_posY = posY < max_pos_y ? posY : max_pos_y;
      }

      if (scale != 1) {
        transform =
          "translate3d(" + posX + "px," + posY + "px, 0) " +
          "scale3d(" + scale + ", " + scale + ", 1)";
      }

      if (transform) {
        el.style.webkitTransform = transform;
      }
    });
  }

  ngAfterViewInit() {
    let img = document.getElementById("target")!;

    if (!this.isMobile) {
      img.onwheel = (event) => {
        event.preventDefault();

        this.scale += event.deltaY / 100;
        this.scale = Math.max(1, Math.min(this.scale, 10));

        img = document.getElementById("target")!;
        img.style.transform = `translate(${this.xTranslation}px, ${this.yTranslation}px) scale(${this.scale})`;
      };
    } else {
      this.hammerIt(img);
    }
  }
};