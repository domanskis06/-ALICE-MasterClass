import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';
import { EventAPI, ApiService } from 'src/app/shared/services/api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-add-session-dialog',
  templateUrl: './add-session-dialog.component.html',
  styleUrls: ['./add-session-dialog.component.scss']
})
export class AddSessionDialogComponent implements OnInit {

  public hide: boolean = true;
  public loading: boolean = false;

  public form!: FormGroup;

  public events: EventAPI[] = [];

  private nameGeneratorConfig: Config = {
    dictionaries: [adjectives, colors, animals],
    separator: '-',
    length: 3  
  };

  private passwordGeneratorConfig: Config = {
    dictionaries: [colors, animals, colors],
    separator: '-',
    length: 3  
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<AddSessionDialogComponent>,
    private formBuilder: FormBuilder,
    private apiService: ApiService) {
  }

  ngOnInit(): void {
    const preselectedEvent = this.data?.eventName ?? '';
    this.form = this.formBuilder.group({
      event: [preselectedEvent, Validators.required],
      name: [uniqueNamesGenerator(this.nameGeneratorConfig), Validators.required],
      password: [uniqueNamesGenerator(this.passwordGeneratorConfig), Validators.required],
      maxStudents: [15, Validators.required],
    });

    this.apiService.getEvents().subscribe((res: EventAPI[]) => {
      this.events = res;
      if (preselectedEvent && this.events.some(e => e.name === preselectedEvent)) {
        this.form.controls.event.setValue(preselectedEvent);
      }
    }, (error: HttpErrorResponse) => {
      console.trace();
    });
  }

  generateName(): void {
      this.form.controls.name.setValue(uniqueNamesGenerator(this.nameGeneratorConfig));
  }

  generatePassword(): void {
    this.form.controls.name.setValue(uniqueNamesGenerator(this.passwordGeneratorConfig));
  }

  onCreateButtonClicked(): void {
    this.loading = true;

    const body = {
      event: this.form.controls.event.value,
      name: this.form.controls.name.value,
      password: this.form.controls.password.value,
      maxStudents: this.form.controls.maxStudents.value
    }

    this.apiService.createSession(body).subscribe(() => {
      this.loading = false;
      this.dialogRef.close();
    }, (error: HttpErrorResponse) => {
      if (error.status === 409) {
        this.form.controls.password.setErrors({'incorrect': true});
      }
      this.loading = false;
    });
  }

}
