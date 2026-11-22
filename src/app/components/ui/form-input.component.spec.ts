import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormInputComponent } from './form-input.component';
import { FormsModule } from '@angular/forms';

describe('FormInputComponent', () => {
  let component: FormInputComponent;
  let fixture: ComponentFixture<FormInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormInputComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(FormInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the form input component', () => {
    expect(component).toBeTruthy();
  });

  it('should handle value updates', () => {
    component.onValueChange('Software Architect');
    expect(component.value()).toBe('Software Architect');

    component.onValueChange('');
    expect(component.value()).toBe('');
  });

  it('should parse comma-separated tags into an array', () => {
    component.onTagsChange('Angular, TypeScript, Docker, ');
    expect(component.tagsValue()).toEqual(['Angular', 'TypeScript', 'Docker']);

    const csv = component.tagsToCsv(['Rust', 'WebAssembly']);
    expect(csv).toBe('Rust, WebAssembly');
    expect(component.tagsToCsv(null)).toBe('');
  });

  it('should parse newline-separated bullets into an array', () => {
    component.onBulletsChange('• First achievement\n• Second achievement\n\n');
    expect(component.bulletsValue()).toEqual(['• First achievement', '• Second achievement']);

    const text = component.bulletsToText(['Point 1', 'Point 2']);
    expect(text).toBe('Point 1\nPoint 2');
    expect(component.bulletsToText(null)).toBe('');
  });
});
