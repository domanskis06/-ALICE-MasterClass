import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { ApiService } from '../shared/services/api.service';

import { LoginComponent } from './login.component';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { AuthGuard } from '../shared/services/auth.guard';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let service: ApiService;
  let router: Router;

  let spyRedirectOAuth: jasmine.Spy;
  let spySkipToken: jasmine.Spy;

  const TOKEN: string = 'test-token';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [LoginComponent],
    imports: [RouterTestingModule],
    providers: [ApiService, provideHttpClient(withInterceptorsFromDi())]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    service = fixture.debugElement.injector.get(ApiService);
    router = fixture.debugElement.injector.get(Router);

    spyRedirectOAuth = spyOn<any>(component, 'redirectToOAuth');
    spySkipToken = spyOn<any>(component, 'skipTokenAuthentication').and.returnValue(false);
  });

  describe('with query param', () => {
    let spySetItem: jasmine.Spy;
    let spySetToken: jasmine.Spy;
    let spyGetQueryToken: jasmine.Spy;
    let spyNavigateUrl: jasmine.Spy;

    beforeEach(() => {
      spySetItem = spyOn(window.sessionStorage, 'setItem');
      spySetToken = spyOn(service, 'setAuthToken');
      spyGetQueryToken = spyOn<any>(component, 'getQueryToken').and.returnValue(TOKEN);
      spyNavigateUrl = spyOn(router, 'navigateByUrl');

      fixture.detectChanges();
    });

    it('should have got query token', () => {
      expect(spyGetQueryToken).toHaveBeenCalled();
    });

    it('should have saved the token to session storage', () => {
      expect(spySetItem).toHaveBeenCalledWith(ApiService.TOKEN_KEY, TOKEN);
    });

    it('should have set the query token in the api service', () => {
      expect(spySetToken).toHaveBeenCalledWith(TOKEN);
    });

    it('should have redirected', () => {
      expect(spyNavigateUrl).toHaveBeenCalled();
    });
  });

  describe('with dummy token', () => {
    let spyGetItem: jasmine.Spy;
    let spySetToken: jasmine.Spy;
    let spyNavigateUrl: jasmine.Spy;

    beforeEach(() => {
      spyGetItem = spyOn(window.sessionStorage, 'getItem').and.returnValue(TOKEN);
      spySetToken = spyOn(service, 'setAuthToken');
      spyNavigateUrl = spyOn(router, 'navigateByUrl');

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have tried to read the token off sessionStorage', () => {
      expect(spyGetItem).toHaveBeenCalled();
    });

    it('should have set the dummy token in the api service', () => {
      expect(spySetToken).toHaveBeenCalledWith(TOKEN);
    });

    it('should have navigated to base url', () => {
      expect(spyNavigateUrl).toHaveBeenCalled();
    });
  });

  describe('with no token', () => {
    const OAUTH_URL: string = 'https://test-oauth/auth';
    const fetchResponse: any = { authorization_endpoint: OAUTH_URL };

    let spyFetchConfig: jasmine.Spy;

    beforeEach(() => {
      spyFetchConfig = spyOn<any>(component, 'fetchOpenIdConfig').and.returnValue(of(fetchResponse));
      fixture.detectChanges();
    });

    it('should have fetched openId config', () => {
      expect(spyFetchConfig).toHaveBeenCalled();
    });

    it('should have redirected to SSO', () => {
      expect(spyRedirectOAuth).toHaveBeenCalledWith(OAUTH_URL);
    });
  });
});
