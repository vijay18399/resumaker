import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormSection } from '../../services/resume-store.service';

export interface NavSectionItem {
  id: FormSection;
  label: string;
  iconSvg: string;
}

export interface TreeSubItem {
  id: string;
  label: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./sidebar.component.scss'],
  template: `
    <nav class="form-sidenav">
      <div class="sidenav-list">
        @for (sec of sections(); track sec.id) {
          <div class="nav-item"
            [class.active]="activeSection() === sec.id"
            [class.is-hidden]="hiddenSections()[sec.id]"
            (click)="selectSection.emit(sec.id)">
            <span class="nav-icon" [innerHTML]="sanitizeIcon(sec.iconSvg)"></span>
            <span class="nav-label">{{ sec.label }}</span>

            @if (sec.id !== 'basics') {
              <button type="button" class="btn-visibility-toggle"
                (click)="$event.stopPropagation(); toggleVisibility.emit(sec.id)"
                [class.hidden-sec]="hiddenSections()[sec.id]"
                [title]="hiddenSections()[sec.id] ? 'Show Section in Preview' : 'Hide Section from Preview'">
                @if (!hiddenSections()[sec.id]) {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                } @else {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24">
                    </path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                }
              </button>
            }
          </div>
        }
      </div>
    </nav>
  `
})
export class SidebarComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly sections = input.required<NavSectionItem[]>();
  readonly activeSection = input.required<FormSection>();
  readonly hiddenSections = input.required<Record<string, boolean | undefined>>();

  readonly selectSection = output<FormSection>();
  readonly toggleVisibility = output<string>();

  private readonly iconCache = new Map<string, SafeHtml>();

  sanitizeIcon(svg: string): SafeHtml {
    let safe = this.iconCache.get(svg);
    if (!safe) {
      safe = this.sanitizer.bypassSecurityTrustHtml(svg);
      this.iconCache.set(svg, safe);
    }
    return safe;
  }
}
