import { Injectable } from '@angular/core';
import { ResumeData, TemplateId, TemplateMetadata, TemplateConfig } from '../models/resume.model';
import { ResumeTemplate, stripInternalNavLinks } from '../templates';
import {
  BasicResumeTemplate,
  ModernCvTemplate,
  SimpleTechnicalTemplate,
  BrilliantCvTemplate,
  AtstheticCvTemplate,
  GridCvTemplate,
  ModernResumeTemplate,
  ResumeOfaTemplate
} from '../templates';

/**
 * Central Template Registry (Themes)
 * Follows Open-Closed Principle (OCP) and Dependency Inversion (DIP).
 */
@Injectable({
  providedIn: 'root'
})
export class TemplateRegistryService {
  private templates = new Map<TemplateId, ResumeTemplate>();

  constructor() {
    this.registerAll([
      new BasicResumeTemplate(),
      new ModernCvTemplate(),
      new SimpleTechnicalTemplate(),
      new BrilliantCvTemplate(),
      new AtstheticCvTemplate(),
      new GridCvTemplate(),
      new ModernResumeTemplate(),
      new ResumeOfaTemplate()
    ]);
  }

  register(template: ResumeTemplate): void {
    this.templates.set(template.id, template);
  }

  registerAll(templates: ResumeTemplate[]): void {
    for (const t of templates) {
      this.templates.set(t.id, t);
    }
  }

  get metadataList(): TemplateMetadata[] {
    return Array.from(this.templates.values()).map(t => ({
      id: t.id,
      name: t.name,
      defaultPrimaryColor: t.defaultPrimaryColor,
      credit: t.metadata?.credit,
      description: t.metadata?.description,
      previewImg: t.metadata?.previewImg,
      tags: t.metadata?.tags
    }));
  }

  getTemplate(id: TemplateId): ResumeTemplate {
    // Support "pro" theme alias pointing to BasicResumeTemplate / ModernCvTemplate
    if (id === 'pro') {
      return this.templates.get('basic_resume') || Array.from(this.templates.values())[0];
    }
    return this.templates.get(id) || this.templates.get('basic_resume') || Array.from(this.templates.values())[0];
  }

  getDefaultColor(id: TemplateId): string {
    const tmpl = this.getTemplate(id);
    return tmpl.defaultPrimaryColor || '#0f172a';
  }

  render(id: TemplateId, data: ResumeData, sectionOrder?: string[], config?: TemplateConfig): string {
    const tmpl = this.getTemplate(id);
    return tmpl.render(data, config, sectionOrder);
  }

  renderForPdf(id: TemplateId, data: ResumeData, sectionOrder?: string[], config?: TemplateConfig): string {
    const code = this.render(id, data, sectionOrder, config);
    return stripInternalNavLinks(code);
  }
}
