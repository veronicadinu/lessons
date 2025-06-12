import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonIdComponent } from './lesson-id.component';

describe('LessonIdComponent', () => {
  let component: LessonIdComponent;
  let fixture: ComponentFixture<LessonIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonIdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LessonIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
