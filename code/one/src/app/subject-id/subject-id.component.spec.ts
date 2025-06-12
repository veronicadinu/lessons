import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectIdComponent } from './subject-id.component';

describe('SubjectIdComponent', () => {
  let component: SubjectIdComponent;
  let fixture: ComponentFixture<SubjectIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectIdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
