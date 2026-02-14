import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AngularModule } from '../../shared/angular.module';
import { FitService } from '../../shared/services/fit.service';
import { SharedModule } from '../../shared/shared.module';

import { HistogramDisplayComponent } from './histogram-display.component';

describe('HistogramDisplayComponent', () => {
  let component: HistogramDisplayComponent;
  let fixture: ComponentFixture<HistogramDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistogramDisplayComponent ],
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
    fixture = TestBed.createComponent(HistogramDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
