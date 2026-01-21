import { Component, Inject, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-select-dataset-dialog',
    templateUrl: './select-dataset-dialog.component.html',
    styleUrls: ['./select-dataset-dialog.component.scss'],
    standalone: false
})
export class SelectDatasetDialogComponent implements OnInit {
  static readonly DEMO: number = -1;
  static readonly FULL_EVENT: number = -2;

  proceedClickedEvent: EventEmitter<string> = new EventEmitter<string>();

  readonly demoValue: number = SelectDatasetDialogComponent.DEMO;
  readonly fullEventValue: number = SelectDatasetDialogComponent.FULL_EVENT;

  loading: boolean = false;

  datasetForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<SelectDatasetDialogComponent>,
    private formBuilder: FormBuilder) {
  }
  
  ngOnInit(): void {
    this.datasetForm = this.formBuilder.group({
      dataset: ['', Validators.required]
    });
  }

  onProceedClick(): void {
    this.loading = true;
    this.proceedClickedEvent.emit(this.datasetForm.controls.dataset.value);
  }

}
