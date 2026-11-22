import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { NAV_SECTIONS } from '../../models/section-nav.config';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('sections', NAV_SECTIONS);
    fixture.componentRef.setInput('activeSection', 'basics');
    fixture.componentRef.setInput('hiddenSections', {});
    fixture.detectChanges();
  });

  it('should create the sidebar component', () => {
    expect(component).toBeTruthy();
  });

  it('should sanitize and cache section icons', () => {
    const rawSvg = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
    const sanitized1 = component.sanitizeIcon(rawSvg);
    const sanitized2 = component.sanitizeIcon(rawSvg);
    expect(sanitized1).toBeTruthy();
    expect(sanitized1).toBe(sanitized2); // Caching check
  });
});
