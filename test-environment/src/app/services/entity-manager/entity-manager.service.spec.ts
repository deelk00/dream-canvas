import { TestBed } from '@angular/core/testing';

import { EntityManagerService } from './entity-manager.service';

describe('EntityManagerService', () => {
  let service: EntityManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntityManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
