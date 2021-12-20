import { ChangeDetectionStrategy, Component, ComponentRef, ContentChild, ContentChildren, Input, Optional, QueryList, TemplateRef, ViewContainerRef, ViewRef } from "@angular/core";

//Use case

@Component({
  selector: 'tab',
  template: ``,
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabComponent {
  @Input()
  name: string = '';

  @ContentChild(TemplateRef, {static: true})
  template!: TemplateRef<any>;
  
  constructor() { }
};

@Component({
  selector: 'tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent {

  @ContentChildren(TabComponent, {descendants: false})
  tabs!: QueryList<TabComponent>;

  index: number = 0;
  activeTab: TabComponent | null = null;;

  constructor(private view: ViewContainerRef) {}

  ngOnInit() {
    this.view.clear();
  }

  setView(index: number) {
    if ( this.activeTab )
      this.view.remove(0);
    index = index //% this.tabs.length;
    this.activeTab = this.tabs.get(this.index = index)!;
    let template = this.view.createEmbeddedView(this.activeTab.template, {$implicit: this});
    template.rootNodes.forEach(node => {
      node.classList.add('tab-content');
    });
    this.view.insert(template, 0);
  }


  ngAfterContentInit() {
    this.setView(this.index);
  }
};