import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeStore } from '../../services/resume-store.service';
import { FormInputComponent } from '../ui/form-input.component';
import { SectionVisibilityToggleComponent } from '../ui/section-visibility-toggle.component';

@Component({
  selector: 'app-certificates-form',
  standalone: true,
  imports: [CommonModule, FormInputComponent, SectionVisibilityToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="form-container">
      <div class="form-section-header">
        <div class="header-info">
          <div class="header-icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
            </svg>
          </div>
          <div class="header-text">
            <h1>Certifications</h1>
            <p>Industry accreditations, licenses, and verified skill achievements</p>
          </div>
        </div>
        <div class="header-action">
          <app-section-visibility-toggle
            [isHidden]="!!store.hiddenSections()['certificates']"
            (toggle)="store.toggleSectionVisibility('certificates')"
          />
          <button type="button" class="btn-nuxt-primary" (click)="store.addCertification()">
            + Add Certificate
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        @for (cert of store.certificates(); track cert.id; let idx = $index) {
          <div class="nuxt-card collection-card" [id]="cert.id">
            <div class="card-top-bar">
              <div class="card-item-title-group">
                <span class="index-pill">{{ idx + 1 }}</span>
                <span class="card-item-title">{{ cert.name || 'Certificate Name' }}</span>
              </div>
              <div class="card-actions flex items-center gap-1">
                <button type="button" class="btn-icon-subtle" (click)="store.moveCertification(idx, 'up')" [disabled]="idx === 0" title="Move Up">↑</button>
                <button type="button" class="btn-icon-subtle" (click)="store.moveCertification(idx, 'down')" [disabled]="idx === store.certificates().length - 1" title="Move Down">↓</button>
                <button type="button" class="btn-icon-subtle delete" (click)="store.removeCertification(cert.id!)" title="Remove">✕</button>
              </div>
            </div>

            <div class="form-vertical-flow">
              <app-form-input
                label="Certificate Title"
                placeholder="e.g. AWS Certified Solutions Architect"
                [value]="cert.name || ''"
                (valueChange)="store.updateCertification(cert.id!, { name: $event })"
              />

              <app-form-input
                label="Issuing Organization"
                placeholder="e.g. Amazon Web Services, Google Cloud"
                [value]="cert.issuer || ''"
                (valueChange)="store.updateCertification(cert.id!, { issuer: $event })"
              />

              <app-form-input
                label="Issue Date"
                placeholder="e.g. Nov 2023"
                [value]="cert.date || ''"
                (valueChange)="store.updateCertification(cert.id!, { date: $event })"
              />

              <app-form-input
                label="Verification Credential URL"
                kind="url"
                placeholder="https://credly.com/..."
                [value]="cert.url || ''"
                (valueChange)="store.updateCertification(cert.id!, { url: $event })"
              />
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class CertificatesFormComponent {
  readonly store = inject(ResumeStore);
}
