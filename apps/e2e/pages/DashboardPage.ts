import { type Page } from '@playwright/test';

export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/dashboard');
  }

  async isWelcomeVisible() {
    const welcomeElement = this.page.locator('h1, h2, [data-testid="welcome"]');
    return await welcomeElement.isVisible();
  }

  async logout() {
    await this.page.click('button:has-text("Logout"), [aria-label="Logout"]');
  }

  async getWelcomeText() {
    const welcomeElement = this.page.locator('h1, h2, [data-testid="welcome"]');
    return await welcomeElement.textContent();
  }
}
