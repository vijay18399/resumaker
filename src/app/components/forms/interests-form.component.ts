import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeStore } from '../../services/resume-store.service';
import { FormInputComponent } from '../ui/form-input.component';
import { SectionVisibilityToggleComponent } from '../ui/section-visibility-toggle.component';

@Component({
  selector: 'app-interests-form',
  standalone: true,
  imports: [CommonModule, FormInputComponent, SectionVisibilityToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="form-container">
      <div class="form-section-header">
        <div class="header-info">
          <div class="header-icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <div class="header-text">
            <h1>Interests & Passions</h1>
            <p>Personal hobbies, extracurricular activities, and special interest topics</p>
          </div>
        </div>
        <div class="header-action">
          <app-section-visibility-toggle
            [isHidden]="!!store.hiddenSections()['interests']"
            (toggle)="store.toggleSectionVisibility('interests')"
          />
          <button type="button" class="btn-nuxt-primary" (click)="store.addInterest()">
            + Add Interest
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        @for (int of store.interests(); track int.id; let idx = $index) {
          <div class="nuxt-card collection-card" [id]="int.id">
            <div class="card-top-bar">
              <div class="card-item-title-group">
                <span class="index-pill">{{ idx + 1 }}</span>
                <span class="card-item-title">{{ int.name || 'Interest' }}</span>
              </div>
              <div class="card-actions">
                <button type="button" class="btn-icon-subtle delete" (click)="store.removeInterest(int.id!)" title="Remove">✕</button>
              </div>
            </div>

            <div class="form-vertical-flow">
              <app-form-input
                label="Interest / Activity"
                placeholder="e.g. Open Source, Photography, Marathon Running"
                [value]="int.name || ''"
                (valueChange)="store.updateInterest(int.id!, { name: $event })"
              />

              <app-form-input
                label="Specific Topics or Tags"
                kind="tags"
                placeholder="e.g. Rust, Linux Kernel, Street Photography"
                helpText="Comma separated list"
                [tagsValue]="int.keywords || []"
                (tagsValueChange)="store.updateInterest(int.id!, { keywords: $event })"
              />
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class InterestsFormComponent {
  readonly store = inject(ResumeStore);
}
