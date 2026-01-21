import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { StrangenessDataService } from './strangeness-data.service';
import { ApiService } from '../shared/services/api.service';
import { TranslateModule } from '@ngx-translate/core';

describe('StrangenessDataService', () => {
  let service: StrangenessDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot()],
    providers: [ApiService, provideHttpClient(withInterceptorsFromDi())]
});
    service = TestBed.inject(StrangenessDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
