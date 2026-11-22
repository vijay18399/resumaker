import {
  Component,
  OnInit,
  inject,
  computed,
  signal,
  effect,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ResumeStore } from './services/resume-store.service';
import { TemplateRegistryService } from './services/template-registry.service';
import { TypstCompilerService } from './services/typst-compiler.service';
import { TemplateId } from './models/resume.model';
import { FormSection } from './models/section-nav.config';
import { JsonResumeAdapter } from './services/json-resume-adapter';

// Child components
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { PreviewComponent } from './components/preview/preview.component';

// Section Forms
import { BasicsFormComponent } from './components/forms/basics-form.component';
import { SummaryFormComponent } from './components/forms/summary-form.component';
import { WorkFormComponent } from './components/forms/work-form.component';
import { ProjectsFormComponent } from './components/forms/projects-form.component';
import { SkillsFormComponent } from './components/forms/skills-form.component';
import { EducationFormComponent } from './components/forms/education-form.component';
import { CertificatesFormComponent } from './components/forms/certificates-form.component';
import { AwardsFormComponent } from './components/forms/awards-form.component';
import { LanguagesFormComponent } from './components/forms/languages-form.component';
import { InterestsFormComponent } from './components/forms/interests-form.component';
import { VolunteerFormComponent } from './components/forms/volunteer-form.component';
import { ReferencesFormComponent } from './components/forms/references-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    SidebarComponent,
    PreviewComponent,
    BasicsFormComponent,
    SummaryFormComponent,
    WorkFormComponent,
    ProjectsFormComponent,
    SkillsFormComponent,
    EducationFormComponent,
    CertificatesFormComponent,
    AwardsFormComponent,
    LanguagesFormComponent,
    InterestsFormComponent,
    VolunteerFormComponent,
    ReferencesFormComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  readonly store = inject(ResumeStore);
  readonly registry = inject(TemplateRegistryService);
  readonly compiler = inject(TypstCompilerService);
  readonly sanitizer = inject(DomSanitizer);

  // Template metadata for UI picker
  readonly templates = this.registry.metadataList;

  // Rendered Safe SVG HTML pages (array of pages)
  readonly renderedPages = signal<SafeHtml[]>([]);
  readonly isGeneratingPdf = signal<boolean>(false);

  // Mobile viewport tab toggle ('editor' | 'preview')
  readonly mobileTab = signal<'editor' | 'preview'>('editor');

  // Active Typst code string
  readonly generatedCode = computed(() => {
    const activeTemplate = this.store.selectedTemplateId();
    const data = this.store.resumeData();
    const order = this.store.sections().map(s => s.id);
    const config = this.store.templateConfig();
    return this.registry.render(activeTemplate, data, order, config);
  });

  private debounceTimer: any = null;

  constructor() {
    // Reactive compile trigger whenever resume data, template or WASM readiness changes
    effect(() => {
      const isReady = this.compiler.isReady();
      const code = this.generatedCode();

      if (isReady && code) {
        this.scheduleCompile(code);
      }
    });
  }

  ngOnInit(): void {
    this.store.setCustomTypstCode(this.generatedCode());
  }

  scheduleCompile(code: string): void {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.compile(code);
    }, 120);
  }

  async compile(code: string): Promise<void> {
    try {
      const pageSvgs = await this.compiler.compileToPages(code);
      const safePages = pageSvgs.map(pageSvg => 
        this.sanitizer.bypassSecurityTrustHtml(pageSvg)
      );

      this.renderedPages.set(safePages);
    } catch (err) {
      console.error('Compilation failed', err);
    }
  }

  onTemplateChange(newId: string): void {
    this.store.setTemplate(newId as TemplateId);
    this.store.setCustomTypstCode(this.registry.render(newId as TemplateId, this.store.resumeData()));
  }

  onExportJson(): void {
    try {
      const activeTemplate = this.store.selectedTemplateId();
      const standardJsonResume = JsonResumeAdapter.toJsonResume(this.store.resumeData(), activeTemplate);
      const jsonStr = JSON.stringify(standardJsonResume, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resumaker.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to export JSON: ' + (err?.message || err));
    }
  }

  onImportJsonFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid JSON format.');
        }

        const normalized = JsonResumeAdapter.toResumakerData(parsed);
        this.store.loadData(normalized);
      } catch (err: any) {
        alert('Failed to import JSON data: ' + (err?.message || err));
      }
    };
    reader.readAsText(file);
  }

  async onDownloadPdf(): Promise<void> {
    this.isGeneratingPdf.set(true);
    const activeTemplate = this.store.selectedTemplateId();
    const data = this.store.resumeData();
    const order = this.store.sections().map(s => s.id);
    const config = this.store.templateConfig();
    const pdfCode = this.registry.renderForPdf(activeTemplate, data, order, config);

    try {
      const name = (this.store.basics().name || 'Resume').replace(/\s+/g, '_');
      await this.compiler.downloadPdf(pdfCode, `${name}_Resume.pdf`);
    } catch (e: any) {
      alert('Failed to generate PDF: ' + (e?.message || e));
    } finally {
      this.isGeneratingPdf.set(false);
    }
  }

  // --- Interactive Preview & Navigation ---
  onPreviewClick(event: MouseEvent): void {
    const target = event.target as Element | null;
    if (!target) return;

    // Switch to editor view on mobile if an interactive link was tapped
    const linkEl = target.closest('a');
    if (linkEl) {
      this.mobileTab.set('editor');
    }
    if (linkEl) {
      const href = linkEl.getAttribute('href') || linkEl.getAttribute('xlink:href') || '';
      if (href.startsWith('nav:section:')) {
        const secId = href.replace('nav:section:', '');
        const targetSection = secId === 'experience' ? 'work' : secId;
        if (this.isValidSection(targetSection)) {
          this.store.setActiveSection(targetSection as FormSection);
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }
      if (href.startsWith('nav:entry:')) {
        const parts = href.replace('nav:entry:', '').split(':');
        let secId = parts[0];
        if (secId === 'experience') secId = 'work';
        const itemId = parts[1];
        if (secId && itemId && this.isValidSection(secId)) {
          this.scrollToSubItem(secId as FormSection, itemId);
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }
    }

    // 2. Exact data-section attribute if embedded in SVG/HTML container
    const sectionAttr = target.closest('[data-section]')?.getAttribute('data-section');
    if (sectionAttr && this.isValidSection(sectionAttr)) {
      this.store.setActiveSection(sectionAttr as FormSection);
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  }

  private isValidSection(id: string): id is FormSection {
    return this.store.sectionList.some(s => s.id === id);
  }

  scrollToSubItem(sectionId: any, itemId: string): void {
    this.store.setActiveSection(sectionId, itemId);
    setTimeout(() => {
      const el = document.getElementById(itemId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('flash-highlight');
        setTimeout(() => el.classList.remove('flash-highlight'), 1200);
      }
    }, 50);
  }
}
