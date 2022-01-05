import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HelloComponent } from "../components/hello.component";

const routes: Routes =[{
    path: 'landing',
    component: HelloComponent
  },{
    path: '**',
    redirectTo: 'landing'
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}