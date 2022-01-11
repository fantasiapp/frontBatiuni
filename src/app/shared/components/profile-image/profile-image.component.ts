import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { User } from "src/models/user/user.model";
import { ImageGenerator } from "../../services/image-generator.service";
@Component({
  selector: 'profile-image',
  templateUrl: './profile-image.component.html',
  styleUrls: ['./profile-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIProfileImageComponent {

  @Input()
  src: string | null = null;

  @Input()
  user?: User;
  
  constructor(private imageGenerator: ImageGenerator) {}

  ngOnInit() {
    if ( this.user ) {
      const fullname = this.user.profile!.firstName[0].toUpperCase() + this.user.profile!.lastName[0].toUpperCase();
      this.src = this.user.imageUrl || this.imageGenerator.generate(fullname);
    }
  }

  static getAvailabilityColor(availability: number) {
    switch(availability) {
      case 0: return '#B9EDAF';
      case 1: return '#FFC425';
      case 2: return '#E80000';
      default: return '#aaaaaa';
    }
  }
};