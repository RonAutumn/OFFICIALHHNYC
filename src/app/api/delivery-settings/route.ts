import { NextResponse } from 'next/server';
import { base } from '@/lib/airtable';

export async function GET() {
  try {
    if (!base) {
      console.warn('Airtable not configured. Returning default delivery settings.');
      return NextResponse.json({
        settings: [
          {
            borough: 'Manhattan',
            deliveryFee: 10,
            freeDeliveryMinimum: 100
          },
          {
            borough: 'Brooklyn',
            deliveryFee: 15,
            freeDeliveryMinimum: 150
          }
        ]
      });
    }

    const records = await base('Delivery Settings').select().all();
    const settings = records.map(record => ({
      borough: record.get('Borough'),
      deliveryFee: record.get('Delivery Fee'),
      freeDeliveryMinimum: record.get('Free Delivery Minimum')
    }));

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching delivery settings:', error);
    return NextResponse.json({ error: 'Failed to fetch delivery settings' }, { status: 500 });
  }
}