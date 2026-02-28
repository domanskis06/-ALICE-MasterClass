import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../shared/services/auth.guard';

import { StrangenessLargeScaleAnalysisComponent } from './strangeness-large-scale-analysis.component';

const routes: Routes = [
  {
    path: 'strangeness-large-scale-analysis',
    component: StrangenessLargeScaleAnalysisComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StrangenessLargeScaleAnalysisRoutingModule {}
