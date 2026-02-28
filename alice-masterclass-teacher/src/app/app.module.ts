import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthGuard } from './shared/services/auth.guard';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';

import { AngularModule } from './shared/angular.module';
import { SharedModule } from './shared/shared.module';
import { SessionUrlPipe, SessionComponent } from './session/session.component';
import { AddSessionDialogComponent } from './session/add-session-dialog/add-session-dialog.component';
import { SelectSessionDialogComponent } from './select-session-dialog/select-session-dialog.component';

import { StrangenessVisualAnalysisModule } from './strangeness-visual-analysis/strangeness-visual-analysis.module';
import { StrangenessLargeScaleAnalysisModule } from './strangeness-large-scale-analysis/strangeness-large-scale-analysis.module';
import { ConfirmDialogComponent } from './session/confirm-dialog/confirm-dialog.component';
import { AddEventDialogComponent } from './session/add-event-dialog/add-event-dialog.component';
import { SelectEventDialogComponent } from './select-event-dialog/select-event-dialog.component';
import { LoginComponent } from './login/login.component';
import { UnauthorizedInterceptor } from './shared/unauthorized.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    SessionUrlPipe,
    SessionComponent,
    AddSessionDialogComponent,
    SelectSessionDialogComponent,
    ConfirmDialogComponent,
    AddEventDialogComponent,
    SelectEventDialogComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AngularModule,
    SharedModule,
    StrangenessVisualAnalysisModule,
    StrangenessLargeScaleAnalysisModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: UnauthorizedInterceptor, multi: true },
    AuthGuard,
    SessionUrlPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
