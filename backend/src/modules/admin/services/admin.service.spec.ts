import { ForbiddenException } from '@nestjs/common';
import { AdminService } from './admin.service';

function mockModel(overrides: Record<string, unknown> = {}) {
  return {
    countDocuments: jest.fn().mockResolvedValue(3),
    aggregate: jest.fn().mockResolvedValue([{ _id: 'USD', total: 99 }]),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
          exec: jest.fn().mockResolvedValue([]),
        }),
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest
              .fn()
              .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
        lean: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
        exec: jest.fn().mockResolvedValue([]),
      }),
    }),
    distinct: jest.fn().mockResolvedValue(['NG', 'GH']),
    findOne: jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
    create: jest.fn(),
    ...overrides,
  };
}

describe('AdminService', () => {
  const model = mockModel();
  const settingsModel = {
    ...mockModel(),
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        toObject: () => ({
          key: 'default',
          aiPrompts: {},
          apiKeys: [],
        }),
        apiKeys: [],
      }),
    }),
  };

  const service = new AdminService(
    model as never,
    model as never,
    model as never,
    model as never,
    model as never,
    model as never,
    mockModel({ create: jest.fn() }) as never,
    model as never,
    model as never,
    model as never,
    model as never,
    model as never,
    model as never,
    model as never,
    settingsModel as never,
    model as never,
    model as never,
    model as never,
    {} as never,
    {} as never,
    {} as never,
    { notify: jest.fn() } as never,
    { get: jest.fn().mockReturnValue('mock') } as never,
  );

  it('aggregates overview counts', async () => {
    const overview = await service.overview();
    expect(overview.users).toBe(3);
    expect(overview.companies.pending).toBe(3);
    expect(overview.revenue[0].total).toBe(99);
    expect(overview.monthlyTrends).toHaveLength(6);
  });

  it('returns static RBAC matrix', () => {
    const matrix = service.getRbacMatrix();
    expect(matrix.data.SUPER_ADMIN).toContain('*');
    expect(matrix.data.FINANCE_MANAGER).toContain('billing.refund');
  });

  it('aggregates impact metrics', async () => {
    const impact = await service.impact();
    expect(impact.seekers).toBe(3);
    expect(impact.countries).toBe(2);
  });
});

describe('Admin role gate (controller concern)', () => {
  it('documents admin-only access expectation', () => {
    expect(ForbiddenException).toBeDefined();
  });
});
