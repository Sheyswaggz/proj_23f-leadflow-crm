import { type Page, type Locator } from '@playwright/test';

export class FollowUpsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/follow-ups');
  }

  async clickTab(tab: 'All' | 'Overdue' | 'Upcoming') {
    await this.page.click(`button:has-text("${tab}")`);
  }

  async getReminderItems(): Promise<Locator[]> {
    const items = await this.page.locator('[data-testid="reminder-item"], .reminder-item, [class*="Card"]').all();
    return items;
  }

  async markReminderComplete(leadName: string) {
    const reminderItem = await this.getReminderByLeadName(leadName);
    const markDoneButton = reminderItem.locator('button:has-text("Mark Done")');
    await markDoneButton.click();
  }

  async getOverdueCount(): Promise<string | null> {
    const badge = this.page.locator('button:has-text("Overdue") [class*="Badge"], button:has-text("Overdue") .badge');
    return await badge.textContent();
  }

  getReminderByLeadName(leadName: string): Locator {
    return this.page.locator(`[data-testid="reminder-item"]:has-text("${leadName}"), .reminder-item:has-text("${leadName}"), [class*="Card"]:has-text("${leadName}")`).first();
  }
}
