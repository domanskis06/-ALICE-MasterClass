import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { HttpClientModule } from '@angular/common/http';
import { AngularModule } from '../shared/angular.module';
import { SharedModule } from '../shared/shared.module';

import { MatDialog } from '@angular/material/dialog';

import { ApiService, VisualAnalysisResultAPI } from '../shared/services/api.service';

import { StrangenessVisualAnalysisComponent } from './strangeness-visual-analysis.component';
import { MassHistogramsComponent } from './mass-histograms/mass-histograms.component';
import { ResultsComponent } from './results/results.component';

describe('StrangenessVisualAnalysisComponent', () => {
  let component: StrangenessVisualAnalysisComponent;
  let fixture: ComponentFixture<StrangenessVisualAnalysisComponent>;

  let service: ApiService;
  let spy: jasmine.Spy;
  let dialog: MatDialog;
  let dialogSpy: jasmine.Spy;
  let dialogRefSpyObj = jasmine.createSpyObj({ afterClosed : of({}), close: null });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        StrangenessVisualAnalysisComponent,
        MassHistogramsComponent,
        ResultsComponent
      ],
      imports: [ HttpClientModule, AngularModule, SharedModule ],
      providers: [ ApiService ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StrangenessVisualAnalysisComponent);
    component = fixture.componentInstance;
    dialog = fixture.debugElement.injector.get(MatDialog);
    service = fixture.debugElement.injector.get(ApiService);
  });

  describe('with empty set', () => {
    beforeEach(() => {
      spy = spyOn(service, 'getStrangenessVisualAnalysisResults').and.returnValue(of([]));
      dialogRefSpyObj.componentInstance = { body: '', proceedClickedEvent: of(0) };
  
      dialogSpy = spyOn(dialog, 'open').and.returnValue(dialogRefSpyObj);
  
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('with sample set', () => {
    const RESULTS: VisualAnalysisResultAPI[] = [
      {student: 0, dataset: 0, k0: [0.49, 0.48, 0.5], lambda: [], antilambda: [], xi: []},
      {student: 1, dataset: 1, k0: [0.485, 0.49, 0.49], lambda: [], antilambda: [], xi: []},
      {student: 2, dataset: 3, k0: [0.485, 0.49, 0.49], lambda: [], antilambda: [], xi: []},
    ];

    const sessionID: number = 1;

    beforeEach(() => {
      spy = spyOn(service, 'getStrangenessVisualAnalysisResults').and.returnValue(of(RESULTS));
      dialogRefSpyObj.componentInstance = { body: '', proceedClickedEvent: of(sessionID) };
  
      dialogSpy = spyOn(dialog, 'open').and.returnValue(dialogRefSpyObj);
  
      fixture.detectChanges();
    });

    it('should have fetched data from correct session', () => {
      expect(spy).toHaveBeenCalledWith(sessionID);
    });

    it('should select and deselect all student entries if requested', () => {
      component.onAllSelected(true);

      for(let i in component.studentResults) {
        expect(component.studentResults[i].selected).toBe(true);
      }

      component.onAllSelected(false);

      for(let i in component.studentResults) {
        expect(component.studentResults[i].selected).toBe(false);
      }
    });

    it('should select and deselect specific entry if requested', () => {
      const student1 = 1;
      const student2 = 2;

      component.onStudentSelected({student: student1, selected: true});

      for(let r of component.studentResults) {
        if (r.student == student1) {
          expect(r.selected).toBe(true);
        } else {
          expect(r.selected).toBe(false);
        }
      }

      component.onStudentSelected({student: student2, selected: true});

      for(let r of component.studentResults) {
        if (r.student == student1 || r.student == student2) {
          expect(r.selected).toBe(true);
        } else {
          expect(r.selected).toBe(false);
        }
      }

      component.onStudentSelected({student: student1, selected: false});

      for(let r of component.studentResults) {
        if (r.student == student2) {
          expect(r.selected).toBe(true);
        } else {
          expect(r.selected).toBe(false);
        }
      }

      component.onStudentSelected({student: student2, selected: false});

      for(let r of component.studentResults) {
        expect(r.selected).toBe(false);
      }
    });
  });
});
