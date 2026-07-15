import { test, expect } from '@playwright/test';
import { LeadsPage } from '../pages/LeadsPage';
import { LeadDetailPage } from '../pages/LeadDetailPage';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';
const createdLeadIds: string[] = [];

test.use({ storageState: '.auth/user.json' });

test.describe('Lead Management Workflow', () => {
  test.beforeAll(async () => {
    // Login via API and save storageState
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'test@example.com',
        password: 'TestPassword123!',
      });

      if (loginResponse.data.token) {
        // Save authentication state
        // This would typically be handled by Playwright's context.storageState
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Login via API failed, tests may need manual authentication');
    }
  });

  test.afterAll(async () => {
    // Cleanup created leads via API
    for (const leadId of createdLeadIds) {
      try {
        await axios.delete(`${API_BASE_URL}/api/leads/${leadId}`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`Failed to cleanup lead ${leadId}`);
      }
    }
  });

  test('user can create a new lead', async ({ page }) => {
    const leadsPage = new LeadsPage(page);
    const timestamp = Date.now();
    const leadName = `E2E Test Lead ${timestamp}`;

    await leadsPage.goto();
    await leadsPage.clickNewLead();
    await leadsPage.fillCreateLeadForm({
      name: leadName,
      company: 'E2E Corp',
    });
    await leadsPage.submitCreateLead();

    const leadCard = await leadsPage.getLeadCardByName(leadName);
    await expect(leadCard).toBeVisible();
  });

  test('user can view lead detail', async ({ page }) => {
    const leadsPage = new LeadsPage(page);
    const leadDetailPage = new LeadDetailPage(page);

    // Create lead via API
    const createResponse = await axios.post(`${API_BASE_URL}/api/leads`, {
      name: `API Lead ${Date.now()}`,
      company: 'API Corp',
    });
    const leadId = createResponse.data.id;
    createdLeadIds.push(leadId);

    await leadDetailPage.goto(leadId);

    const leadName = await leadDetailPage.getLeadName();
    expect(leadName).toBeTruthy();
    expect(leadName).toContain('API Lead');
  });

  test('user can edit lead contact info', async ({ page }) => {
    const leadDetailPage = new LeadDetailPage(page);

    // Create lead via API
    const createResponse = await axios.post(`${API_BASE_URL}/api/leads`, {
      name: `Edit Test Lead ${Date.now()}`,
      company: 'Old Company',
    });
    const leadId = createResponse.data.id;
    createdLeadIds.push(leadId);

    await leadDetailPage.goto(leadId);
    await leadDetailPage.clickEdit();
    await leadDetailPage.fillField('company', 'New Company Name');
    await leadDetailPage.clickSave();
    await leadDetailPage.waitForSaveSuccess();

    // Verify updated value
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('New Company Name');
  });

  test('user can change pipeline stage', async ({ page }) => {
    const leadDetailPage = new LeadDetailPage(page);

    // Create lead via API
    const createResponse = await axios.post(`${API_BASE_URL}/api/leads`, {
      name: `Stage Test Lead ${Date.now()}`,
      company: 'Stage Corp',
      stage: 'NEW',
    });
    const leadId = createResponse.data.id;
    createdLeadIds.push(leadId);

    await leadDetailPage.goto(leadId);
    await leadDetailPage.changeStage('CONTACTED');

    const stageText = await leadDetailPage.getStageText();
    expect(stageText?.toLowerCase()).toContain('contacted');
  });

  test('user can delete a lead', async ({ page }) => {
    const leadsPage = new LeadsPage(page);
    const leadDetailPage = new LeadDetailPage(page);
    const leadName = `Delete Test Lead ${Date.now()}`;

    // Create lead via API
    const createResponse = await axios.post(`${API_BASE_URL}/api/leads`, {
      name: leadName,
      company: 'Delete Corp',
    });
    const leadId = createResponse.data.id;

    await leadDetailPage.goto(leadId);
    await leadDetailPage.clickDelete();
    await leadDetailPage.confirmDelete();

    // Expect redirected to /leads
    await page.waitForURL(/\/leads/);
    expect(page.url()).toContain('/leads');

    // Verify lead not in list
    await leadsPage.goto();
    const leadCard = await leadsPage.getLeadCardByName(leadName);
    await expect(leadCard).not.toBeVisible();
  });

  test('search filters lead list', async ({ page }) => {
    const leadsPage = new LeadsPage(page);

    // Create 2 leads with distinct names
    const lead1Name = `Search Lead Alpha ${Date.now()}`;
    const lead2Name = `Search Lead Beta ${Date.now()}`;

    const lead1Response = await axios.post(`${API_BASE_URL}/api/leads`, {
      name: lead1Name,
      company: 'Alpha Corp',
    });
    createdLeadIds.push(lead1Response.data.id);

    const lead2Response = await axios.post(`${API_BASE_URL}/api/leads`, {
      name: lead2Name,
      company: 'Beta Corp',
    });
    createdLeadIds.push(lead2Response.data.id);

    await leadsPage.goto();
    await leadsPage.searchLeads('Alpha');

    // Expect only matching lead visible
    const alphaCard = await leadsPage.getLeadCardByName(lead1Name);
    await expect(alphaCard).toBeVisible();

    const betaCard = await leadsPage.getLeadCardByName(lead2Name);
    await expect(betaCard).not.toBeVisible();
  });

  test('stage filter shows only matching leads', async ({ page }) => {
    const leadsPage = new LeadsPage(page);

    // Create leads in different stages
    const qualifiedLeadName = `Qualified Lead ${Date.now()}`;
    const newLeadName = `New Lead ${Date.now()}`;

    const qualifiedResponse = await axios.post(`${API_BASE_URL}/api/leads`, {
      name: qualifiedLeadName,
      company: 'Qualified Corp',
      stage: 'QUALIFIED',
    });
    createdLeadIds.push(qualifiedResponse.data.id);

    const newResponse = await axios.post(`${API_BASE_URL}/api/leads`, {
      name: newLeadName,
      company: 'New Corp',
      stage: 'NEW',
    });
    createdLeadIds.push(newResponse.data.id);

    await leadsPage.goto();
    await leadsPage.filterByStage('QUALIFIED');

    // Expect only qualified leads visible
    const qualifiedCard = await leadsPage.getLeadCardByName(qualifiedLeadName);
    await expect(qualifiedCard).toBeVisible();

    const newCard = await leadsPage.getLeadCardByName(newLeadName);
    await expect(newCard).not.toBeVisible();
  });
});
