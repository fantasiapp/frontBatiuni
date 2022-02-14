import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Input, ViewChild, ElementRef, Output, EventEmitter, NgZone } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { Company, Post } from 'src/models/new/data.interfaces';

export type MarkerData = {
  latitude: number;
  longitude: number;
};

export type markerType = 'disponible' | 'sous-conditions' | 'ST'

@Component({
  selector: 'mapbox-batiuni',
  templateUrl: 'map.component.html',
  styleUrls: ['map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIMapComponent {
  
  _posts: Post[] = [];
  // companies: Company[] = [];
  
  get posts() { return this._posts; }
  
  @Input()
  set posts(values: Post[]) {
    this._posts = values;
    // this.companies = values.map(post => PostRow.getCompany(post));
  }
  
  @Input()
  center: MarkerData = {
    longitude: 2.349014,
    latitude: 48.864716
  };

  @Output()
  postClick = new EventEmitter<Post>();

  @ViewChild('map', {read: ElementRef, static: true})
  view!: ElementRef;

  mapbox: any;
  mapboxStyles = 'mapbox://styles/zeuschatoui/ckxj0zqovi9lf15p5gysrfax4';

  constructor(private cd: ChangeDetectorRef) {}

  popupContent!: HTMLElement;
  createPopup() {
    let span = document.createElement('span');
    span.classList.add('mapbox-popup-content');
    span.innerText = "";
    span.onclick = () => { };

    this.popupContent = span;
  }

  loadPopup(post: Post, company: Company) {
    this.popupContent.innerHTML = `${company.name}`;
    this.popupContent.onclick = () => {
      this.postClick.emit(post);
      this.cd.markForCheck();
    };

    return new mapboxgl.Popup().setDOMContent(this.popupContent);
  }

  createMarker(icon:markerType ) {
    const marker = document.createElement('div');
    const WH = 70
    marker.className = 'marker-icon'
    marker.style.backgroundImage =  `url(assets/Icon-map-${icon}.svg)`;
    marker.style.backgroundSize = '100%';
    marker.style.width = `${WH}px`;
    marker.style.height = `${WH}px`;
    return marker
  }
  testCorrdo = [
    {lat:48.856614,long:2.3522219}
  ]
  ngOnInit() {
    this.mapbox = new mapboxgl.Map({
      accessToken: 'pk.eyJ1IjoiemV1c2NoYXRvdWkiLCJhIjoiY2t3c2h0Yjk0MGo2NDJvcWh3azNwNnF6ZSJ9.ZBbZHpP2RFSzCUPkjfEvMQ',
      container: this.view.nativeElement,
      style: this.mapboxStyles,
      zoom: 11,
      center: [this.center.longitude, this.center.latitude],
      attributionControl:false
    });

    this.createPopup();
    console.log('Hello from post', this.posts)

    // this.testCorrdo.forEach((cord)=>{
    //   let marker = new mapboxgl.Marker(this.createMarker('sous-conditions'))
    //   .setLngLat([cord.long,cord.lat])
    //   .addTo(this.mapbox)

    //   return marker
    // })

    this.posts.forEach((post, i) => {
      if ( post.latitude == null || post.longitude == null ) return;

      let marker = new mapboxgl.Marker(this.createMarker('sous-conditions'))
        .setLngLat([post.longitude, post.latitude])
        .addTo(this.mapbox);
      
      marker.getElement().onclick = () => {
        marker.setPopup(this.loadPopup(post, {name: 'troll'} as any));
      }

      return marker;
    })
  }
}





