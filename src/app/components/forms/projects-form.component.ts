import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeStore } from '../../services/resume-store.service';
import { FormInputComponent } from '../ui/form-input.component';
import { SectionVisibilityToggleComponent } from '../ui/section-visibility-toggle.component';

@Component({
  selector: 'app-projects-form',
  standalone: true,
  imports: [CommonModule, FormInputComponent, SectionVisibilityToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="form-container">
      <div class="form-section-header">
        <div class="header-info">
          <div class="header-icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <div class="header-text">
            <h1>Featured Projects</h1>
            <p>Applications, open-source repositories, and systems you developed</p>
          </div>
        </div>
        <div class="header-action">
          <app-section-visibility-toggle
            [isHidden]="!!store.hiddenSections()['projects']"
            (toggle)="store.toggleSectionVisibility('projects')"
          />
          <button type="button" class="btn-nuxt-primary" (click)="store.addProject()">
            + Add Project
          </button>
        </div>
      </div>

      <!-- Project Cards -->
      <div class="flex flex-col gap-4">
        @for (proj of store.projects(); track proj.id; let idx = $index) {
          <div class="nuxt-card collection-card" [id]="proj.id">
            <div class="card-top-bar">
              <div class="card-item-title-group">
                <span class="index-pill">{{ idx + 1 }}</span>
                <span class="card-item-title">{{ proj.name || 'Project Name' }}</span>
              </div>
              <div class="card-actions flex items-center gap-1">
                <button type="button" class="btn-icon-subtle" (click)="store.moveProject(idx, 'up')" [disabled]="idx === 0" title="Move Up">↑</button>
                <button type="button" class="btn-icon-subtle" (click)="store.moveProject(idx, 'down')" [disabled]="idx === store.projects().length - 1" title="Move Down">↓</button>
                <button type="button" class="btn-icon-subtle delete" (click)="store.removeProject(proj.id!)" title="Remove">✕</button>
              </div>
            </div>

            <div class="form-vertical-flow">
              <app-form-input
                label="Project Title"
                placeholder="e.g. Resumaker Studio"
                [value]="proj.name || ''"
                (valueChange)="store.updateProject(proj.id!, { name: $event })"
              />

              <app-form-input
                label="Repository or Live URL"
                kind="url"
                placeholder="https://github.com/..."
                [value]="proj.url || ''"
                (valueChange)="store.updateProject(proj.id!, { url: $event })"
              />

              <app-form-input
                label="Start Date"
                placeholder="e.g. Jan 2023"
                [value]="proj.startDate || ''"
                (valueChange)="store.updateProject(proj.id!, { startDate: $event })"
              />

              <app-form-input
                label="End Date"
                placeholder="e.g. Present"
                [value]="proj.endDate || ''"
                (valueChange)="store.updateProject(proj.id!, { endDate: $event })"
              />

              <app-form-input
                label="Brief Description"
                placeholder="e.g. High-performance browser resume builder built with Typst WASM and Angular"
                [value]="proj.description || ''"
                (valueChange)="store.updateProject(proj.id!, { description: $event })"
              />

              <app-form-input
                label="Tech Stack / Keywords"
                kind="tags"
                placeholder="e.g. Rust, WebAssembly, Typst, TypeScript, Angular"
                helpText="Comma separated list"
                [tagsValue]="proj.keywords || []"
                (tagsValueChange)="store.updateProject(proj.id!, { keywords: $event })"
              />

              <app-form-input
                label="Key Highlights & Outcomes"
                kind="bullets"
                [rows]="4"
                placeholder="• Compiled Typst documents in-browser in under 45ms\n• Zero external server latency"
                helpText="One bullet point per line."
                [bulletsValue]="proj.highlights || []"
                (bulletsValueChange)="store.updateProject(proj.id!, { highlights: $event })"
              />
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ProjectsFormComponent {
  readonly store = inject(ResumeStore);
}
