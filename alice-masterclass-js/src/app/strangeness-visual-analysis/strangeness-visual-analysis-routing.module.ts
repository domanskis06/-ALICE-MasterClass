import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { StrangenessVisualAnalysisComponent } from './strangeness-visual-analysis.component';

const routes: Routes = [
  {
    path: 'strangeness-visual-analysis',
    component: StrangenessVisualAnalysisComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StrangenessVisualAnalysisRoutingModule {}
