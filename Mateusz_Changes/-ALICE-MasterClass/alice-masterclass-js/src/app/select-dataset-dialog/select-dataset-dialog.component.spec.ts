import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { AngularModule } from '../shared/angular.module';
import { SharedModule } from '../shared/shared.module';

import { SelectDatasetDialogComponent } from './select-dataset-dialog.component';

describe('SelectDatasetDialogComponent', () => {
  let component: SelectDatasetDialogComponent;
  let fixture: ComponentFixture<SelectDatasetDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectDatasetDialogComponent ],
      imports: [
        AngularModule,
        SharedModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useFactory: () => jasmine.createSpyObj('MatDialogRef', ['close']) },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectDatasetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit event when button is clicked', () => {
    const button: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('button');

    const datasetID: string = '1';

    component.datasetForm.controls.dataset.setValue(datasetID);
    fixture.detectChanges();

    spyOn(component.proceedClickedEvent, 'emit');

    button.click();

    expect(component.proceedClickedEvent.emit).toHaveBeenCalled();
    expect(component.proceedClickedEvent.emit).toHaveBeenCalledWith(datasetID);
  });
});
