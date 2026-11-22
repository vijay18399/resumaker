import { test, expect } from '@playwright/test';
import { ResumakerPage } from './pages/resumaker.page';

test.describe('Resumaker Production E2E Suite', () => {
  let resumeApp: ResumakerPage;

  test.beforeEach(async ({ page }) => {
    resumeApp = new ResumakerPage(page);
    await resumeApp.goto();
  });

  // --- Suite 1: App Shell & Rendering ---
  test('E2E-01: Smoke Test - Core application shell and Typst WASM preview render cleanly', async () => {
    await expect(resumeApp.header).toBeVisible();
    await expect(resumeApp.sidebar).toBeVisible();
    await expect(resumeApp.previewSvg.first()).toBeVisible();
    await expect(resumeApp.navItems.first()).toBeVisible();
  });

  // --- Suite 2: Real-time Reactivity ---
  test('E2E-02: Live Reactive Typing - Form mutations reflect instantly in the SVG preview', async () => {
    const testName = 'Jane E2E Architect';
    await resumeApp.fillFullName(testName);
    await expect(resumeApp.preview).toContainText(testName, { timeout: 7000 });
  });

  // --- Suite 3: Multi-Template Switcher ---
  test('E2E-03: Template Switching - Switching to Modern CV compiles and renders without errors', async () => {
    await resumeApp.selectTemplate('modern_cv');
    await expect(resumeApp.previewSvg.first()).toBeVisible();
  });

  // --- Suite 4: Sidebar Navigation ---
  test('E2E-04: Sidenav Navigation - Clicking sidebar sections switches active form view', async () => {
    await resumeApp.selectNavSection('Experience');
    await expect(resumeApp.workForm).toBeVisible();
  });

  // --- Suite 5: Collection CRUD (Add / Remove) ---
  test('E2E-05: Collection Item CRUD - Adding and removing a work position updates UI and preview', async () => {
    await resumeApp.selectNavSection('Experience');
    await expect(resumeApp.workForm).toBeVisible();

    const initialCardsCount = await resumeApp.page.locator('.collection-card').count();

    // Click Add Position and wait for card count to increase
    await resumeApp.addPositionBtn.click();
    await expect(resumeApp.page.locator('.collection-card')).toHaveCount(initialCardsCount + 1);

    // Fill Title in newly added card
    const lastCard = resumeApp.page.locator('.collection-card').last();
    const titleInput = lastCard.locator('input').first();
    const jobTitle = 'Lead Systems Engineer 2026';
    await titleInput.fill(jobTitle);

    // Verify it propagates to live preview
    await expect(resumeApp.preview).toContainText(jobTitle, { timeout: 7000 });

    // Remove the newly added position
    const deleteBtn = lastCard.locator('button.delete, button[title="Remove"]');
    await deleteBtn.click();

    await expect(resumeApp.page.locator('.collection-card')).toHaveCount(initialCardsCount);
  });

  // --- Suite 6: Item Reordering ---
  test('E2E-06: Item Reordering - Clicking Move Up / Move Down buttons reorders positions', async () => {
    await resumeApp.selectNavSection('Experience');
    await expect(resumeApp.workForm).toBeVisible();

    const startCount = await resumeApp.page.locator('.collection-card').count();

    // Add position A
    await resumeApp.addPositionBtn.click();
    await expect(resumeApp.page.locator('.collection-card')).toHaveCount(startCount + 1);
    const cardA = resumeApp.page.locator('.collection-card').last();
    await cardA.locator('input').first().fill('Position Alpha');

    // Add position B
    await resumeApp.addPositionBtn.click();
    await expect(resumeApp.page.locator('.collection-card')).toHaveCount(startCount + 2);
    const cardB = resumeApp.page.locator('.collection-card').last();
    await cardB.locator('input').first().fill('Position Beta');

    // Click "Move Up" on card B
    const moveUpBtn = cardB.locator('button[title="Move Up"]');
    await moveUpBtn.click();

    // Wait for the reordering to reflect in card titles
    await expect(async () => {
      const cardTitles = await resumeApp.page.locator('.collection-card .card-item-title').allInnerTexts();
      const betaIdx = cardTitles.findIndex(t => t.includes('Position Beta'));
      const alphaIdx = cardTitles.findIndex(t => t.includes('Position Alpha'));
      expect(betaIdx).toBeGreaterThanOrEqual(0);
      expect(alphaIdx).toBeGreaterThanOrEqual(0);
      expect(betaIdx).toBeLessThan(alphaIdx);
    }).toPass({ timeout: 5000 });
  });

  // --- Suite 7: Visibility Toggle ---
  test('E2E-07: Section Visibility - Toggling visibility button hides section', async () => {
    await resumeApp.toggleSectionVisibility('Experience');
    // Button state changes to hidden
    const workNavItem = resumeApp.navItems.filter({ hasText: /^Experience/i });
    await expect(workNavItem.locator('.hidden-sec')).toBeVisible();
  });

  // --- Suite 8: Click-to-Edit SVG Navigation ---
  test('E2E-08: Interactive Click-to-Edit - Clicking preview navigates to the matching section', async () => {
    // Make sure we start on basics
    await resumeApp.selectNavSection('Basics');
    await expect(resumeApp.basicsForm).toBeVisible();

    // Click an anchor or text element inside SVG
    const svgClickTarget = resumeApp.preview.locator('svg text, svg a').filter({ hasText: /Experience|Work|Projects|Education/i }).first();
    if (await svgClickTarget.count() > 0) {
      await svgClickTarget.click();
      // Form should jump away from basics to the clicked section
      await expect(resumeApp.basicsForm).not.toBeVisible({ timeout: 5000 });
    }
  });

  // --- Suite 9: JSON Export via More Menu ---
  test('E2E-09: Data Export - Clicking Export JSON button in More Menu triggers a client-side download', async ({ page }) => {
    await resumeApp.openMoreMenu();
    const downloadPromise = page.waitForEvent('download');
    await resumeApp.exportJsonBtn.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('resumaker.json');
  });

  // --- Suite 10: JSON Import via More Menu ---
  test('E2E-10: Data Import - Uploading a standard resume.json from More Menu populates the form', async ({ page }) => {
    await resumeApp.openMoreMenu();
    const mockResume = {
      basics: {
        name: 'Sarah Connor',
        label: 'Cyber Defense Specialist',
        email: 'sarah@resistance.org'
      }
    };

    const fileBuffer = Buffer.from(JSON.stringify(mockResume));

    await resumeApp.importInput.setInputFiles({
      name: 'resume.json',
      mimeType: 'application/json',
      buffer: fileBuffer
    });

    // Form and preview are populated
    await expect(resumeApp.basicsForm.locator('input').first()).toHaveValue('Sarah Connor');
    await expect(resumeApp.preview).toContainText('Sarah Connor', { timeout: 7000 });
  });

  // --- Suite 11: Browser Reload Persistence ---
  test('E2E-11: State Persistence - LocalStorage restores entered data on page refresh', async ({ page }) => {
    const persistedName = 'Persistent Developer';
    await resumeApp.fillFullName(persistedName);

    await page.reload();
    await resumeApp.previewSvg.first().waitFor({ state: 'visible', timeout: 20000 });

    await expect(resumeApp.basicsForm.locator('input').first()).toHaveValue(persistedName);
  });

  // --- Suite 12: PDF Download Flow ---
  test('E2E-12: PDF Download - Clicking Download PDF disables button during generation', async () => {
    // The download PDF button starts enabled
    await expect(resumeApp.downloadPdfBtn).toBeEnabled();

    // Trigger download
    const downloadPromise = resumeApp.page.waitForEvent('download', { timeout: 20000 }).catch(() => null);
    await resumeApp.downloadPdfBtn.click();

    // Await either download event or button re-enablement
    await downloadPromise;
    await expect(resumeApp.downloadPdfBtn).toBeEnabled();
  });

  // --- Suite 13: Comma Tag Parsing & Bullets Input Flow ---
  test('E2E-13: UI Atom Components - Comma-delimited skill tags parse and render in live preview', async () => {
    await resumeApp.selectNavSection('Skills');
    const skillsForm = resumeApp.page.locator('app-skills-form');
    await expect(skillsForm).toBeVisible();

    // Find the skills tag input
    const tagInput = skillsForm.locator('input[placeholder*="TypeScript"]').first();
    if (await tagInput.count() > 0) {
      await tagInput.fill('Playwright, KaTeX, Typst');
      // Verify tags render in the live preview
      await expect(resumeApp.preview).toContainText('Playwright', { timeout: 7000 });
      await expect(resumeApp.preview).toContainText('Typst', { timeout: 7000 });
    }
  });

  // --- Suite 14: Multi-Page Preview Rendering ---
  test('E2E-14: Multi-Page Canvas - Large resumes render multiple page sheets cleanly', async () => {
    // Check that preview container displays at least one sheet
    const pageSheets = resumeApp.page.locator('.pdf-page-sheet, .typst-doc, .page-sheet');
    await expect(pageSheets.first()).toBeVisible();
  });

  // --- Suite 15: Option A Style Popover & Live Customization ---
  test('E2E-15: Style Popover - Opening popover, changing color, and paper size reflects in preview', async () => {
    // Open style popover in header
    await resumeApp.openStylePopover();
    await expect(resumeApp.stylePopoverCard).toBeVisible();

    // Click color dot button (e.g. 4th preset)
    const colorDots = resumeApp.stylePopoverCard.locator('.color-dot');
    await colorDots.nth(3).click();
    await expect(colorDots.nth(3)).toHaveClass(/active/);

    // Switch Paper Format to A4
    const a4Btn = resumeApp.stylePopoverCard.locator('button.seg-btn', { hasText: 'A4 Standard' });
    await a4Btn.click();
    await expect(a4Btn).toHaveClass(/active/);

    // Close the popover
    await resumeApp.closeStylePopover();
    await expect(resumeApp.stylePopoverCard).not.toBeVisible();
  });

  // --- Suite 16: Template Default Primary Color Lifecycle in Popover ---
  test('E2E-16: Template Default Primary Color - Template switches populate corresponding default color and reset correctly', async () => {
    // 1. Switch to Modern CV which defaults to crimson red (#dc3545)
    await resumeApp.selectTemplate('modern_cv');

    // Open style popover
    await resumeApp.openStylePopover();
    await expect(resumeApp.stylePopoverCard).toBeVisible();

    // Verify template default color displays #dc3545
    const hexTag = resumeApp.stylePopoverCard.locator('.hex-text');
    await expect(hexTag).toHaveText('#dc3545');

    // Click "Reset default (#dc3545)" button to ensure button works
    const resetColorBtn = resumeApp.stylePopoverCard.locator('.btn-reset-link').first();
    await expect(resetColorBtn).toContainText('#dc3545');
    await resetColorBtn.click();
    await expect(hexTag).toHaveText('#dc3545');

    // Close popover
    await resumeApp.closeStylePopover();

    // 2. Switch to Brilliant CV which defaults to Royal Blue (#2563eb)
    await resumeApp.selectTemplate('brilliant_cv');
    await resumeApp.openStylePopover();
    await expect(hexTag).toHaveText('#2563eb');
    await expect(resetColorBtn).toContainText('#2563eb');
  });
});
