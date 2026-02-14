import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { TranslateModule } from '@ngx-translate/core';
import { ElectronService } from './core/services';
import { ApiService } from './shared/services/api.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NavModule } from './nav/nav.module';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [AppComponent],
    imports: [RouterTestingModule,
        TranslateModule.forRoot(),
        NavModule],
    providers: [ElectronService, ApiService, provideHttpClient(withInterceptorsFromDi())]
}).compileComponents();
  }));

  it('should create the app', waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
