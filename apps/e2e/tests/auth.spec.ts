import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';
import { DashboardPage } from '../pages/DashboardPage';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

test.describe('Authentication Flow', () => {
  test('should register a new user and land on dashboard', async ({ page }) => {
    const authPage = new AuthPage(page);
    const dashboardPage = new DashboardPage(page);

    const email = `e2e-${Date.now()}@test.com`;
    const password = 'TestPassword123!';
    const name = 'E2E Test User';

    await authPage.goto();
    await authPage.register(email, password, name);
    await authPage.waitForRedirect();

    expect(page.url()).toMatch(/\/(dashboard|home)/);
    expect(await dashboardPage.isWelcomeVisible()).toBeTruthy();
  });

  test('should login with registered user', async ({ page }) => {
    const authPage = new AuthPage(page);
    const dashboardPage = new DashboardPage(page);

    const email = `e2e-${Date.now()}@test.com`;
    const password = 'TestPassword123!';
    const name = 'E2E Test User';

    // Register user via API
    await axios.post(`${API_BASE_URL}/api/auth/register`, {
      email,
      password,
      name,
    });

    await authPage.goto();
    await authPage.login(email, password);
    await authPage.waitForRedirect();

    expect(page.url()).toMatch(/\/(dashboard|home)/);
    expect(await dashboardPage.isWelcomeVisible()).toBeTruthy();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const authPage = new AuthPage(page);

    await authPage.goto();
    await authPage.login('nonexistent@test.com', 'wrongpassword');

    const errorMessage = await authPage.getErrorMessage();
    expect(errorMessage).toBeTruthy();
    expect(errorMessage?.toLowerCase()).toContain('invalid');
  });

  test('should redirect unauthenticated user to /auth', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.goto();
    await page.waitForURL(/\/auth/);

    expect(page.url()).toContain('/auth');
  });

  test('should logout user successfully', async ({ page }) => {
    const authPage = new AuthPage(page);
    const dashboardPage = new DashboardPage(page);

    const email = `e2e-${Date.now()}@test.com`;
    const password = 'TestPassword123!';
    const name = 'E2E Test User';

    // Register and login
    await authPage.goto();
    await authPage.register(email, password, name);
    await authPage.waitForRedirect();

    // Logout
    await dashboardPage.logout();
    await page.waitForURL(/\/auth/);

    expect(page.url()).toContain('/auth');

    // Verify cannot access protected route
    await dashboardPage.goto();
    await page.waitForURL(/\/auth/);
    expect(page.url()).toContain('/auth');
  });
});
