import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MakeAdForm } from "./forms/MakeAd.form";
import { OnlineFilterForm } from "./forms/OnlineFilter.form";
import { PMEFilterForm } from "./forms/PMEFilter.form";
import { SOSFilterForm } from "./forms/SOSFilter.form";
import { STFilterForm } from "./forms/STFilter.form";
import { NgxSliderModule } from "@angular-slider/ngx-slider";
import { OptionsModel } from "./components/options/options";
import { UIBoxComponent } from "./components/box/box.component";
import { UiMapComponent } from "./components/map/map.component";
import { UINumberComponent } from "./components/number/number.component";
import { UIProfileImageComponent } from "./components/profile-image/profile-image.component";
import { SearchbarComponent } from "./components/searchbar/searchbar.component";
import { StarSysteme } from "./components/starsysteme/star.systeme";
import { UIStarsComponent } from "./components/stars/stars.component";
import { UISwitchComponent } from "./components/switch/switch.component";
import { FileUI } from "./components/filesUI/files.ui";

@NgModule({
  declarations: [
    UIBoxComponent,
    UiMapComponent,
    UINumberComponent,
    OptionsModel,
    UIProfileImageComponent,
    SearchbarComponent,
    UIStarsComponent,
    StarSysteme,
    UISwitchComponent,
    FileUI,
    MakeAdForm,
    STFilterForm,
    PMEFilterForm,
    SOSFilterForm,
    OnlineFilterForm
  ],
  imports: [
    CommonModule,
    NgxSliderModule
  ],
  exports: [
    OptionsModel,
    MakeAdForm,
    STFilterForm,
    PMEFilterForm,
    SOSFilterForm,
    OnlineFilterForm,
    UIBoxComponent,
    UiMapComponent,
    UINumberComponent,
    OptionsModel,
    UIProfileImageComponent,
    SearchbarComponent,
    UIStarsComponent,
    StarSysteme,
    UISwitchComponent,
    FileUI
  ]
})
export class SharedModule {}