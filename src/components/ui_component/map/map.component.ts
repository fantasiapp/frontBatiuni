import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

export type MarkerData = {
  position: { lat: number; lng: number; }
  title: string;
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
  constructor() {
  }

  places = [
    [2.352558675604982, 48.83011647720049],
    [2.3114995493, 48.8611235443],
    [2.285813409112486, 48.850739049625446],
    [2.268915048260837, 48.85421018352511]
  ];

  popupContent!: Node;

  initializePopup() {
    let span = document.createElement('span');
    span.classList.add('mapbox-popup-content');
    span.innerText = "Hello world";
    span.onclick = () => { console.log('yeah'); };

    this.popupContent = span;
    console.log(this.popupContent);
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
    this.places.forEach(item =>
      new mapboxgl.Marker({color: "green"})
      .setLngLat([item[0], item[1]])
      .setPopup(new mapboxgl.Popup().setDOMContent(this.popupContent.cloneNode(true))) // add popup
      .addTo(this.map)
    )

    
  }
}

