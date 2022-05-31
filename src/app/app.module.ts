import { environment } from 'src/environments/environment';
import { Injectable, LOCALE_ID, NgModule } from '@angular/core';
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

import { GlobalRoutingModule } from './app.routing-module';
import { HttpService } from './services/http.service';
import { SharedModule } from './shared/shared.module';

import { DataReader } from 'src/models/new/data.mapper';
import { DataState } from 'src/models/new/data.state';

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { ServiceWorkerModule } from '@angular/service-worker';
registerLocaleData(localeFr);

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
      AppState, AuthState, DataState
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
    HammerModule,
    SharedModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    DataReader,
    HttpService, {
    provide: HAMMER_GESTURE_CONFIG,
    useClass: CustomConfig
  }, {
    provide: HTTP_INTERCEPTORS,
    useClass: HttpService,
    multi: true
  }, {
    provide: LOCALE_ID,
    useValue: 'fr-FR'
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
