import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AngularModule } from '../shared/angular.module';
import { SharedModule } from '../shared/shared.module';

import { MatDialog } from '@angular/material/dialog';

import { ApiService, CentralityType, CollisionType, ParticleType, StrangenesLargeScaleAnalysisResultAPI } from '../shared/services/api.service';

import { CentralityNamePipe, StrangenessLargeScaleAnalysisComponent } from './strangeness-large-scale-analysis.component';
import { StrangenessEnhancementPlotComponent } from './strangeness-enhancement-plot/strangeness-enhancement-plot.component';
import { ResultsComponent } from './results/results.component';

describe('StrangenessLargeScaleAnalysisComponent', () => {
  let component: StrangenessLargeScaleAnalysisComponent;
  let fixture: ComponentFixture<StrangenessLargeScaleAnalysisComponent>;

  let service: ApiService;
  let spy1: jasmine.Spy;
  let spy2: jasmine.Spy;
  let dialog: MatDialog;
  let dialogSpy: jasmine.Spy;
  let dialogRefSpyObj = jasmine.createSpyObj({ afterClosed : of({}), close: null });
  dialogRefSpyObj.componentInstance = { body: '', proceedClickedEvent: of(0) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        StrangenessLargeScaleAnalysisComponent,
        StrangenessEnhancementPlotComponent,
        ResultsComponent,
        CentralityNamePipe
    ],
    imports: [AngularModule, SharedModule],
    providers: [ApiService, provideHttpClient(withInterceptorsFromDi())]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StrangenessLargeScaleAnalysisComponent);
    component = fixture.componentInstance;
    dialog = fixture.debugElement.injector.get(MatDialog);
    service = fixture.debugElement.injector.get(ApiService);

    spy1 = spyOn(service, 'autoRefresh').and.returnValue(false);
  });

  describe('with empty set', () => {
    beforeEach(() => {
      spy2 = spyOn(service, 'getStrangenessLargeScaleAnalysisResults').and.returnValue(of([]));
      dialogRefSpyObj.componentInstance = { body: '', proceedClickedEvent: of(0) };
  
      dialogSpy = spyOn(dialog, 'open').and.returnValue(dialogRefSpyObj);
  
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('with sample set', () => {
    const RESULTS: StrangenesLargeScaleAnalysisResultAPI[] = [
      {particle: ParticleType.KAON, collision: CollisionType.PBPB, centrality: CentralityType.C000_010, signal: [5, 10, 15]},
      {particle: ParticleType.LAMBDA, collision: CollisionType.PBPB, centrality: CentralityType.C000_010, signal: [5, 10, 15]},
      {particle: ParticleType.ANTI_LAMBDA, collision: CollisionType.PBPB, centrality: CentralityType.C000_010, signal: [5, 10, 15]},
    ];

    const eventID: number = 1;

    beforeEach(() => {
      spy2 = spyOn(service, 'getStrangenessLargeScaleAnalysisResults').and.returnValue(of(RESULTS));
      dialogRefSpyObj.componentInstance = { body: '', proceedClickedEvent: of(eventID) };
  
      dialogSpy = spyOn(dialog, 'open').and.returnValue(dialogRefSpyObj);
  
      fixture.detectChanges();
    });

    it('should have fetched data from correct event', () => {
      expect(spy2).toHaveBeenCalledWith(eventID);
    });
  });
});
