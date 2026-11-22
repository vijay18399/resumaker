import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./preview.component.scss'],
  template: `
    <div class="preview-pane">
      <!-- Live PDF / SVG Pages Display -->
      <div class="preview-canvas-container" (click)="canvasClick.emit($event)">
        @for (pageHtml of renderedPages(); track $index) {
          <div class="pdf-page-sheet" [innerHTML]="pageHtml"></div>
        }
      </div>
    </div>
  `
})
export class PreviewComponent {
  readonly renderedPages = input.required<SafeHtml[]>();
  readonly canvasClick = output<MouseEvent>();
}
