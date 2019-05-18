import { TestBed } from '@angular/core/testing';

import { TagFreqService } from './tag-freq.service';

describe('TagFreqService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TagFreqService = TestBed.get(TagFreqService);
    expect(service).toBeTruthy();
  });
});
