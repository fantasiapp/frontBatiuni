import { ChangeDetectionStrategy, Component } from '@angular/core'
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

