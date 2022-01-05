import { ChangeDetectionStrategy, Component, HostBinding, Input } from "@angular/core";
import { UIProfileImageComponent } from "src/app/shared/components/profile-image/profile-image.component";

@Component({
  selector: 'sos-card',
  template: `
    <div class="presentation">
      <profile-image></profile-image>
      <stars value="4"></stars>
    </div>
    <div class="description flex column space-between">
      <span>Nom de l'entreprise</span>
      <span style="font-weight: 200;">Adresse de l'entreprise</span>
      <span class="text-light-emphasis job">Métier</span>
    </div>
  `,
  styleUrls: ['./SOSCard.ui.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UISOSCard {

  @HostBinding('style.border-left-color')
  get borderColor() {
    return UIProfileImageComponent.getAvailabilityColor(this.availability);
  }

  availability: number = Math.floor(Math.random() * 2);
};