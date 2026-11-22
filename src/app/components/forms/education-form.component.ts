import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeStore } from '../../services/resume-store.service';
import { FormInputComponent } from '../ui/form-input.component';
import { SectionVisibilityToggleComponent } from '../ui/section-visibility-toggle.component';

@Component({
  selector: 'app-education-form',
  standalone: true,
  imports: [CommonModule, FormInputComponent, SectionVisibilityToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="form-container">
      <div class="form-section-header">
        <div class="header-info">
          <div class="header-icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div class="header-text">
            <h1>Education</h1>
            <p>Your degrees, university background, GPA, and major field of study</p>
          </div>
        </div>
        <div class="header-action">
          <app-section-visibility-toggle
            [isHidden]="!!store.hiddenSections()['education']"
            (toggle)="store.toggleSectionVisibility('education')"
          />
          <button type="button" class="btn-nuxt-primary" (click)="store.addEducation()">
            + Add Degree
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        @for (edu of store.education(); track edu.id; let idx = $index) {
          <div class="nuxt-card collection-card" [id]="edu.id">
            <div class="card-top-bar">
              <div class="card-item-title-group">
                <span class="index-pill">{{ idx + 1 }}</span>
                <span class="card-item-title">{{ edu.studyType || 'Degree' }}</span>
                <span class="card-item-subtitle" *ngIf="edu.institution">{{ edu.institution }}</span>
              </div>
              <div class="card-actions flex items-center gap-1">
                <button type="button" class="btn-icon-subtle" (click)="store.moveEducation(idx, 'up')" [disabled]="idx === 0" title="Move Up">↑</button>
                <button type="button" class="btn-icon-subtle" (click)="store.moveEducation(idx, 'down')" [disabled]="idx === store.education().length - 1" title="Move Down">↓</button>
                <button type="button" class="btn-icon-subtle delete" (click)="store.removeEducation(edu.id!)" title="Remove">✕</button>
              </div>
            </div>

            <div class="form-vertical-flow">
              <app-form-input
                label="Degree / Qualification"
                placeholder="e.g. B.S. in Computer Science"
                [value]="edu.studyType || ''"
                (valueChange)="store.updateEducation(edu.id!, { studyType: $event })"
              />

              <app-form-input
                label="College or University"
                placeholder="e.g. Stanford University"
                [value]="edu.institution || ''"
                (valueChange)="store.updateEducation(edu.id!, { institution: $event })"
              />

              <app-form-input
                label="Field of Study"
                placeholder="e.g. Software Engineering"
                [value]="edu.area || ''"
                (valueChange)="store.updateEducation(edu.id!, { area: $event })"
              />

              <app-form-input
                label="Start Date"
                placeholder="e.g. Sep 2018"
                [value]="edu.startDate || ''"
                (valueChange)="store.updateEducation(edu.id!, { startDate: $event })"
              />

              <app-form-input
                label="Graduation Date"
                placeholder="e.g. Jun 2022"
                [value]="edu.endDate || ''"
                (valueChange)="store.updateEducation(edu.id!, { endDate: $event })"
              />

              <app-form-input
                label="GPA / Grade"
                placeholder="e.g. 3.9 / 4.0"
                [value]="edu.score || ''"
                (valueChange)="store.updateEducation(edu.id!, { score: $event })"
              />

              <app-form-input
                label="Relevant Coursework"
                kind="tags"
                placeholder="e.g. Distributed Systems, Algorithms, Machine Learning"
                helpText="Comma separated list"
                [tagsValue]="edu.courses || []"
                (tagsValueChange)="store.updateEducation(edu.id!, { courses: $event })"
              />
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class EducationFormComponent {
  readonly store = inject(ResumeStore);
}
