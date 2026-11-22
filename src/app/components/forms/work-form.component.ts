import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeStore } from '../../services/resume-store.service';
import { FormInputComponent } from '../ui/form-input.component';
import { SectionVisibilityToggleComponent } from '../ui/section-visibility-toggle.component';

@Component({
  selector: 'app-work-form',
  standalone: true,
  imports: [CommonModule, FormInputComponent, SectionVisibilityToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="form-container">
      <div class="form-section-header">
        <div class="header-info">
          <div class="header-icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <div class="header-text">
            <h1>Work Experience</h1>
            <p>Your professional positions, career history, and measurable impact</p>
          </div>
        </div>
        <div class="header-action">
          <app-section-visibility-toggle
            [isHidden]="!!store.hiddenSections()['work']"
            (toggle)="store.toggleSectionVisibility('work')"
          />
          <button type="button" class="btn-nuxt-primary" (click)="store.addWork()">
            + Add Position
          </button>
        </div>
      </div>

      <!-- Collection Cards -->
      <div class="flex flex-col gap-4">
        @for (job of store.work(); track job.id; let idx = $index) {
          <div class="nuxt-card collection-card" [id]="job.id">
            <div class="card-top-bar">
              <div class="card-item-title-group">
                <span class="index-pill">{{ idx + 1 }}</span>
                <span class="card-item-title">{{ job.position || 'Position Title' }}</span>
                <span class="card-item-subtitle" *ngIf="job.name">{{ job.name }}</span>
              </div>
              <div class="card-actions flex items-center gap-1">
                <button type="button" class="btn-icon-subtle" (click)="store.moveWork(idx, 'up')" [disabled]="idx === 0" title="Move Up">↑</button>
                <button type="button" class="btn-icon-subtle" (click)="store.moveWork(idx, 'down')" [disabled]="idx === store.work().length - 1" title="Move Down">↓</button>
                <button type="button" class="btn-icon-subtle delete" (click)="store.removeWork(job.id!)" title="Remove">✕</button>
              </div>
            </div>

            <div class="form-vertical-flow">
              <app-form-input
                label="Job Title"
                placeholder="e.g. Senior Frontend Engineer"
                [value]="job.position || ''"
                (valueChange)="store.updateWork(job.id!, { position: $event })"
              />

              <app-form-input
                label="Company / Employer"
                placeholder="e.g. Google, Stripe, Acme Corp"
                [value]="job.name || ''"
                (valueChange)="store.updateWork(job.id!, { name: $event })"
              />

              <app-form-input
                label="Start Date"
                placeholder="e.g. Oct 2022"
                [value]="job.startDate || ''"
                (valueChange)="store.updateWork(job.id!, { startDate: $event })"
              />

              <app-form-input
                label="End Date"
                placeholder="e.g. Present, or Nov 2024"
                [value]="job.endDate || ''"
                (valueChange)="store.updateWork(job.id!, { endDate: $event })"
              />

              <app-form-input
                label="Location"
                placeholder="e.g. San Francisco, CA (Remote)"
                [value]="job.location || ''"
                (valueChange)="store.updateWork(job.id!, { location: $event })"
              />

              <app-form-input
                label="Company URL"
                kind="url"
                placeholder="https://company.com"
                [value]="job.url || ''"
                (valueChange)="store.updateWork(job.id!, { url: $event })"
              />

              <app-form-input
                label="Key Achievements & Responsibilities"
                kind="bullets"
                [rows]="5"
                placeholder="• Architected micro-frontend platform saving 200ms TTFB\n• Mentored 4 engineers and drove TypeScript adoption"
                helpText="One bullet point per line."
                [bulletsValue]="job.highlights || []"
                (bulletsValueChange)="store.updateWork(job.id!, { highlights: $event })"
              />
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class WorkFormComponent {
  readonly store = inject(ResumeStore);
}
