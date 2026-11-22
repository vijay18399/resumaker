import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeStore } from '../../services/resume-store.service';
import { FormInputComponent } from '../ui/form-input.component';
import { SectionVisibilityToggleComponent } from '../ui/section-visibility-toggle.component';

@Component({
  selector: 'app-basics-form',
  standalone: true,
  imports: [CommonModule, FormInputComponent, SectionVisibilityToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="form-container">
      <div class="form-section-header">
        <div class="header-info">
          <div class="header-icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="header-text">
            <h1>Personal Information</h1>
            <p>Your contact details, job title, and online profiles</p>
          </div>
        </div>
        <div class="header-action">
          <app-section-visibility-toggle
            [isHidden]="!!store.hiddenSections()['basics']"
            (toggle)="store.toggleSectionVisibility('basics')"
          />
        </div>
      </div>

      <div class="nuxt-card">
        <div class="form-vertical-flow">
          <app-form-input
            label="Full Name"
            placeholder="e.g. John Doe"
            [value]="store.basics().name || ''"
            (valueChange)="store.updateBasics('name', $event)"
          />

          <app-form-input
            label="Professional Title"
            placeholder="e.g. Senior Software Engineer"
            [value]="store.basics().label || ''"
            (valueChange)="store.updateBasics('label', $event)"
          />

          <app-form-input
            label="Email Address"
            kind="email"
            placeholder="name@example.com"
            [value]="store.basics().email || ''"
            (valueChange)="store.updateBasics('email', $event)"
          />

          <app-form-input
            label="Phone Number"
            kind="tel"
            placeholder="+1 (555) 000-0000"
            [value]="store.basics().phone || ''"
            (valueChange)="store.updateBasics('phone', $event)"
          />

          <app-form-input
            label="Portfolio / Website URL"
            kind="url"
            placeholder="https://johndoe.dev"
            [value]="store.basics().url || ''"
            (valueChange)="store.updateBasics('url', $event)"
          />

          <app-form-input
            label="Location (City, Region)"
            placeholder="e.g. San Francisco, CA"
            [value]="store.basics().location?.city || ''"
            (valueChange)="store.updateBasicsLocation('city', $event)"
          />
        </div>

        <!-- Online Profiles -->
        <div class="profiles-section">
          <div class="profiles-header">
            <div>
              <h3 class="profiles-title">Online Profiles & Social Links</h3>
              <p class="profiles-subtitle">LinkedIn, GitHub, Twitter, etc.</p>
            </div>
            <button type="button" class="btn-nuxt-secondary" (click)="store.addProfile()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Add Profile</span>
            </button>
          </div>

          <div class="flex flex-col gap-3">
            @for (profile of store.basics().profiles || []; track $index; let pIdx = $index) {
              <div class="profile-block-card">
                <div class="profile-card-top">
                  <div class="profile-badge-group">
                    <span class="index-pill">{{ pIdx + 1 }}</span>
                    <span class="profile-network-label">{{ profile.network || 'Profile Link' }}</span>
                    <span class="profile-username-tag" *ngIf="profile.username">({{ profile.username }})</span>
                  </div>
                  <button type="button" class="btn-icon-subtle delete" (click)="store.removeProfile(pIdx)" title="Remove profile">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>

                <div class="form-vertical-flow">
                  <app-form-input
                    label="Network Name"
                    placeholder="e.g. LinkedIn, GitHub, X (Twitter), Dribbble"
                    [value]="profile.network || ''"
                    (valueChange)="store.updateProfile(pIdx, { network: $event })"
                  />
                  <app-form-input
                    label="Username / Handle"
                    placeholder="e.g. alexmorgan"
                    [value]="profile.username || ''"
                    (valueChange)="store.updateProfile(pIdx, { username: $event })"
                  />
                  <app-form-input
                    label="Profile Web Address (URL)"
                    kind="url"
                    placeholder="https://linkedin.com/in/alexmorgan"
                    [value]="profile.url || ''"
                    (valueChange)="store.updateProfile(pIdx, { url: $event })"
                  />
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class BasicsFormComponent {
  readonly store = inject(ResumeStore);
}
