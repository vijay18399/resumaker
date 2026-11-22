import { Component, ChangeDetectionStrategy, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type InputKind = 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'tags' | 'bullets';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="input-field-group">
      <div class="label-row" *ngIf="label()">
        <label [for]="id()" class="field-label">{{ label() }}</label>
        <span *ngIf="badge()" class="field-badge">{{ badge() }}</span>
      </div>

      <!-- Text / Email / Tel / Url -->
      <div *ngIf="kind() === 'text' || kind() === 'email' || kind() === 'tel' || kind() === 'url'" class="input-shell">
        <input
          [id]="id()"
          [type]="kind()"
          class="nuxt-input"
          [placeholder]="placeholder()"
          [ngModel]="value()"
          (ngModelChange)="onValueChange($event)"
        />
      </div>

      <!-- Textarea -->
      <div *ngIf="kind() === 'textarea'" class="input-shell">
        <textarea
          [id]="id()"
          class="nuxt-textarea"
          [rows]="rows()"
          [placeholder]="placeholder()"
          [ngModel]="value()"
          (ngModelChange)="onValueChange($event)">
        </textarea>
      </div>

      <!-- Tags (Comma separated array) -->
      <div *ngIf="kind() === 'tags'" class="input-shell">
        <input
          [id]="id()"
          type="text"
          class="nuxt-input"
          [placeholder]="placeholder() || 'e.g. TypeScript, React, Docker'"
          [ngModel]="tagsToCsv(tagsValue())"
          (ngModelChange)="onTagsChange($event)"
        />
      </div>

      <!-- Bullet points (Newline separated array) -->
      <div *ngIf="kind() === 'bullets'" class="input-shell">
        <textarea
          [id]="id()"
          class="nuxt-textarea font-mono"
          [rows]="rows() || 4"
          [placeholder]="placeholder() || '• First bullet point\n• Second bullet point'"
          [ngModel]="bulletsToText(bulletsValue())"
          (ngModelChange)="onBulletsChange($event)">
        </textarea>
      </div>

      <p *ngIf="helpText()" class="field-help">{{ helpText() }}</p>
    </div>
  `,
  styleUrls: ['./form-input.component.scss']
})
export class FormInputComponent {
  readonly id = input<string>(`inp-${Math.random().toString(36).substring(2, 9)}`);
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly helpText = input<string>('');
  readonly badge = input<string>('');
  readonly kind = input<InputKind>('text');
  readonly rows = input<number>(3);

  // Single value binding
  readonly value = model<string>('');

  // Array bindings for tags and bullets
  readonly tagsValue = model<string[]>([]);
  readonly bulletsValue = model<string[]>([]);

  onValueChange(val: string): void {
    this.value.set(val || '');
  }

  onTagsChange(csv: string): void {
    const arr = csv.split(',').map(s => s.trim()).filter(Boolean);
    this.tagsValue.set(arr);
  }

  onBulletsChange(text: string): void {
    const arr = text.split('\n').filter(s => s.trim().length > 0);
    this.bulletsValue.set(arr);
  }

  tagsToCsv(arr?: string[] | null): string {
    return (arr || []).join(', ');
  }

  bulletsToText(arr?: string[] | null): string {
    return (arr || []).join('\n');
  }
}
