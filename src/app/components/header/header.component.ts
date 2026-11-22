import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  inject,
  computed,
  HostListener,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TemplateMetadata } from '../../models/resume.model';
import { ResumeStore } from '../../services/resume-store.service';
import {
  COLOR_PRESETS,
  TEMPLATE_DEFAULT_COLORS,
  PaperSize,
  DocumentDensity
} from '../../models/template-config.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./header.component.scss'],
  template: `
    <header class="app-header">
      <!-- Brand Logo -->
      <div class="brand">
        <img class="brand-logo" src="favicon.svg" alt="Resumaker Logo" width="32" height="32" />
        <div class="brand-title">
          resu<span class="brand-highlight">maker</span>
        </div>
      </div>

      <!-- Header Actions -->
      <div class="header-actions">

        <!-- Template Selector & Style Popover Group -->
        <div class="template-cluster">
          <select
            class="theme-dropdown-select"
            [ngModel]="selectedTemplateId()"
            (ngModelChange)="templateChange.emit($event)">
            @for (tmpl of templates(); track tmpl.id) {
              <option [value]="tmpl.id">{{ tmpl.name }}</option>
            }
          </select>

          <!-- Style Toggle Button -->
          <div class="style-popover-container">
            <button
              type="button"
              class="btn-style-popover"
              id="btn-open-style"
              [class.active]="isStyleOpen()"
              (click)="toggleStylePopover($event)"
              title="Customize Accent Color, Paper Size, & Density">
              <span class="swatch-indicator" [style.background-color]="currentColor()"></span>
              <span class="style-label">Style</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="chevron-icon">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            <!-- Option A: Clean, Compact Popover (~290px) -->
            @if (isStyleOpen()) {
              <div class="style-popover-card" (click)="$event.stopPropagation()">
                <!-- Popover Header -->
                <div class="popover-header">
                  <span class="popover-title">Template Styling</span>
                  <button type="button" class="btn-popover-close" (click)="isStyleOpen.set(false)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                <!-- 1. Accent Color -->
                <div class="popover-section">
                  <div class="section-row-header">
                    <label class="section-label">Accent Color</label>
                    <button
                      type="button"
                      class="btn-reset-link"
                      (click)="resetColorToTemplateDefault()">
                      Reset default ({{ templateDefaultColor() }})
                    </button>
                  </div>

                  <div class="color-palette-row">
                    @for (preset of colorPresets; track preset.hex) {
                      <button
                        type="button"
                        class="color-dot"
                        [style.background-color]="preset.hex"
                        [class.active]="currentColor().toLowerCase() === preset.hex.toLowerCase()"
                        (click)="setAccentColor(preset.hex)"
                        [title]="preset.name">
                        @if (currentColor().toLowerCase() === preset.hex.toLowerCase()) {
                          <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" class="dot-check">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        }
                      </button>
                    }

                    <!-- Native Picker -->
                    <label class="custom-color-picker-label" title="Pick custom color">
                      <input
                        type="color"
                        class="native-picker"
                        [value]="currentColor()"
                        (change)="onCustomColorChange($event)"
                      />
                      <span class="picker-plus">+</span>
                    </label>
                  </div>
                  <div class="color-hex-row">
                    <span class="hex-text">{{ currentColor() }}</span>
                  </div>
                </div>

                <!-- 2. Paper Size Toggle -->
                <div class="popover-section">
                  <label class="section-label">Paper Format</label>
                  <div class="segmented-control">
                    <button
                      type="button"
                      class="seg-btn"
                      [class.active]="currentPaperSize() === 'us-letter'"
                      (click)="setPaperSize('us-letter')">
                      US Letter
                    </button>
                    <button
                      type="button"
                      class="seg-btn"
                      [class.active]="currentPaperSize() === 'a4'"
                      (click)="setPaperSize('a4')">
                      A4 Standard
                    </button>
                  </div>
                </div>

                <!-- 3. Document Density Toggle -->
                <div class="popover-section">
                  <label class="section-label">Layout Density</label>
                  <div class="segmented-control">
                    <button
                      type="button"
                      class="seg-btn"
                      [class.active]="currentDensity() === 'compact'"
                      (click)="setDensity('compact')">
                      Compact
                    </button>
                    <button
                      type="button"
                      class="seg-btn"
                      [class.active]="currentDensity() === 'normal'"
                      (click)="setDensity('normal')">
                      Normal
                    </button>
                    <button
                      type="button"
                      class="seg-btn"
                      [class.active]="currentDensity() === 'relaxed'"
                      (click)="setDensity('relaxed')">
                      Relaxed
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Actions Cluster (Import, Export, Download) -->
        <div class="header-actions-group">
          <!-- Download PDF Primary CTA -->
          <button
            class="btn-download"
            (click)="downloadPdf.emit()"
            [disabled]="isGeneratingPdf()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>{{ isGeneratingPdf() ? 'Rendering...' : 'Download PDF' }}</span>
          </button>

          <!-- Direct Import JSON Button -->
          <label class="btn-header-secondary" title="Import Resume Data from JSON">
            <input
              type="file"
              accept=".json,application/json"
              (change)="onFileSelected($event)"
              style="display: none;"
            />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span class="btn-text">Import</span>
          </label>

          <!-- Direct Export JSON Button -->
          <button
            type="button"
            class="btn-header-secondary"
            id="btn-export-json"
            (click)="exportJson.emit()"
            title="Export JSON Resume">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span class="btn-text">Export</span>
          </button>
        </div>

      </div>
    </header>
  `
})
export class HeaderComponent {
  private readonly elementRef = inject(ElementRef);
  readonly store = inject(ResumeStore);

  readonly templates = input.required<TemplateMetadata[]>();
  readonly selectedTemplateId = input.required<string>();
  readonly isGeneratingPdf = input<boolean>(false);

  readonly importJson = output<File>();
  readonly exportJson = output<void>();
  readonly templateChange = output<string>();
  readonly downloadPdf = output<void>();

  readonly isStyleOpen = signal<boolean>(false);
  readonly isMoreMenuOpen = signal<boolean>(false);
  readonly colorPresets = COLOR_PRESETS;

  readonly currentColor = computed(() => this.store.templateConfig().accentColor || this.templateDefaultColor());
  readonly templateDefaultColor = computed(() => {
    const tmplId = this.store.selectedTemplateId();
    return TEMPLATE_DEFAULT_COLORS[tmplId] || '#0f172a';
  });
  readonly currentPaperSize = computed(() => this.store.templateConfig().paperSize || 'us-letter');
  readonly currentDensity = computed(() => this.store.templateConfig().density || 'normal');

  toggleStylePopover(event: Event): void {
    event.stopPropagation();
    this.isMoreMenuOpen.set(false);
    this.isStyleOpen.update(v => !v);
  }

  toggleMoreMenu(event: Event): void {
    event.stopPropagation();
    this.isStyleOpen.set(false);
    this.isMoreMenuOpen.update(v => !v);
  }

  setAccentColor(hex: string): void {
    this.store.updateTemplateConfig({ accentColor: hex });
  }

  resetColorToTemplateDefault(): void {
    this.setAccentColor(this.templateDefaultColor());
  }

  onCustomColorChange(e: Event): void {
    const hex = (e.target as HTMLInputElement).value;
    if (hex) {
      this.setAccentColor(hex);
    }
  }

  setPaperSize(paperSize: PaperSize): void {
    this.store.updateTemplateConfig({ paperSize });
  }

  setDensity(density: DocumentDensity): void {
    this.store.updateTemplateConfig({ density });
  }

  onFileSelected(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    if (inputEl.files && inputEl.files.length > 0) {
      this.importJson.emit(inputEl.files[0]);
    }
  }

  // Click outside to dismiss popovers
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isStyleOpen.set(false);
      this.isMoreMenuOpen.set(false);
    }
  }
}
