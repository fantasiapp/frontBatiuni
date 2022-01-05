import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { HammerModule } from "@angular/platform-browser";
import { SharedModule } from "../shared/shared.module";
import { HelloComponent } from "./components/hello.component";
import { AppRoutingModule } from "./routing/app-routing.module";

@NgModule({
  declarations: [
    HelloComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    AppRoutingModule,
    HammerModule,
  ],
  exports: [
    HelloComponent
  ]
})
export class DesktopModule {}