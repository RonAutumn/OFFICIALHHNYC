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
            deliveryFee: 25,
            freeDeliveryMinimum: 200
          },
          {
            borough: 'Brooklyn',
            deliveryFee: 15,
            freeDeliveryMinimum: 150
          },
          {
            borough: 'Queens',
            deliveryFee: 15,
            freeDeliveryMinimum: 150
          }
        ]
      });
    }

    const records = await base('Settings').select({
      view: 'Grid view'
    }).all();

    const settings = records.map(record => ({
      borough: record.get('Borough') as string,
      deliveryFee: record.get('Delivery fee') as number,
      freeDeliveryMinimum: record.get('Free Delivery Minimum') as number,
    }));

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching delivery settings:', error);
    return NextResponse.json({ error: 'Failed to fetch delivery settings' }, { status: 500 });
  }
}