import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeStore } from '../../services/resume-store.service';
import { FormInputComponent } from '../ui/form-input.component';
import { SectionVisibilityToggleComponent } from '../ui/section-visibility-toggle.component';

@Component({
  selector: 'app-volunteer-form',
  standalone: true,
  imports: [CommonModule, FormInputComponent, SectionVisibilityToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="form-container">
      <div class="form-section-header">
        <div class="header-info">
          <div class="header-icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="header-text">
            <h1>Volunteer Experience</h1>
            <p>Community contributions, pro-bono work, and non-profit involvement</p>
          </div>
        </div>
        <div class="header-action">
          <app-section-visibility-toggle
            [isHidden]="!!store.hiddenSections()['volunteer']"
            (toggle)="store.toggleSectionVisibility('volunteer')"
          />
          <button type="button" class="btn-nuxt-primary" (click)="store.addVolunteer()">
            + Add Volunteer
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        @for (vol of store.volunteer(); track vol.id; let idx = $index) {
          <div class="nuxt-card collection-card" [id]="vol.id">
            <div class="card-top-bar">
              <div class="card-item-title-group">
                <span class="index-pill">{{ idx + 1 }}</span>
                <span class="card-item-title">{{ vol.position || vol.organization || 'Role' }}</span>
              </div>
              <div class="card-actions flex items-center gap-1">
                <button type="button" class="btn-icon-subtle" (click)="store.moveVolunteer(idx, 'up')" [disabled]="idx === 0" title="Move Up">↑</button>
                <button type="button" class="btn-icon-subtle" (click)="store.moveVolunteer(idx, 'down')" [disabled]="idx === store.volunteer().length - 1" title="Move Down">↓</button>
                <button type="button" class="btn-icon-subtle delete" (click)="store.removeVolunteer(vol.id!)" title="Remove">✕</button>
              </div>
            </div>

            <div class="form-vertical-flow">
              <app-form-input
                label="Role / Position"
                placeholder="e.g. Volunteer Coding Instructor"
                [value]="vol.position || ''"
                (valueChange)="store.updateVolunteer(vol.id!, { position: $event })"
              />

              <app-form-input
                label="Organization"
                placeholder="e.g. Code for America, Girls Who Code"
                [value]="vol.organization || ''"
                (valueChange)="store.updateVolunteer(vol.id!, { organization: $event })"
              />

              <app-form-input
                label="Start Date"
                placeholder="e.g. Jan 2022"
                [value]="vol.startDate || ''"
                (valueChange)="store.updateVolunteer(vol.id!, { startDate: $event })"
              />

              <app-form-input
                label="End Date"
                placeholder="e.g. Present"
                [value]="vol.endDate || ''"
                (valueChange)="store.updateVolunteer(vol.id!, { endDate: $event })"
              />

              <app-form-input
                label="Summary / Impact"
                placeholder="e.g. Mentored high school students in algorithms and web foundations"
                [value]="vol.summary || ''"
                (valueChange)="store.updateVolunteer(vol.id!, { summary: $event })"
              />

              <app-form-input
                label="Key Highlights"
                kind="bullets"
                [rows]="3"
                placeholder="• Conducted weekly weekend code labs"
                [bulletsValue]="vol.highlights || []"
                (bulletsValueChange)="store.updateVolunteer(vol.id!, { highlights: $event })"
              />
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class VolunteerFormComponent {
  readonly store = inject(ResumeStore);
}
