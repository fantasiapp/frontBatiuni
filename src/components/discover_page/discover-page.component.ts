import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SlideTemplate } from "src/directives/slideTemplate.directive";

export type DiscoveryContext = {
  $implicit: {
    title: string;
    texts: {content: string; emphasis: boolean}[];
    image?: string;
  }
};

const PMEContexts: DiscoveryContext[] = [
  //Page 1
  {$implicit: {
    title: 'Nos services PME',
    texts: [
      {content: 'Accédez', emphasis: false},
      {content: 'aux offres', emphasis: true},
      {content: 'PME et filtrez selon', emphasis: false},
      {content: 'vos préferences', emphasis: true}
    ],
    image: 'assets/PME1.svg'
  }},
  //Page 2
  {$implicit: {
    title: 'Nos services PME',
    texts: [
      {content: 'Soyez facilement', emphasis: false},
      {content: 'organisés', emphasis: true}
    ],
    image: 'assets/PME2.svg'
  }},
  //Page 3
  {$implicit: {
    title: 'Nos services PME',
    texts: [
      {content: 'Communiquez', emphasis: true},
      {content: 'et', emphasis: false},
      {content: 'suivez', emphasis: true},
      {content: 'vos chantiers efficacement', emphasis: false}
    ],
    image: 'assets/PME3.svg'
  }},
  //Page 4
  {$implicit: {
    title: 'Nos services PME',
    texts: [
      {content: 'Recevez des', emphasis: false},
      {content: 'offres d\'emplois', emphasis: true},
      {content: 'intéressantes selon vos', emphasis: false},
      {content: 'disponibilités', emphasis: true}
    ],
    image: 'assets/PME4.svg'
  }}
];

const STContexts: DiscoveryContext[] = [
  //Page 1
  {$implicit: {
    title: 'Nos services de sous-traitances',
    texts: [
      {content: 'Accédez', emphasis: false},
      {content: 'aux offres', emphasis: true},
      {content: 'de sous-traitances et filtrez selon', emphasis: false},
      {content: 'vos préferences', emphasis: true}
    ],
    image: 'assets/ST1.png'
  }},
  //Page 2
  {$implicit: {
    title: 'Nos services de sous-traitances',
    texts: [
      {content: 'Soyez facilement', emphasis: false},
      {content: 'organisés', emphasis: true}
    ],
    image: 'assets/ST2.png'
  }},
  //Page 3
  {$implicit: {
    title: 'Nos services de sous-traitances',
    texts: [
      {content: 'Communiquez', emphasis: true},
      {content: 'et', emphasis: false},
      {content: 'suivez', emphasis: true},
      {content: 'vos chantiers efficacement', emphasis: false}
    ],
    image: 'assets/ST3.svg'
  }},
  //Page 4
  {$implicit: {
    title: 'Nos services de sous-traitances',
    texts: [
      {content: 'Recevez des', emphasis: false},
      {content: 'offres d\'emplois', emphasis: true},
      {content: 'intéressantes selon vos', emphasis: false},
      {content: 'disponibilités', emphasis: true}
    ],
    image: 'assets/ST4.svg'
  }}
];

@Component({
  selector: 'discover',
  templateUrl: './discover-page.component.html',
  styleUrls: ['./discover-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiscoverComponent {
  subject: 'entreprise' | 'sous-traitant' = 'entreprise';
  static subjects: string[] = ['entreprise', 'sous-traitant'];

  @ViewChild(SlideTemplate, {static: true})
  slider!: SlideTemplate<DiscoveryContext>;

  contexts: {[key: string]: DiscoveryContext[]} = {
    'entreprise': PMEContexts,
    'sous-traitant': STContexts
  };

  constructor(private router: Router, private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.subject = this.route.snapshot.params['subject'] || 'entreprise';
    if ( !DiscoverComponent.subjects.includes(this.subject))
      this.router.navigate(['', 'discover', this.subject = 'entreprise']);
  }

  @HostListener('swipeleft')
  onSwipeLeft() {
    this.slider.slide('left');
  }

  
  @HostListener('swiperight')
  onSwipeRight() {
    this.slider.slide('right');
  }
};