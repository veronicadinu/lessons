import { TestBed } from '@angular/core/testing';

import { HtmltotextService } from './htmltotext.service';

describe('HtmltotextService', () => {
  let service: HtmltotextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HtmltotextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
