import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../shared/services/auth.guard';

import { SessionComponent } from './session.component';

const routes: Routes = [
  {
    path: 'session',
    component: SessionComponent,
    canActivate: [AuthGuard],
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SessionRoutingModule {}
