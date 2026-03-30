import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from 'src/app/shared/services/api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-add-event-dialog',
  templateUrl: './add-event-dialog.component.html',
  styleUrls: ['./add-event-dialog.component.scss']
})
export class AddEventDialogComponent implements OnInit {

  public hide: boolean = true;
  public loading: boolean = false;

  public form!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<AddEventDialogComponent>,
    private formBuilder: FormBuilder,
    private apiService: ApiService) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
    });
  }

  onCreateButtonClicked(): void {
    this.loading = true;

    const body = {
      name: this.form.controls.name.value
    }

    this.apiService.createEvent(body).subscribe(() => {
      this.loading = false;
      this.dialogRef.close();
    }, (error: HttpErrorResponse) => {
      if (error.status === 409) {
        this.form.controls.name.setErrors({'incorrect': true});
      }
      this.loading = false;
    })
  }

}
