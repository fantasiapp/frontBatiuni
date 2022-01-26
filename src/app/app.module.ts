import { environment } from 'src/environments/environment';
import { Injectable, NgModule } from '@angular/core';
import { BrowserModule, HammerGestureConfig, HammerModule, HAMMER_GESTURE_CONFIG, } from '@angular/platform-browser';
import { NgxsModule } from '@ngxs/store';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AuthState } from 'src/models/auth/auth.state';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppState } from './app.state';
import { CommonModule } from '@angular/common';

import { UserState } from 'src/models/user/user.state';

import { GlobalRoutingModule } from './app.routing-module';
import { DataState } from 'src/models/data/data.state';
import { MiscState } from 'src/models/misc/misc.state';
import { HttpService } from './services/http.service';


@Injectable()
export class CustomConfig extends HammerGestureConfig {
  overrides: { [key: string]: Object; } = {
    'pinch': { enabled: false },
    'rotate': { enable: false },
    'swipe': { enable: true, direction: Hammer.DIRECTION_HORIZONTAL },
  };
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    //Ngxs imports
    NgxsModule.forRoot([
      AppState, AuthState, UserState, DataState, MiscState
    ], {
      developmentMode: !environment.production
    }),
    NgxsStoragePluginModule.forRoot({
      key: ['app.auth.token', 'app.user.imageUrl', 'app.user.viewType']
    }),
    NgxsRouterPluginModule.forRoot(),
    //Angular standard imports
    CommonModule,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    GlobalRoutingModule,
    HammerModule
  ],
  providers: [
    HttpService, {
    provide: HAMMER_GESTURE_CONFIG,
    useClass: CustomConfig
  }, {
    provide: HTTP_INTERCEPTORS,
    useClass: HttpService,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
