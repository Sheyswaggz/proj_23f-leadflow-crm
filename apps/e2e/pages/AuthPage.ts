import { type Page } from '@playwright/test';

export class AuthPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/auth');
  }

  async register(email: string, password: string, name: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.fill('input[name="name"]', name);
    await this.page.click('button:has-text("Register")');
  }

  async login(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button:has-text("Login")');
  }

  async getErrorMessage() {
    const errorElement = this.page.locator('[role="alert"], .error-message');
    return await errorElement.textContent();
  }

  async waitForRedirect() {
    await this.page.waitForURL(/\/(dashboard|home)/);
  }
}
