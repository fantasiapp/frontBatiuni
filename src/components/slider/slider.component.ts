import { ChangeDetectorRef, Component, ContentChildren, HostListener, Input, QueryList, TemplateRef, ViewChild } from "@angular/core";
import { SlidesDirective } from "src/directives/slides.directive";

@Component({
  selector: 'slider',
  templateUrl: './slider.component.html',
  styleUrls: [
    './slider.component.scss'
  ]
})
export class SliderComponent {
  private _type: 'component' | 'template' = 'template';

  constructor(private cd: ChangeDetectorRef) {
  };

  @ContentChildren(TemplateRef)
  components!: QueryList<TemplateRef<any>>;

  @ViewChild(SlidesDirective, {static: true})
  container?: SlidesDirective;

  @Input()
  pagination: boolean = true;

  @Input()
  showPageName: boolean = true;

  @Input()
  showNext: boolean = true;
  
  @Input()
  set type(type: 'component' | 'template') {
    this._type = type;
  };

  private _slides: any[] = [];
  get slides() { return this._slides; }
  get type() { return this._type; }
  get index() { return this.container?.index || 0; }
  get length() { return this.slides.length; }

  ngAfterContentInit() {
    this._slides = this.components.toArray();
  }

  slideLeft() {
    this.container?.left();
  }

  slideRight() {
    this.container?.right();
  }

  @HostListener('swipeleft')
  onSwipeLeft() {
    this.slideLeft();
  }

  @HostListener('swiperight')
  onSwipeRight() {
    this.slideRight();
  }
};