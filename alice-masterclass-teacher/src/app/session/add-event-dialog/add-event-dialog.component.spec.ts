import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { AngularModule } from '../../shared/angular.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ApiService } from '../../shared/services/api.service';

import { AddEventDialogComponent } from './add-event-dialog.component';

describe('AddEventDialogComponent', () => {
  let component: AddEventDialogComponent;
  let fixture: ComponentFixture<AddEventDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [AddEventDialogComponent],
    imports: [AngularModule, SharedModule],
    providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useFactory: () => jasmine.createSpyObj('MatDialogRef', ['close']) },
        ApiService,
        provideHttpClient(withInterceptorsFromDi())
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEventDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
