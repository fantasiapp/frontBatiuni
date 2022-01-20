import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { shadeColor } from "src/common/functions";

@Component({
  selector: 'file-svg',
  template: `
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="84.626" height="103.938" viewBox="0 0 84.626 103.938">
    <defs>
      <filter id="box-shadow" x="0" y="0" width="84.626" height="103.938" filterUnits="userSpaceOnUse">
        <feOffset dy="3" input="SourceAlpha"/>
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feFlood flood-opacity="0.161"/>
        <feComposite operator="in" in2="blur"/>
        <feComposite in="SourceGraphic"/>
      </filter>
    </defs>
    <g transform="translate(1.374 6)">
      <g transform="translate(0 0)">
        <g transform="matrix(1, 0, 0, 1, -1.37, -6)" filter="url(#box-shadow)">
          <rect data-name="container" width="60.198" height="84.748" rx="7" transform="translate(9 15)" fill="#fff"/>
        </g>
        <path data-name="filename arrow"  d="M6000.1,11956.382l7.747,8.433v-8.433Z" transform="translate(-6000.102 -11917.76)" [style.fill]="arrowColor"/>
        <g transform="translate(0, 20)">
          <rect width="65" height="20" rx="2" [style.fill]="color"/>
          <text style="fill: #fff; z-index: 1" x="6" y="14" font-size="12.5" font-family="Poppins" font-weight="500">{{ name }}</text>
        </g>
        <rect data-name="Line 1" width="40" height="2.5" transform="translate(20.179 53.452)" fill="#ccc"/>
        <rect data-name="Line 2" width="40" height="2.5" transform="translate(20.179 62.143)" fill="#ccc"/>
        <rect data-name="Line 3" width="40" height="2.5" transform="translate(20.179 70.833)" fill="#ccc"/>
        <rect data-name="Line 4" width="40" height="2.5" transform="translate(20.179 79.523)" fill="#ccc"/>
      </g>
    </g>
  </svg>
  `,
  styles: [`
    :host { display: inline-block; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileIcon {
  public name: string = 'Fichier';
  @Input('name') set _name(name: string) {
    if ( name.length >= 8 )
      this.name = name.slice(0, 2) + '..' + name.slice(name.length-3);
    this.name = name;
  };

  //#ffb347 for orange
  @Input() color: string = '#32a290';

  get arrowColor() {
    return shadeColor(this.color, -20);
  }
}

//make more customizable;

//fix shadow