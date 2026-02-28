import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AngularModule } from '../../shared/angular.module';
import { FitService } from '../../shared/services/fit.service';
import { SharedModule } from '../../shared/shared.module';

import { FitSelectorComponent } from './fit-selector.component';

describe('FitSelectorComponent', () => {
  let component: FitSelectorComponent;
  let fixture: ComponentFixture<FitSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FitSelectorComponent ],
      imports: [
        AngularModule,
        SharedModule,
        TranslateModule.forRoot()
      ],
      providers: [ FitService ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FitSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
