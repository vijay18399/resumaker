import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeStore } from '../../services/resume-store.service';
import { FormInputComponent } from '../ui/form-input.component';
import { SectionVisibilityToggleComponent } from '../ui/section-visibility-toggle.component';

@Component({
  selector: 'app-references-form',
  standalone: true,
  imports: [CommonModule, FormInputComponent, SectionVisibilityToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="form-container">
      <div class="form-section-header">
        <div class="header-info">
          <div class="header-icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="header-text">
            <h1>Professional References</h1>
            <p>Colleagues, managers, or mentors who can provide personal endorsements</p>
          </div>
        </div>
        <div class="header-action">
          <app-section-visibility-toggle
            [isHidden]="!!store.hiddenSections()['references']"
            (toggle)="store.toggleSectionVisibility('references')"
          />
          <button type="button" class="btn-nuxt-primary" (click)="store.addReference()">
            + Add Reference
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        @for (ref of store.references(); track ref.id; let idx = $index) {
          <div class="nuxt-card collection-card" [id]="ref.id">
            <div class="card-top-bar">
              <div class="card-item-title-group">
                <span class="index-pill">{{ idx + 1 }}</span>
                <span class="card-item-title">{{ ref.name || 'Reference' }}</span>
              </div>
              <div class="card-actions flex items-center gap-1">
                <button type="button" class="btn-icon-subtle" (click)="store.moveReference(idx, 'up')" [disabled]="idx === 0" title="Move Up">↑</button>
                <button type="button" class="btn-icon-subtle" (click)="store.moveReference(idx, 'down')" [disabled]="idx === store.references().length - 1" title="Move Down">↓</button>
                <button type="button" class="btn-icon-subtle delete" (click)="store.removeReference(ref.id!)" title="Remove">✕</button>
              </div>
            </div>

            <div class="form-vertical-flow">
              <app-form-input
                label="Name of Reference"
                placeholder="e.g. Jane Smith"
                [value]="ref.name || ''"
                (valueChange)="store.updateReference(ref.id!, { name: $event })"
              />

              <app-form-input
                label="Role, Relationship or Endorsement"
                placeholder="e.g. VP of Engineering at Acme Corp ('Available upon request')"
                [value]="ref.reference || ''"
                (valueChange)="store.updateReference(ref.id!, { reference: $event })"
              />
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ReferencesFormComponent {
  readonly store = inject(ResumeStore);
}
