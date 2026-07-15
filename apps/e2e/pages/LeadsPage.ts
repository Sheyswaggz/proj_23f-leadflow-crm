import { type Page } from '@playwright/test';

export class LeadsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/leads');
  }

  async clickNewLead() {
    await this.page.click('button:has-text("New Lead")');
  }

  async fillCreateLeadForm(data: {
    name: string;
    company?: string;
    email?: string;
    stage?: string;
  }) {
    await this.page.fill('input[name="name"]', data.name);

    if (data.company) {
      await this.page.fill('input[name="company"]', data.company);
    }

    if (data.email) {
      await this.page.fill('input[name="email"]', data.email);
    }

    if (data.stage) {
      await this.page.selectOption('select[name="stage"]', data.stage);
    }
  }

  async submitCreateLead() {
    await this.page.click('button[type="submit"]');
  }

  async searchLeads(query: string) {
    await this.page.fill('input[type="search"], input[placeholder*="Search"]', query);
  }

  async filterByStage(stage: string) {
    await this.page.selectOption('select[name="stage"], [role="combobox"]', stage);
  }

  async getLeadCardByName(name: string) {
    return this.page.locator(`[data-testid="lead-card"]:has-text("${name}")`);
  }

  async clickLeadCard(name: string) {
    await this.page.click(`[data-testid="lead-card"]:has-text("${name}")`);
  }

  async getLeadCount() {
    return await this.page.locator('[data-testid="lead-card"]').count();
  }

  async clearFilters() {
    const clearButton = this.page.locator('button:has-text("Clear"), button:has-text("Reset")');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }
  }
}
