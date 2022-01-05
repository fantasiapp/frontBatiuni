import { environment } from 'src/environments/environment';
import { Injectable, NgModule } from '@angular/core';
import { BrowserModule, } from '@angular/platform-browser';
import { NgxsModule } from '@ngxs/store';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AuthState } from 'src/models/auth/auth.state';
import { HttpClientModule } from '@angular/common/http';
import { AppState } from './app.state';
import { CommonModule } from '@angular/common';

import { HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';
import { UserState } from 'src/models/user/user.state';

import { GlobalRoutingModule } from './app.routing-module';

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
      AppState, AuthState, UserState
    ], {
      developmentMode: !environment.production
    }),
    NgxsStoragePluginModule.forRoot({
      key: ['app.auth.token', 'app.user']
    }),
    NgxsRouterPluginModule.forRoot(),
    //Angular standard imports
    CommonModule,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    GlobalRoutingModule
  ],
  providers: [{
    provide: HAMMER_GESTURE_CONFIG,
    useClass: CustomConfig
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
