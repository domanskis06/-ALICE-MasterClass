import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { AngularModule } from '../shared/angular.module';
import { RouterModule } from '@angular/router';
import { LayoutModule } from '@angular/cdk/layout';

import { NavComponent } from './nav.component';

@NgModule({
  declarations: [NavComponent],
  imports: [CommonModule, SharedModule, AngularModule, RouterModule, LayoutModule],
  exports: [
    NavComponent
  ]
})
export class NavModule {}
