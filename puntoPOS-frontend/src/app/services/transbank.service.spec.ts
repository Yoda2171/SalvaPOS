import { TestBed } from '@angular/core/testing';

import { TransbankService } from './transbank.service';

describe('TransbankService', () => {
  let service: TransbankService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransbankService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
