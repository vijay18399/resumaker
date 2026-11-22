import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-visibility-toggle',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @use '../../../styles/variables' as *;

    .section-visibility-toggle {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
      padding: 4px 10px;
      border-radius: 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      transition: all 0.15s ease-in-out;

      &:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
      }

      .toggle-switch-track {
        position: relative;
        width: 32px;
        height: 18px;
        border-radius: 9px;
        background-color: #10b981; // active emerald
        transition: background-color 0.15s ease-in-out;
        flex-shrink: 0;

        .toggle-switch-thumb {
          position: absolute;
          top: 2px;
          left: 16px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background-color: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          transition: transform 0.15s ease-in-out;
        }
      }

      .toggle-label {
        font-size: 12px;
        font-weight: 600;
        color: #334155;
        white-space: nowrap;
      }

      &.is-hidden {
        background: #fff1f2;
        border-color: #fecdd3;

        .toggle-switch-track {
          background-color: #cbd5e1;

          .toggle-switch-thumb {
            transform: translateX(-14px);
          }
        }

        .toggle-label {
          color: #94a3b8;
        }
      }
    }
  `],
  template: `
    <button
      type="button"
      class="section-visibility-toggle"
      [class.is-hidden]="isHidden()"
      (click)="toggle.emit()"
      [title]="isHidden() ? 'Section is hidden from PDF resume. Click to include.' : 'Section is included in PDF resume. Click to hide.'">
      <div class="toggle-switch-track" aria-hidden="true">
        <div class="toggle-switch-thumb"></div>
      </div>
      <span class="toggle-label">{{ isHidden() ? 'Hidden' : 'Visible' }}</span>
    </button>
  `
})
export class SectionVisibilityToggleComponent {
  readonly isHidden = input<boolean>(false);
  readonly toggle = output<void>();
}
