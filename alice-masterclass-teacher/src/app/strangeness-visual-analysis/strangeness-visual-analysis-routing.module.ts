import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../shared/services/auth.guard';

import { StrangenessVisualAnalysisComponent } from './strangeness-visual-analysis.component';

const routes: Routes = [
  {
    path: 'strangeness-visual-analysis',
    component: StrangenessVisualAnalysisComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StrangenessVisualAnalysisRoutingModule {}
