import { Component, OnInit, Inject, EventEmitter } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventAPI, ApiService } from '../shared/services/api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-select-event-dialog',
  templateUrl: './select-event-dialog.component.html',
  styleUrls: ['./select-event-dialog.component.scss']
})
export class SelectEventDialogComponent implements OnInit {

  public proceedClickedEvent: EventEmitter<number> = new EventEmitter<number>();

  public loading: boolean = false;

  public form!: UntypedFormGroup;

  public events: EventAPI[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<SelectEventDialogComponent>,
    private formBuilder: UntypedFormBuilder,
    private apiService: ApiService) {
    
  }
  
  ngOnInit(): void {
    this.form = this.formBuilder.group({
      event: ['', Validators.required]
    });

    this.apiService.getEvents().subscribe((res: EventAPI[]) => {
      this.events = res;
    }, (error: HttpErrorResponse) => {
      console.trace();
    });
  }

  public onProceedClick(): void {
    this.loading = true;
    this.proceedClickedEvent.emit(this.form.controls.event.value);
  }

}
