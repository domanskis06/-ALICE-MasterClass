import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { AngularModule } from '../shared/angular.module';
import { FitService } from '../shared/services/fit.service';
import { SharedModule } from '../shared/shared.module';

import { InstructionsComponent } from './instructions/instructions.component';
import { HistogramSelectorComponent } from './histogram-selector/histogram-selector.component';
import { FitSelectorComponent } from './fit-selector/fit-selector.component';
import { HistogramDisplayComponent } from './histogram-display/histogram-display.component';
import { ResultsComponent } from './results/results.component';

import { StrangenessLargeScaleAnalysisComponent } from './strangeness-large-scale-analysis.component';

describe('StrangenessLargeScaleAnalysisComponent', () => {
  let component: StrangenessLargeScaleAnalysisComponent;
  let fixture: ComponentFixture<StrangenessLargeScaleAnalysisComponent>;

  let dialog: MatDialog;
  let dialogSpy: jasmine.Spy;
  let dialogRefSpyObj = jasmine.createSpyObj({ afterClosed : of({}), close: null });
  dialogRefSpyObj.componentInstance = { body: '', proceedClickedEvent: of('0') };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        StrangenessLargeScaleAnalysisComponent,
        InstructionsComponent,
        HistogramSelectorComponent,
        FitSelectorComponent,
        HistogramDisplayComponent,
        ResultsComponent
    ],
    imports: [AngularModule,
        SharedModule,
        TranslateModule.forRoot()],
    providers: [FitService, provideHttpClient(withInterceptorsFromDi())]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StrangenessLargeScaleAnalysisComponent);
    component = fixture.componentInstance;
    dialog = fixture.debugElement.injector.get(MatDialog);

    dialogSpy = spyOn(dialog, 'open').and.returnValue(dialogRefSpyObj);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
