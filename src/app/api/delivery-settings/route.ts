import { NextResponse } from 'next/server';
import { getDeliverySettings } from '@/lib/airtable';

export async function GET() {
  try {
    const settings = await getDeliverySettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Delivery Settings API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery settings' },
      { status: 500 }
    );
  }
} 