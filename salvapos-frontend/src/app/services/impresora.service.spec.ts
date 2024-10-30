import { TestBed } from '@angular/core/testing';

import { ImpresoraService } from './impresora.service';

describe('ImpresoraService', () => {
  let service: ImpresoraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImpresoraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
