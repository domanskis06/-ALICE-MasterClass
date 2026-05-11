import { TestBed } from '@angular/core/testing';

import { FitService } from '../../shared/services/fit.service';
import { LsaTutorialService } from './lsa-tutorial.service';
import {
  LSA_TUTORIAL_STORAGE_KEY,
  LSA_TUTORIAL_STORAGE_VALUE_DISMISSED,
} from './lsa-tutorial.constants';

describe('LsaTutorialService', () => {
  let service: LsaTutorialService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LsaTutorialService, FitService],
    });
    service = TestBed.inject(LsaTutorialService);
    localStorage.removeItem(LSA_TUTORIAL_STORAGE_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(LSA_TUTORIAL_STORAGE_KEY);
  });

  it('shouldShow is true when storage empty', () => {
    expect(service.shouldShow()).toBeTrue();
  });

  it('dismiss persists flag and shouldShow becomes false', () => {
    service.dismiss();
    expect(localStorage.getItem(LSA_TUTORIAL_STORAGE_KEY)).toBe(LSA_TUTORIAL_STORAGE_VALUE_DISMISSED);
    expect(service.shouldShow()).toBeFalse();
  });

  it('clearDismissFlag removes storage', () => {
    service.dismiss();
    service.clearDismissFlag();
    expect(localStorage.getItem(LSA_TUTORIAL_STORAGE_KEY)).toBeNull();
    expect(service.shouldShow()).toBeTrue();
  });
});
