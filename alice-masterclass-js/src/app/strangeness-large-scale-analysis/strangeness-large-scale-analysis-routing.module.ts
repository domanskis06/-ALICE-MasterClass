import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { StrangenessLargeScaleAnalysisComponent } from './strangeness-large-scale-analysis.component';

const routes: Routes = [
  {
    path: 'strangeness-large-scale-analysis',
    component: StrangenessLargeScaleAnalysisComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StrangenessLargeScaleAnalysisRoutingModule {}
