import { Component, OnInit, Inject, EventEmitter } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SessionAPI, ApiService } from '../shared/services/api.service';

@Component({
    selector: 'app-select-session-dialog',
    templateUrl: './select-session-dialog.component.html',
    styleUrls: ['./select-session-dialog.component.scss'],
    standalone: false
})
export class SelectSessionDialogComponent implements OnInit {
  public proceedClickedEvent: EventEmitter<number> = new EventEmitter<number>();

  public loading: boolean = false;

  public form!: UntypedFormGroup;

  public sessions: SessionAPI[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<SelectSessionDialogComponent>,
    private formBuilder: UntypedFormBuilder,
    private apiService: ApiService) {
    
  }
  
  ngOnInit(): void {
    this.form = this.formBuilder.group({
      session: ['', Validators.required]
    });

    this.apiService.getSessions().subscribe((res: SessionAPI[]) => {
      this.sessions = res;
    });
  }

  public onProceedClick(): void {
    this.loading = true;
    this.proceedClickedEvent.emit(this.form.controls.session.value);
  }

}
