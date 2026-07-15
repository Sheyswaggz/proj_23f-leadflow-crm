import { type Page } from '@playwright/test';

export class LeadDetailPage {
  constructor(private page: Page) {}

  async goto(leadId: string) {
    await this.page.goto(`/leads/${leadId}`);
  }

  async clickEdit() {
    await this.page.click('button:has-text("Edit")');
  }

  async fillField(label: string, value: string) {
    const input = this.page.locator(`input[name="${label}"], label:has-text("${label}") + input`);
    await input.fill(value);
  }

  async clickSave() {
    await this.page.click('button:has-text("Save")');
  }

  async clickCancel() {
    await this.page.click('button:has-text("Cancel")');
  }

  async changeStage(stage: string) {
    await this.page.selectOption(
      'select[name="stage"], [data-testid="stage-selector"]',
      stage
    );
  }

  async getStageText() {
    const stageBadge = this.page.locator('[data-testid="stage-badge"], .badge, [role="status"]');
    return await stageBadge.textContent();
  }

  async clickDelete() {
    await this.page.click('button:has-text("Delete")');
  }

  async confirmDelete() {
    await this.page.click('[role="dialog"] button:has-text("Delete"), [role="dialog"] button:has-text("Confirm")');
  }

  async getLeadName() {
    const heading = this.page.locator('h1, h2, [data-testid="lead-name"]');
    return await heading.textContent();
  }

  async waitForSaveSuccess() {
    await this.page.waitForSelector('[role="alert"]:has-text("Success"), [role="alert"]:has-text("Saved")');
  }
}
