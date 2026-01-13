/**
 * Job Service Unit Tests
 *
 * Tests for the JobService class including:
 * - list, get, create, update, delete operations
 * - trigger, enable, disable operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobService } from '../../../src/client/services/jobs.service.js';
import type { BaseClient } from '../../../src/client/base-client.js';
import { createMockJob, mockJobs } from '../../fixtures/index.js';

describe('JobService', () => {
  let service: JobService;
  let mockClient: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };
    service = new JobService(mockClient as unknown as BaseClient);
  });

  // ==========================================================================
  // list()
  // ==========================================================================
  describe('list', () => {
    it('should call GET /api/v1/jobs', async () => {
      mockClient.get.mockResolvedValue(mockJobs);

      const result = await service.list();

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/jobs', { params: undefined });
      expect(result).toEqual(mockJobs);
    });

    it('should pass enabled filter', async () => {
      mockClient.get.mockResolvedValue(mockJobs);

      await service.list({ enabled: true });

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/jobs', {
        params: { enabled: true },
      });
    });

    it('should pass trigger_type filter', async () => {
      mockClient.get.mockResolvedValue(mockJobs);

      await service.list({ trigger_type: 'cron' });

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/jobs', {
        params: { trigger_type: 'cron' },
      });
    });

    it('should pass both filters combined', async () => {
      mockClient.get.mockResolvedValue(mockJobs);

      await service.list({ enabled: false, trigger_type: 'webhook' });

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/jobs', {
        params: { enabled: false, trigger_type: 'webhook' },
      });
    });

    it('should return empty array when no jobs', async () => {
      mockClient.get.mockResolvedValue([]);

      const result = await service.list();

      expect(result).toEqual([]);
    });
  });

  // ==========================================================================
  // get()
  // ==========================================================================
  describe('get', () => {
    it('should call GET /api/v1/jobs/{id}', async () => {
      const job = mockJobs[0];
      mockClient.get.mockResolvedValue(job);

      const result = await service.get('job-1');

      expect(mockClient.get).toHaveBeenCalledWith('/api/v1/jobs/job-1');
      expect(result).toEqual(job);
    });

    it('should propagate not found errors', async () => {
      mockClient.get.mockRejectedValue(new Error('Job not found'));

      await expect(service.get('nonexistent')).rejects.toThrow('Job not found');
    });
  });

  // ==========================================================================
  // create()
  // ==========================================================================
  describe('create', () => {
    it('should call POST /api/v1/jobs with data', async () => {
      const newJob = createMockJob({ name: 'New Job', trigger_type: 'cron' });
      mockClient.post.mockResolvedValue(newJob);

      const data = { name: 'New Job', trigger_type: 'cron', prompt_template: 'Test' };
      const result = await service.create(data);

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/jobs', data);
      expect(result.name).toBe('New Job');
    });

    it('should pass all job fields', async () => {
      const fullData = {
        name: 'Daily Report',
        description: 'Generate daily report',
        enabled: true,
        trigger_type: 'cron',
        cron_schedule: '0 9 * * *',
        cron_timezone: 'America/New_York',
        planning_mode: 'predefined_agent',
        entity_type: 'agent',
        entity_id: 'agent-123',
        prompt_template: 'Generate report for {{date}}',
        system_prompt: 'You are a reporting assistant.',
        executor_type: 'specific_queue',
        worker_queue_name: 'high-priority',
        config: { retries: 3 },
      };
      mockClient.post.mockResolvedValue(createMockJob(fullData));

      await service.create(fullData);

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/jobs', fullData);
    });
  });

  // ==========================================================================
  // update()
  // ==========================================================================
  describe('update', () => {
    it('should call PATCH /api/v1/jobs/{id} with data', async () => {
      const updated = { ...mockJobs[0], name: 'Updated Job' };
      mockClient.patch.mockResolvedValue(updated);

      const result = await service.update('job-1', { name: 'Updated Job' });

      expect(mockClient.patch).toHaveBeenCalledWith('/api/v1/jobs/job-1', { name: 'Updated Job' });
      expect(result.name).toBe('Updated Job');
    });

    it('should allow partial updates', async () => {
      mockClient.patch.mockResolvedValue(mockJobs[0]);

      await service.update('job-1', { enabled: false });

      expect(mockClient.patch).toHaveBeenCalledWith('/api/v1/jobs/job-1', { enabled: false });
    });

    it('should update schedule', async () => {
      mockClient.patch.mockResolvedValue({ ...mockJobs[0], cron_schedule: '0 10 * * *' });

      await service.update('job-1', { cron_schedule: '0 10 * * *' });

      expect(mockClient.patch).toHaveBeenCalledWith('/api/v1/jobs/job-1', {
        cron_schedule: '0 10 * * *',
      });
    });
  });

  // ==========================================================================
  // delete()
  // ==========================================================================
  describe('delete', () => {
    it('should call DELETE /api/v1/jobs/{id}', async () => {
      mockClient.delete.mockResolvedValue(undefined);

      await service.delete('job-1');

      expect(mockClient.delete).toHaveBeenCalledWith('/api/v1/jobs/job-1');
    });

    it('should not throw on successful delete', async () => {
      mockClient.delete.mockResolvedValue(undefined);

      await expect(service.delete('job-1')).resolves.not.toThrow();
    });
  });

  // ==========================================================================
  // trigger()
  // ==========================================================================
  describe('trigger', () => {
    it('should call POST /api/v1/jobs/{id}/trigger', async () => {
      const execution = { execution_id: 'exec-triggered' };
      mockClient.post.mockResolvedValue(execution);

      const result = await service.trigger('job-1');

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/jobs/job-1/trigger', {});
      expect(result).toEqual(execution);
    });

    it('should pass variables when provided', async () => {
      const execution = { execution_id: 'exec-triggered' };
      mockClient.post.mockResolvedValue(execution);

      const variables = { date: '2025-01-01', region: 'us-east-1' };
      await service.trigger('job-1', variables);

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/jobs/job-1/trigger', variables);
    });

    it('should handle empty variables', async () => {
      mockClient.post.mockResolvedValue({ execution_id: 'exec-123' });

      await service.trigger('job-1', {});

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/jobs/job-1/trigger', {});
    });
  });

  // ==========================================================================
  // enable()
  // ==========================================================================
  describe('enable', () => {
    it('should call POST /api/v1/jobs/{id}/enable', async () => {
      const enabledJob = { ...mockJobs[0], status: 'active' };
      mockClient.post.mockResolvedValue(enabledJob);

      const result = await service.enable('job-1');

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/jobs/job-1/enable', {});
      expect(result.status).toBe('active');
    });

    it('should propagate errors', async () => {
      mockClient.post.mockRejectedValue(new Error('Cannot enable job'));

      await expect(service.enable('job-1')).rejects.toThrow('Cannot enable job');
    });
  });

  // ==========================================================================
  // disable()
  // ==========================================================================
  describe('disable', () => {
    it('should call POST /api/v1/jobs/{id}/disable', async () => {
      const disabledJob = { ...mockJobs[0], status: 'inactive' };
      mockClient.post.mockResolvedValue(disabledJob);

      const result = await service.disable('job-1');

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/jobs/job-1/disable', {});
      expect(result.status).toBe('inactive');
    });

    it('should propagate errors', async () => {
      mockClient.post.mockRejectedValue(new Error('Cannot disable job'));

      await expect(service.disable('job-1')).rejects.toThrow('Cannot disable job');
    });
  });
});
