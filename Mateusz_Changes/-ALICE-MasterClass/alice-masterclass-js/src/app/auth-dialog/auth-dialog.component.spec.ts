import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AngularModule } from '../shared/angular.module';
import { SharedModule } from '../shared/shared.module';

import { AuthDialogComponent } from './auth-dialog.component';
import { ApiService } from '../shared/services/api.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { of } from 'rxjs';

describe('AuthDialogComponent', () => {
  let component: AuthDialogComponent;
  let fixture: ComponentFixture<AuthDialogComponent>;
  let service: ApiService;
  let spy: jasmine.Spy;
  let dialogRefSpy;

  const studentID: number = 1;
  const password: string = 'test';

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    await TestBed.configureTestingModule({
    declarations: [AuthDialogComponent],
    imports: [AngularModule,
        SharedModule,
        TranslateModule.forRoot()],
    providers: [
        { provide: MAT_DIALOG_DATA, useValue: { studentID: studentID, password: password } },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        FormBuilder,
        ApiService,
        provideHttpClient(withInterceptorsFromDi())
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthDialogComponent);
    component = fixture.componentInstance;
    service = fixture.debugElement.injector.get(ApiService);

    spy = spyOn(service, 'authenticate').and.returnValue(of({error: false, name: 'test-session'}));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should suggest studentID and password', () => {
    expect(component.tokenForm.controls.id.value).toBe(studentID);
    expect(component.tokenForm.controls.password.value).toBe(password);
  });

  it('should close the dialog when proceed is clicked', () => {
    component.onProceedClick();

    expect(spy).toHaveBeenCalled();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });
});
