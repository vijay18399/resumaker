import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model (POM) for Resumaker Main Page
 * Encapsulates selectors, locators, and user interactions cleanly.
 */
export class ResumakerPage {
  readonly page: Page;

  // Header Elements
  readonly header: Locator;
  readonly brandLogo: Locator;
  readonly templateSelect: Locator;
  readonly stylePopoverBtn: Locator;
  readonly stylePopoverCard: Locator;
  readonly moreMenuBtn: Locator;
  readonly moreMenuDropdown: Locator;
  readonly importInput: Locator;
  readonly exportJsonBtn: Locator;
  readonly downloadPdfBtn: Locator;

  // Sidebar Elements
  readonly sidebar: Locator;
  readonly navItems: Locator;

  // Form Panes
  readonly basicsForm: Locator;
  readonly workForm: Locator;
  readonly addPositionBtn: Locator;

  // Preview Elements
  readonly preview: Locator;
  readonly previewSvg: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.header = page.locator('app-header');
    this.brandLogo = page.locator('.brand-logo');
    this.templateSelect = page.locator('select.theme-dropdown-select');
    this.stylePopoverBtn = page.locator('#btn-open-style');
    this.stylePopoverCard = page.locator('.style-popover-card');
    this.moreMenuBtn = page.locator('#btn-more-options');
    this.moreMenuDropdown = page.locator('.more-menu-dropdown');
    this.importInput = page.locator('app-header input[type="file"]');
    this.exportJsonBtn = page.locator('#btn-export-json');
    this.downloadPdfBtn = page.locator('button.btn-download');

    // Sidebar
    this.sidebar = page.locator('app-sidebar');
    this.navItems = page.locator('app-sidebar .nav-item');

    // Forms
    this.basicsForm = page.locator('app-basics-form');
    this.workForm = page.locator('app-work-form');
    this.addPositionBtn = page.locator('button.btn-nuxt-primary').filter({ hasText: 'Add Position' });

    // Preview
    this.preview = page.locator('app-preview');
    this.previewSvg = page.locator('app-preview svg');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    // Wait for Typst WASM compilation to mount the SVG
    await this.previewSvg.first().waitFor({ state: 'visible', timeout: 20000 });
  }

  async openStylePopover(): Promise<void> {
    if (!await this.stylePopoverCard.isVisible()) {
      await this.stylePopoverBtn.click();
      await expect(this.stylePopoverCard).toBeVisible();
    }
  }

  async closeStylePopover(): Promise<void> {
    if (await this.stylePopoverCard.isVisible()) {
      await this.page.locator('.btn-popover-close').click();
      await expect(this.stylePopoverCard).not.toBeVisible();
    }
  }

  async openMoreMenu(): Promise<void> {
    // No-op for backward compatibility: Import/Export buttons are now directly accessible
  }

  async selectNavSection(sectionName: string): Promise<void> {
    const item = this.navItems.filter({ hasText: new RegExp(sectionName, 'i') }).first();
    await item.click();
  }

  async toggleSectionVisibility(sectionName: string): Promise<void> {
    const item = this.navItems.filter({ hasText: new RegExp(sectionName, 'i') }).first();
    const toggleBtn = item.locator('.btn-visibility-toggle');
    await toggleBtn.click();
  }

  async fillFullName(name: string): Promise<void> {
    const nameInput = this.basicsForm.locator('input').first();
    await nameInput.fill(name);
  }

  async selectTemplate(templateId: string): Promise<void> {
    await this.templateSelect.selectOption(templateId);
    // Wait for re-render
    await this.previewSvg.first().waitFor({ state: 'visible', timeout: 15000 });
  }
}
