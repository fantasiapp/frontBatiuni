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

  constructor(private cd: ChangeDetectorRef){
    this.cd = cd
  }

  markForCheck(){
    this.cd.markForCheck()
  }
  

  @Input()
  title: string = 'Accordion';

  _open!: boolean;
  @Input()
  set open(b:boolean){
    this._open = b
  }

  get open() { 
    return this._open;
  }


  // Callback
  isOpen(){
    return this._open
  }

  @ViewChild('panel', {read: ElementRef, static: true})
  panel!: ElementRef;

  toggle() {
    this.open = !this._open
  }

  
};