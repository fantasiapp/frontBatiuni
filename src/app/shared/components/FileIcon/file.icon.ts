import { i18nMetaToJSDoc } from "@angular/compiler/src/render3/view/i18n/meta";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Store } from "@ngxs/store";
import { shadeColor } from "src/app/shared/common/functions";
import { Label } from "src/models/new/data.interfaces";
import { DataQueries, SnapshotAll } from "src/models/new/data.state";

@Component({
  selector: 'file-svg',
  template: `
  <svg *ngIf="!isLabel" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="84.626" height="103.938" viewBox="0 0 84.626 103.938">
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
        <g transform="matrix(1, 0, 0, 1, -1.37, -6)" filter="drop-shadow( 0px 3px 6px #00000029)" style='filter: drop-shadow(0px 3px 6px #00000029)'>
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
  <div *ngIf="!isLabel" class="svg-shadow-fallback-value"></div>
<img class="icon-logo" *ngIf="isLabel" src="assets/{{originalName}}.png" alt="label">
<figcaption *ngIf="date">*{{ date.slice(8,10)+date.slice(4,7)+'-'+date.slice(0,4) }}</figcaption>
  `,
  styles: [`
    :host { 
      /* display: inline-block;  */
      display:flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      /* display: block !important; */
    }

    .icon-logo{
      width: 100%;
      object-fit: contain 
    }

    figcaption{
      color: #0D6191;
      font-size: 12px;
      text-align: center;
    }

    svg {
      position: relative;
      z-index: 1
    }
    .svg-shadow-fallback-value {
      position: absolute;
      top: 16px;
      left: 10px;
      height: 82.75px;
      width: 59px;
      border-radius: 4px;
      box-shadow: 0 3px 6px #00000029;
      z-index: 0
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileIcon {
  public name: string = 'Fichier';
  public label: Label[] = []
  public isLabel: boolean = false
  public originalName: string = '';
  public allLabels: Label[];

  constructor(private store: Store) {
    this.allLabels = this.store.selectSnapshot(DataQueries.getAll("Label"))
  }


  @Input('name') set _name(name: string) {
    this.originalName = name
    if ( name.length > 7 )
      this.name = name.slice(0, 7) + '-';
    else this.name = name;
  };

  @Input() 
  date!: string 

  //#ffb347 for orange
  @Input() color: string = '#32a290';

  get arrowColor() {
    return shadeColor(this.color, -20);
  }

  ngOnInit() {
    this.label = this.allLabels.filter(label => label.name == this.originalName)
    if(this.label.length == 1) {
      this.isLabel = true
      this.originalName = this.label[0].fileName
    } 

  }
}