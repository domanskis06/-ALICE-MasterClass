import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularModule } from '../../angular.module';
import { SharedModule } from '../../shared.module';

import { SpinnerContainerComponent } from './spinner-container.component';

describe('SpinnerContainerComponent', () => {
  let component: SpinnerContainerComponent;
  let fixture: ComponentFixture<SpinnerContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpinnerContainerComponent ],
      imports: [
        AngularModule,
        SharedModule,
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpinnerContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
