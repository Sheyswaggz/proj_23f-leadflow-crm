import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';

describe('GET /health', () => {
  const app = createApp();

  it('should return 200 with status ok', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
    expect(response.body.data.timestamp).toBeDefined();

    const timestamp = new Date(response.body.data.timestamp);
    expect(timestamp.toISOString()).toBe(response.body.data.timestamp);
  });

  it('should include uptime as a number', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.data.uptime).toBeDefined();
    expect(typeof response.body.data.uptime).toBe('number');
    expect(response.body.data.uptime).toBeGreaterThanOrEqual(0);
  });
});
