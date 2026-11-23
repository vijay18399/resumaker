import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeStore } from '../../services/resume-store.service';
import { FormInputComponent } from '../ui/form-input.component';
import { SectionVisibilityToggleComponent } from '../ui/section-visibility-toggle.component';

@Component({
  selector: 'app-awards-form',
  standalone: true,
  imports: [CommonModule, FormInputComponent, SectionVisibilityToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="form-container">
      <div class="form-section-header">
        <div class="header-info">
          <div class="header-icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
            </svg>
          </div>
          <div class="header-text">
            <h1>Honors & Awards</h1>
            <p>Hackathon wins, corporate honors, and academic recognitions</p>
          </div>
        </div>
        <div class="header-action">
          <app-section-visibility-toggle
            [isHidden]="!!store.hiddenSections()['awards']"
            (toggle)="store.toggleSectionVisibility('awards')"
          />
          <button type="button" class="btn-nuxt-primary" (click)="store.addAward()">
            + Add Award
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        @for (award of store.awards(); track award.id; let idx = $index) {
          <div class="nuxt-card collection-card" [id]="award.id">
            <div class="card-top-bar">
              <div class="card-item-title-group">
                <span class="index-pill">{{ idx + 1 }}</span>
                <span class="card-item-title">{{ award.title || 'Award Title' }}</span>
              </div>
              <div class="card-actions flex items-center gap-1">
                <button type="button" class="btn-icon-subtle" (click)="store.moveAward(idx, 'up')" [disabled]="idx === 0" title="Move Up">↑</button>
                <button type="button" class="btn-icon-subtle" (click)="store.moveAward(idx, 'down')" [disabled]="idx === store.awards().length - 1" title="Move Down">↓</button>
                <button type="button" class="btn-icon-subtle delete" (click)="store.removeAward(award.id!)" title="Remove">✕</button>
              </div>
            </div>

            <div class="form-vertical-flow">
              <app-form-input
                label="Award Title"
                placeholder="e.g. 1st Place Global Hackathon"
                [value]="award.title || ''"
                (valueChange)="store.updateAward(award.id!, { title: $event })"
              />

              <app-form-input
                label="Awarding Organization"
                placeholder="e.g. TechCrunch, MIT, Stripe"
                [value]="award.awarder || ''"
                (valueChange)="store.updateAward(award.id!, { awarder: $event })"
              />

              <app-form-input
                label="Date Received"
                placeholder="e.g. May 2023"
                [value]="award.date || ''"
                (valueChange)="store.updateAward(award.id!, { date: $event })"
              />

              <app-form-input
                label="Summary / Details"
                placeholder="e.g. Awarded for developing real-time distributed consensus algorithm"
                [value]="award.summary || ''"
                (valueChange)="store.updateAward(award.id!, { summary: $event })"
              />
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AwardsFormComponent {
  readonly store = inject(ResumeStore);
}
