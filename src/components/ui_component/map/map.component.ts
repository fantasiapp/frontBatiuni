import { ChangeDetectionStrategy, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core'
import { MapInfoWindow, MapMarker, GoogleMap } from '@angular/google-maps'
import { styles } from './map.styles'

export type MarkerData = {
  position: { lat: number; lng: number; }
  title: string;
};

@Component({
    selector: 'map',
    templateUrl: 'map.component.html',
    styleUrls: ['map.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiMapComponent  {


}

