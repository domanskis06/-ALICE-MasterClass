import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { of } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';

import { AngularModule } from '../shared/angular.module';
import { FitService } from '../shared/services/fit.service';
import { SharedModule } from '../shared/shared.module';

import { ParticleMassComponent } from './particle-mass/particle-mass.component';
import { CalculatorComponent } from './calculator/calculator.component';
import { MassHistogramsComponent } from './mass-histograms/mass-histograms.component';
import { InstructionsComponent } from './instructions/instructions.component';

import { StrangenessVisualAnalysisComponent } from './strangeness-visual-analysis.component';

describe('StrangenessVisualAnalysisComponent', () => {
  let component: StrangenessVisualAnalysisComponent;
  let fixture: ComponentFixture<StrangenessVisualAnalysisComponent>;

  let dialog: MatDialog;
  let dialogSpy: jasmine.Spy;
  let dialogRefSpyObj = jasmine.createSpyObj({ afterClosed : of({}), close: null });
  dialogRefSpyObj.componentInstance = { body: '', proceedClickedEvent: of('0') };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        StrangenessVisualAnalysisComponent,
        ParticleMassComponent,
        CalculatorComponent,
        MassHistogramsComponent,
        InstructionsComponent
    ],
    imports: [AngularModule,
        SharedModule,
        TranslateModule.forRoot()],
    providers: [FitService, provideHttpClient(withInterceptorsFromDi())]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StrangenessVisualAnalysisComponent);
    component = fixture.componentInstance;
    dialog = fixture.debugElement.injector.get(MatDialog);

    dialogSpy = spyOn(dialog, 'open').and.returnValue(dialogRefSpyObj);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
