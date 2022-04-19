import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from "@angular/core";

export type AccordionItem = {
  name: string;
  content?: string;
};

@Component({
  selector: 'accordion',
  templateUrl: './accordion.ui.html',
  styleUrls: ['./accordion.ui.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIAccordion {
  

  @Input()
  title: string = 'Accordion';

  private _open: boolean = false;
  get open() { return this._open; }

  @ViewChild('panel', {read: ElementRef, static: true})
  panel!: ElementRef;

  toggle() {
    const DOMPanel = this.panel.nativeElement as HTMLElement;
    this._open = !this._open;
    if ( this.open )
      DOMPanel.style.maxHeight = DOMPanel.scrollHeight + 'px';
    else
      DOMPanel.style.maxHeight = '0';
  }
};