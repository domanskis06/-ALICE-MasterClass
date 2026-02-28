import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService, Session } from '../shared/services/api.service';

@Component({
    selector: 'auth-dialog',
    templateUrl: './auth-dialog.component.html',
    styleUrls: ['./auth-dialog.component.scss'],
    standalone: false
})
export class AuthDialogComponent implements OnInit {

  hide: boolean = true;

  loading: boolean = false;

  tokenForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<AuthDialogComponent>,
    private apiService: ApiService,
    private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    let password = null, studentID = null;

    if (this.data !== null) {
      password = this.data.password;
      studentID = this.data.studentID;
    }

    this.tokenForm = this.formBuilder.group({
      'id': [studentID, Validators.required],
      'password': [password, Validators.required]
    });
  }

  onProceedClick(): void {
    this.loading = true;

    this.apiService.authenticate(this.tokenForm.controls.password.value, this.tokenForm.controls.id.value).subscribe(
      (data: Session) => {
        this.loading = false;

        if (data.error) {
          this.tokenForm.controls.password.setErrors({'incorrect': true});
        } else {
          this.tokenForm.controls.password.setErrors(null);
          this.dialogRef.close();
        }
      },
      (error: HttpErrorResponse) => {
        this.loading = false;
      });
  }

}
