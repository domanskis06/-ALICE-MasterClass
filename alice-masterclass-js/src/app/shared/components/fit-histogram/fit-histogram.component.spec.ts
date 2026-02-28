import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularModule } from '../../angular.module';
import { SharedModule } from '../../shared.module';

import { FitHistogramComponent } from './fit-histogram.component';

describe('FitHistogramComponent', () => {
  let component: FitHistogramComponent;
  let fixture: ComponentFixture<FitHistogramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FitHistogramComponent ],
      imports: [
        AngularModule,
        SharedModule,
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FitHistogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
