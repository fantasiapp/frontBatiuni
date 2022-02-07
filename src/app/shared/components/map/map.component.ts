import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

export type MarkerData = {
  position: [number, number]
  name: string;
};

@Component({
  selector: 'mapbox-batiuni',
  templateUrl: 'map.component.html',
  styleUrls: ['map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiMapComponent {

  map: any;
  style = 'mapbox://styles/zeuschatoui/ckxj0zqovi9lf15p5gysrfax4';
  lat = 48.864716;
  lng = 2.349014;

  constructor() {}

  places: MarkerData[] = [
    {position: [2.352558675604982, 48.83011647720049], name: 'New York'},
    {position: [2.3114995493, 48.8611235443], name: 'Paris'},
    {position: [2.285813409112486, 48.850739049625446], name: 'Rabat'},
    {position: [2.268915048260837, 48.85421018352511], name: 'Beijing'}
  ];

  popupContent!: HTMLElement;

  initializePopup() {
    let span = document.createElement('span');
    span.classList.add('mapbox-popup-content');
    span.innerText = "Hello world";
    span.onclick = () => { };

    this.popupContent = span;
  }

  createPopup(data: MarkerData) {
    return new mapboxgl.Popup().setDOMContent(this.popupContent);
  }

  ngOnInit() {
    this.map = new mapboxgl.Map({
      accessToken: 'pk.eyJ1IjoiemV1c2NoYXRvdWkiLCJhIjoiY2t3c2h0Yjk0MGo2NDJvcWh3azNwNnF6ZSJ9.ZBbZHpP2RFSzCUPkjfEvMQ',
      container: 'map',
      style: this.style,
      zoom: 11,
      center: [this.lng, this.lat],
      attributionControl:false
    });
    this.initializePopup();
    // Add map controls
    // this.map.addControl(new mapboxgl.NavigationControl());

    this.places.forEach(item => {
      let marker = new mapboxgl.Marker({color: "green"})
        .setLngLat(item.position)
        .addTo(this.map);
      
      marker.getElement().onclick = () => {
        marker.setPopup(this.createPopup(item));
      }

      return marker;
    })
    
    
  }
}

