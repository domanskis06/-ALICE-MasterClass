import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngularModule } from '../../shared/angular.module';

import { StrangenessEnhancementPlotComponent } from './strangeness-enhancement-plot.component';

describe('StrangenessEnhancementPlotComponent', () => {
  let component: StrangenessEnhancementPlotComponent;
  let fixture: ComponentFixture<StrangenessEnhancementPlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StrangenessEnhancementPlotComponent ],
      imports: [ AngularModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StrangenessEnhancementPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
