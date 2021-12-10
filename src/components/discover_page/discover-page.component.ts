import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SliderComponent } from "../slider/slider.component";

@Component({
  selector: 'discover-entreprise',
  templateUrl: './discover-page-entreprise.component.html',
  styleUrls: ['./discover-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiscoverComponentEntreprise {
  @ViewChild(SliderComponent, {static: true})
  slider!: SliderComponent;

  constructor(private cd: ChangeDetectorRef) { }

  ngAfterContentInit() {
    this.cd.markForCheck();
  }
};

@Component({
  selector: 'discover-sous-traitant',
  templateUrl: './discover-page-sous-traitant.component.html',
  styleUrls: ['./discover-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiscoverComponentSousTraitant {
  @ViewChild(SliderComponent, {static: true})
  slider!: SliderComponent;

  constructor(private cd: ChangeDetectorRef) { }

  ngAfterContentInit() {
    this.cd.markForCheck();
  }
};

@Component({
  selector: 'discover',
  templateUrl: './discover-page.component.html',
  styleUrls: ['./discover-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiscoverComponent {
  subject: string = '';
  static subjects: string[] = ['entreprise', 'sous-traitant'];

  @ViewChild(SliderComponent, {static: true})
  slider!: SliderComponent;

  constructor(private router: Router, private route: ActivatedRoute, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.subject = this.route.snapshot.params['subject'] || 'entreprise';
    if ( !DiscoverComponent.subjects.includes(this.subject))
      this.router.navigate(['', 'discover', this.subject = 'entreprise']);
  }

  ngAfterContentInit() {
    this.cd.markForCheck();
  }
};