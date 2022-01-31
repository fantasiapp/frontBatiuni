import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { DocusignPage } from "./shared/components/docusign_page/docusign.page";

@NgModule({
  imports: [
    RouterModule.forRoot([{
      path: '',
      loadChildren: () => {
        return window.innerWidth > 768 ?
          import('./desktop/desktop.module').then(module => module.DesktopModule) :
          import('./mobile/mobile.module').then(module => module.MobileModule)
      }
    },
  
])
  ],
  exports: [RouterModule]
})
export class GlobalRoutingModule {

};