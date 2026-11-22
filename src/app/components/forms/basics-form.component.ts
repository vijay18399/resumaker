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
        <div class="profiles-section mt-5 pt-4 border-t border-slate-200">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="text-sm font-semibold text-slate-800">Online Profiles</h3>
              <p class="text-xs text-slate-500">GitHub, LinkedIn, Twitter, etc.</p>
            </div>
            <button type="button" class="btn-nuxt-secondary" (click)="store.addProfile()">
              + Add Profile
            </button>
          </div>

          <div class="flex flex-col gap-3">
            @for (profile of store.basics().profiles || []; track $index; let pIdx = $index) {
              <div class="profile-row-card p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                <div class="flex-1 flex flex-col gap-2">
                  <app-form-input
                    label="Network"
                    placeholder="e.g. LinkedIn"
                    [value]="profile.network || ''"
                    (valueChange)="store.updateProfile(pIdx, { network: $event })"
                  />
                  <app-form-input
                    label="Username"
                    placeholder="e.g. jdoe"
                    [value]="profile.username || ''"
                    (valueChange)="store.updateProfile(pIdx, { username: $event })"
                  />
                  <app-form-input
                    label="Profile URL"
                    kind="url"
                    placeholder="https://linkedin.com/in/..."
                    [value]="profile.url || ''"
                    (valueChange)="store.updateProfile(pIdx, { url: $event })"
                  />
                </div>
                <button type="button" class="btn-icon-subtle delete" (click)="store.removeProfile(pIdx)" title="Remove profile">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                </button>
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
