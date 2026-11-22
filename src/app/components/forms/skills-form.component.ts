import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeStore } from '../../services/resume-store.service';
import { FormInputComponent } from '../ui/form-input.component';
import { SectionVisibilityToggleComponent } from '../ui/section-visibility-toggle.component';

@Component({
  selector: 'app-skills-form',
  standalone: true,
  imports: [CommonModule, FormInputComponent, SectionVisibilityToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="form-container">
      <div class="form-section-header">
        <div class="header-info">
          <div class="header-icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <div class="header-text">
            <h1>Skills & Expertise</h1>
            <p>Group your technical proficiencies, frameworks, tools, and platforms</p>
          </div>
        </div>
        <div class="header-action">
          <app-section-visibility-toggle
            [isHidden]="!!store.hiddenSections()['skills']"
            (toggle)="store.toggleSectionVisibility('skills')"
          />
          <button type="button" class="btn-nuxt-primary" (click)="store.addSkillCategory()">
            + Add Category
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        @for (cat of store.skills(); track cat.id; let idx = $index) {
          <div class="nuxt-card collection-card" [id]="cat.id">
            <div class="card-top-bar">
              <div class="card-item-title-group">
                <span class="index-pill">{{ idx + 1 }}</span>
                <span class="card-item-title">{{ cat.name || 'Category Name' }}</span>
              </div>
              <div class="card-actions flex items-center gap-1">
                <button type="button" class="btn-icon-subtle" (click)="store.moveSkillCategory(idx, 'up')" [disabled]="idx === 0" title="Move Up">↑</button>
                <button type="button" class="btn-icon-subtle" (click)="store.moveSkillCategory(idx, 'down')" [disabled]="idx === store.skills().length - 1" title="Move Down">↓</button>
                <button type="button" class="btn-icon-subtle delete" (click)="store.removeSkillCategory(cat.id!)" title="Remove">✕</button>
              </div>
            </div>

            <div class="form-vertical-flow">
              <app-form-input
                label="Category Name"
                placeholder="e.g. Frontend Frameworks, Cloud & DevOps, Languages"
                [value]="cat.name || ''"
                (valueChange)="store.updateCategoryName(cat.id!, $event)"
              />

              <app-form-input
                label="Skills in this Category"
                kind="tags"
                placeholder="e.g. TypeScript, Angular, RxJS, Tailwind CSS"
                helpText="Enter skills separated by commas."
                [tagsValue]="cat.keywords || []"
                (tagsValueChange)="store.updateSkillCategory(cat.id!, { keywords: $event })"
              />
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class SkillsFormComponent {
  readonly store = inject(ResumeStore);
}
