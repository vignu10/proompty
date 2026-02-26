import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { openai } from '@/app/lib/openai';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: CheckResult;
    pgvector: CheckResult;
    openai: CheckResult;
  };
}

interface CheckResult {
  status: 'pass' | 'fail';
  latencyMs?: number;
  message?: string;
}

async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'pass',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'fail',
      latencyMs: Date.now() - start,
      message: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

async function checkPgVector(): Promise<CheckResult> {
  const start = Date.now();
  try {
    // Check if pgvector extension is installed and working
    const result = await prisma.$queryRaw<{ installed: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
      ) as installed
    `;

    if (!result[0]?.installed) {
      return {
        status: 'fail',
        latencyMs: Date.now() - start,
        message: 'pgvector extension not installed',
      };
    }

    // Test vector operations work
    await prisma.$queryRaw`SELECT '[1,2,3]'::vector(3)`;

    return {
      status: 'pass',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'fail',
      latencyMs: Date.now() - start,
      message: error instanceof Error ? error.message : 'pgvector check failed',
    };
  }
}

async function checkOpenAI(): Promise<CheckResult> {
  const start = Date.now();
  try {
    // Make a minimal API call to check connectivity
    const response = await openai.models.list();

    if (!response.data || response.data.length === 0) {
      return {
        status: 'fail',
        latencyMs: Date.now() - start,
        message: 'OpenAI API returned no models',
      };
    }

    return {
      status: 'pass',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'fail',
      latencyMs: Date.now() - start,
      message: error instanceof Error ? error.message : 'OpenAI API unreachable',
    };
  }
}

export async function GET() {
  const [database, pgvector, openaiCheck] = await Promise.all([
    checkDatabase(),
    checkPgVector(),
    checkOpenAI(),
  ]);

  const checks = {
    database,
    pgvector,
    openai: openaiCheck,
  };

  // Determine overall status
  const allPass = Object.values(checks).every((c) => c.status === 'pass');
  const allFail = Object.values(checks).every((c) => c.status === 'fail');

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  if (allPass) {
    overallStatus = 'healthy';
  } else if (allFail) {
    overallStatus = 'unhealthy';
  } else {
    overallStatus = 'degraded';
  }

  const health: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    checks,
  };

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
