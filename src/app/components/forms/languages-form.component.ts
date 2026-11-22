import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeStore } from '../../services/resume-store.service';
import { FormInputComponent } from '../ui/form-input.component';
import { SectionVisibilityToggleComponent } from '../ui/section-visibility-toggle.component';

@Component({
  selector: 'app-languages-form',
  standalone: true,
  imports: [CommonModule, FormInputComponent, SectionVisibilityToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="form-container">
      <div class="form-section-header">
        <div class="header-info">
          <div class="header-icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <div class="header-text">
            <h1>Languages</h1>
            <p>Spoken languages and your level of proficiency</p>
          </div>
        </div>
        <div class="header-action">
          <app-section-visibility-toggle
            [isHidden]="!!store.hiddenSections()['languages']"
            (toggle)="store.toggleSectionVisibility('languages')"
          />
          <button type="button" class="btn-nuxt-primary" (click)="store.addLanguage()">
            + Add Language
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        @for (lang of store.languages(); track lang.id; let idx = $index) {
          <div class="nuxt-card collection-card" [id]="lang.id">
            <div class="card-top-bar">
              <div class="card-item-title-group">
                <span class="index-pill">{{ idx + 1 }}</span>
                <span class="card-item-title">{{ lang.language || 'Language' }}</span>
                <span class="card-item-subtitle" *ngIf="lang.fluency">{{ lang.fluency }}</span>
              </div>
              <div class="card-actions">
                <button type="button" class="btn-icon-subtle delete" (click)="store.removeLanguage(lang.id!)" title="Remove">✕</button>
              </div>
            </div>

            <div class="form-vertical-flow">
              <app-form-input
                label="Language"
                placeholder="e.g. English, Spanish, German, Mandarin"
                [value]="lang.language || ''"
                (valueChange)="store.updateLanguage(lang.id!, { language: $event })"
              />

              <app-form-input
                label="Fluency Level"
                placeholder="e.g. Native, Fluent, Professional Working, Conversational"
                [value]="lang.fluency || ''"
                (valueChange)="store.updateLanguage(lang.id!, { fluency: $event })"
              />
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class LanguagesFormComponent {
  readonly store = inject(ResumeStore);
}
