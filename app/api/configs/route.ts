import { NextRequest, NextResponse } from 'next/server';
import { getAllConfigs, clearAndInsertConfigs, Config } from '@/lib/db';

interface ConfigRequest {
  ping: number;
  config: string;
  channel: string;
  protocol?: string;
  tested_at?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // بررسی اگر آرایه‌ای از configs ارسال شده
    if (Array.isArray(body)) {
      const configs = body as ConfigRequest[];
      
      if (configs.length === 0) {
        return NextResponse.json(
          { error: 'Configs array cannot be empty' },
          { status: 400 }
        );
      }

      // تبدیل به Config object با مقادیر پیش‌فرض
      const processedConfigs: Config[] = configs.map(config => ({
        ping: config.ping,
        config: config.config,
        channel: config.channel,
        protocol: config.protocol || 'unknown',
        tested_at: config.tested_at || new Date().toISOString(),
      }));

      // حذف تمام داده‌های قدیمی و درج داده‌های جدید
      await clearAndInsertConfigs(processedConfigs);

      return NextResponse.json(
        { 
          success: true, 
          message: `${processedConfigs.length} configs replaced successfully`,
          count: processedConfigs.length
        },
        { status: 200 }
      );
    }

    // اگر یک object تک ارسال شده
    const singleConfig = body as ConfigRequest;

    if (!singleConfig.ping || !singleConfig.config || !singleConfig.channel) {
      return NextResponse.json(
        { error: 'Missing required fields: ping, config, channel' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Please send an array of configs for bulk replacement' },
      { status: 400 }
    );

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to update configurations', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const configs = await getAllConfigs();
    return NextResponse.json(configs, { status: 200 });
  } catch (error) {
    console.error('Failed to read configs:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve configurations', details: String(error) },
      { status: 500 }
    );
  }
}
