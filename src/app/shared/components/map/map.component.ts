import { Component, ChangeDetectionStrategy, Input, ViewChild, ElementRef, Output, EventEmitter, NgZone, asNativeElements, ChangeDetectorRef } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import * as mapboxgl from 'mapbox-gl';
import { Observable } from 'rxjs';
import { availableCompanies } from 'src/app/mobile/components/SOS_page/sos-page.component';
import { Company, Mission, Post } from 'src/models/new/data.interfaces';
import { DataQueries, DataState } from 'src/models/new/data.state';
import { Availability } from '../calendar/calendar.ui';

export type MarkerData = {
  latitude: number;
  longitude: number;
};

export type MarkerType = Exclude<Availability, 'nothing'>;

@Component({
  selector: 'mapbox-batiuni',
  templateUrl: 'map.component.html',
  styleUrls: ['map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIMapComponent {

  @Select(DataState.view)
  view$!: Observable<"PME" | "ST">;
  view!: 'PME' | 'ST'

  //I bet you can make a better system, this just works
  mode: 'company' | 'post' = 'company';
  
  _posts: Post[] = [];
  get posts() { return this._posts; }
  @Input()
  set posts(values: Post[]) {
    this.mode = 'post';
    this._posts = values;
    this._companies = this.store.selectSnapshot(DataQueries.getMany('Company', this.posts.map(post => post.company)));
    console.log('this,initialized', this.initialized);
    if ( this.initialized ) this.showPosts();
  }

  currentPost: Post | null = null

  _companies: Company[] = [];
  get companies() { return this._companies; }

  // @Input()
  // set companies(values: Company[]) {
  //   this.mode = 'company';
  //   this._companies = values;
  //   this._posts = [];
  //   if ( this.initialized ) this.showCompanies();
  // }

  // @Input() availabilities: MarkerType[] = [];

  @Input() availableCompanies: availableCompanies[] = []
  
  @Input()
  center: MarkerData = {
    longitude: 2.349014,
    latitude: 48.864716
  };

  @Output()
  postClick = new EventEmitter<Post>();

  @Output()
  companyClick = new EventEmitter<Company>();

  @ViewChild('map', {read: ElementRef, static: true})
  mapContainer!: ElementRef;

  mapbox: any;
  mapboxStyles = 'mapbox://styles/zeuschatoui/ckxj0zqovi9lf15p5gysrfax4';

  constructor(private store: Store, private cd: ChangeDetectorRef) {}

  popupContent!: HTMLElement;

  @ViewChild('popupContainer', {read: ElementRef, static: true})
  popupContainer!: ElementRef


  currentCompany: Company | null = null;
  currentAvailability: MarkerType = 'unavailable';

  createPopup() {
    let span = document.createElement('span');
    span.classList.add('mapbox-popup-content');
    span.innerText = "";
    span.onclick = () => { };

    this.popupContent = span;
  }

  loadPopup(company: Company, post?: Post, availability?: MarkerType) {
    this.popupContent.innerHTML = `${company.name}`;


    this.currentCompany = company
    if(post) this.currentPost = post
    if (!availability) availability = 'unavailable';
    this.currentAvailability = availability
    this.popupContainer.nativeElement.style.display = 'block'
    this.cd.markForCheck()

    return new mapboxgl.Popup().setDOMContent(this.popupContainer.nativeElement);
  }

  createMarker(icon: MarkerType = 'selected') {
    const marker = document.createElement('div');
    const WH = 70
    marker.className = 'marker-icon'
    
    marker.style.backgroundImage =  `url(assets/map/${icon}.svg)`;
    marker.style.backgroundSize = '100%';
    marker.style.width = `${WH}px`;
    marker.style.height = `${WH}px`;
    return marker
  }

  private initialized: boolean = false;
  ngOnInit() {
    this.view$.subscribe(view=>{
      this.view = view
      this.mapbox = new mapboxgl.Map({
        accessToken: 'pk.eyJ1IjoiemV1c2NoYXRvdWkiLCJhIjoiY2t3c2h0Yjk0MGo2NDJvcWh3azNwNnF6ZSJ9.ZBbZHpP2RFSzCUPkjfEvMQ',
        container: this.mapContainer.nativeElement,
        style: this.mapboxStyles,
        zoom: 5,
        center: [this.center.longitude, this.center.latitude],
        attributionControl: false
      });
  
      this.createPopup();
      this.refresh();
      this.initialized = true;
  
      if(this.posts) this.showPosts();
    })

  }

  refresh() {
    this.reset();
    if ( this.mode == 'post' ){
      // this.showPosts();
    }
    else
      this.showCompanies(); 
  }

  private aliveMarkers: mapboxgl.Marker[] = [];

  private showPosts() {
    this.posts.forEach((post, i) => {
      if ( post.latitude == null || post.longitude == null ) return;

      let marker = new mapboxgl.Marker(this.createMarker())
        .setLngLat([post.longitude, post.latitude])
        .addTo(this.mapbox);
      
      marker.getElement().onclick = () => {
        marker.setPopup(this.loadPopup(this.companies[i], post));
      }

      this.aliveMarkers.push(marker);
      return marker;
    });
  }

  private showCompanies() {
    this.availableCompanies.forEach((availableCompany)=> {
      let company = availableCompany.company;
      let availability = availableCompany.availability;
      if ( company.latitude == null || company.longitude == null ) return;

      let marker = new mapboxgl.Marker(this.createMarker(availability))
        .setLngLat([company.longitude, company.latitude])
        .addTo(this.mapbox);
      
      marker.getElement().onclick = () => {
        marker.setPopup(this.loadPopup(company, undefined, availability));
      }

      this.aliveMarkers.push(marker);
      return marker;
    })
  }

  reset() {
    this.mapbox.setZoom(5);
    this.mapbox.setCenter([this.center.longitude, this.center.latitude]);
    for ( const marker of this.aliveMarkers )
      marker.remove();
    
    this.aliveMarkers.length = 0;
  }
}