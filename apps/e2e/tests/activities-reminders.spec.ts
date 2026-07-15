import { test, expect } from '@playwright/test';
import { LeadDetailPage } from '../pages/LeadDetailPage';
import { FollowUpsPage } from '../pages/FollowUpsPage';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';
let testLeadId: string;
let authToken: string;

test.use({ storageState: '.auth/user.json' });

test.describe('Activity Log & Follow-Up Reminder Workflows', () => {
  test.beforeAll(async () => {
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'test@example.com',
        password: 'TestPassword123!',
      });

      authToken = loginResponse.data.token;

      const createLeadResponse = await axios.post(
        `${API_BASE_URL}/api/leads`,
        {
          name: `Activity Test Lead ${Date.now()}`,
          company: 'Activity Test Corp',
          email: 'activity@test.com',
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      testLeadId = createLeadResponse.data.id;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Setup failed:', error);
    }
  });

  test.afterAll(async () => {
    if (testLeadId && authToken) {
      try {
        await axios.delete(`${API_BASE_URL}/api/leads/${testLeadId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`Failed to cleanup lead ${testLeadId}`);
      }
    }
  });

  test('user can log a CALL activity', async ({ page }) => {
    const leadDetailPage = new LeadDetailPage(page);

    await leadDetailPage.goto(testLeadId);

    await page.selectOption('select[name="type"], [data-testid="activity-type-select"]', 'CALL');
    await page.fill(
      'textarea[name="content"], [data-testid="activity-content"]',
      'Called to discuss proposal'
    );
    await page.click('button:has-text("Log Activity"), button:has-text("Add Activity")');

    const activityItem = page.locator(
      '[data-testid="activity-item"]:has-text("Called to discuss proposal"), .activity-item:has-text("Called to discuss proposal")'
    );
    await expect(activityItem).toBeVisible();
  });

  test('user can log a NOTE activity', async ({ page }) => {
    const leadDetailPage = new LeadDetailPage(page);

    await leadDetailPage.goto(testLeadId);

    await page.selectOption('select[name="type"], [data-testid="activity-type-select"]', 'NOTE');
    await page.fill(
      'textarea[name="content"], [data-testid="activity-content"]',
      'Internal note about lead status'
    );
    await page.click('button:has-text("Log Activity"), button:has-text("Add Activity")');

    const activityTimeline = page.locator(
      '[data-testid="activity-timeline"], .activity-timeline, [class*="activity"]'
    );
    const noteActivity = activityTimeline.locator('text="Internal note about lead status"').first();
    await expect(noteActivity).toBeVisible();
  });

  test('user can schedule a future reminder', async ({ page }) => {
    const leadDetailPage = new LeadDetailPage(page);

    await leadDetailPage.goto(testLeadId);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().slice(0, 16);

    await page.fill('input[type="datetime-local"], input[name="dueAt"]', tomorrowString);
    await page.fill(
      'textarea[name="note"], input[name="note"], [data-testid="reminder-note"]',
      'Follow up on proposal'
    );
    await page.click('button:has-text("Add Reminder"), button:has-text("Schedule Reminder")');

    const reminderItem = page.locator(
      '[data-testid="reminder-item"]:has-text("Follow up on proposal"), .reminder-item:has-text("Follow up on proposal")'
    );
    await expect(reminderItem).toBeVisible();
  });

  test('overdue reminder shown in red', async ({ page }) => {
    const leadDetailPage = new LeadDetailPage(page);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const overdueDate = yesterday.toISOString();

    try {
      await axios.post(
        `${API_BASE_URL}/api/reminders`,
        {
          leadId: testLeadId,
          dueAt: overdueDate,
          note: 'Overdue test reminder',
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to create overdue reminder via API');
    }

    await leadDetailPage.goto(testLeadId);

    const overdueReminder = page.locator(
      '[data-testid="reminder-item"]:has-text("Overdue test reminder"), .reminder-item:has-text("Overdue test reminder")'
    ).first();
    await expect(overdueReminder).toBeVisible();

    const overdueBadge = overdueReminder.locator(
      '[class*="destructive"], [class*="red"], .badge:has-text("Overdue")'
    );
    await expect(overdueBadge).toBeVisible();
  });

  test('user can mark reminder as complete', async ({ page }) => {
    const leadDetailPage = new LeadDetailPage(page);

    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 2);
    const futureDateString = futureDate.toISOString();

    let reminderId: string;
    try {
      const reminderResponse = await axios.post(
        `${API_BASE_URL}/api/reminders`,
        {
          leadId: testLeadId,
          dueAt: futureDateString,
          note: 'Reminder to mark complete',
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      reminderId = reminderResponse.data.id;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to create reminder via API');
      return;
    }

    await leadDetailPage.goto(testLeadId);

    const reminderItem = page.locator(
      '[data-testid="reminder-item"]:has-text("Reminder to mark complete"), .reminder-item:has-text("Reminder to mark complete")'
    ).first();
    await expect(reminderItem).toBeVisible();

    const markDoneButton = reminderItem.locator('button:has-text("Mark Done")');
    await markDoneButton.click();

    const completedState = reminderItem.locator(
      'text="Completed", [class*="green"], [class*="completed"]'
    );
    await expect(completedState).toBeVisible({ timeout: 10000 });
  });

  test('follow-ups page shows overdue reminders', async ({ page }) => {
    const followUpsPage = new FollowUpsPage(page);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const overdueDate = yesterday.toISOString();

    const overdueLeadName = `Overdue Lead ${Date.now()}`;

    let overdueLeadId: string;
    try {
      const leadResponse = await axios.post(
        `${API_BASE_URL}/api/leads`,
        {
          name: overdueLeadName,
          company: 'Overdue Corp',
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      overdueLeadId = leadResponse.data.id;

      await axios.post(
        `${API_BASE_URL}/api/reminders`,
        {
          leadId: overdueLeadId,
          dueAt: overdueDate,
          note: 'Overdue follow-up',
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to create overdue reminder via API');
      return;
    }

    await followUpsPage.goto();

    const reminderItem = followUpsPage.getReminderByLeadName(overdueLeadName);
    await expect(reminderItem).toBeVisible();

    const overdueBadge = page.locator(
      '[class*="Badge"][class*="destructive"]:has-text("Overdue"), .badge:has-text("Overdue")'
    ).first();
    await expect(overdueBadge).toBeVisible();

    if (overdueLeadId) {
      try {
        await axios.delete(`${API_BASE_URL}/api/leads/${overdueLeadId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`Failed to cleanup overdue lead ${overdueLeadId}`);
      }
    }
  });

  test('follow-ups upcoming tab shows upcoming reminders', async ({ page }) => {
    const followUpsPage = new FollowUpsPage(page);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const upcomingDate = tomorrow.toISOString();

    const upcomingLeadName = `Upcoming Lead ${Date.now()}`;

    let upcomingLeadId: string;
    try {
      const leadResponse = await axios.post(
        `${API_BASE_URL}/api/leads`,
        {
          name: upcomingLeadName,
          company: 'Upcoming Corp',
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      upcomingLeadId = leadResponse.data.id;

      await axios.post(
        `${API_BASE_URL}/api/reminders`,
        {
          leadId: upcomingLeadId,
          dueAt: upcomingDate,
          note: 'Upcoming follow-up',
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to create upcoming reminder via API');
      return;
    }

    await followUpsPage.goto();

    await followUpsPage.clickTab('Upcoming');

    const reminderItem = followUpsPage.getReminderByLeadName(upcomingLeadName);
    await expect(reminderItem).toBeVisible();

    if (upcomingLeadId) {
      try {
        await axios.delete(`${API_BASE_URL}/api/leads/${upcomingLeadId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`Failed to cleanup upcoming lead ${upcomingLeadId}`);
      }
    }
  });
});
