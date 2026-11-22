import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeStore } from '../../services/resume-store.service';
import { FormInputComponent } from '../ui/form-input.component';
import { SectionVisibilityToggleComponent } from '../ui/section-visibility-toggle.component';

@Component({
  selector: 'app-summary-form',
  standalone: true,
  imports: [CommonModule, FormInputComponent, SectionVisibilityToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="form-container">
      <div class="form-section-header">
        <div class="header-info">
          <div class="header-icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div class="header-text">
            <h1>Professional Summary</h1>
            <p>A brief, impactful overview of your career background and key strengths</p>
          </div>
        </div>
        <div class="header-action">
          <app-section-visibility-toggle
            [isHidden]="!!store.hiddenSections()['summary']"
            (toggle)="store.toggleSectionVisibility('summary')"
          />
        </div>
      </div>

      <div class="nuxt-card">
        <div class="form-vertical-flow">
          <app-form-input
            label="Summary Statement"
            kind="textarea"
            [rows]="8"
            placeholder="High-impact software engineer with 6+ years of experience architecting resilient web platforms..."
            helpText="Keep it punchy: 3–5 sentences highlighting your core domains, technical strengths, and track record."
            [value]="store.basics().summary || ''"
            (valueChange)="store.updateBasics('summary', $event)"
          />
        </div>
      </div>
    </div>
  `
})
export class SummaryFormComponent {
  readonly store = inject(ResumeStore);
}
