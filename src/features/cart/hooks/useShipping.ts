import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import type { DeliverySetting } from '@/lib/airtable';

export interface ShippingFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export function useShipping() {
  const { toast } = useToast();
  const [deliverySettings, setDeliverySettings] = useState<DeliverySetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeliverySettings = async () => {
      try {
        const response = await fetch('/api/delivery-settings');
        if (!response.ok) throw new Error('Failed to fetch delivery settings');
        const data = await response.json();
        setDeliverySettings(data.settings);
      } catch (error) {
        console.error('Error fetching delivery settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load delivery settings. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeliverySettings();
  }, [toast]);

  // Get shipping fee from settings
  const shippingSetting = deliverySettings.find(setting => setting.borough === 'Shipping Fee');
  const shippingFee = shippingSetting?.deliveryFee ?? 25; // Default to $25 if not found
  const freeShippingMinimum = shippingSetting?.freeDeliveryMinimum ?? 150; // Default to $150 if not found

  const calculateShippingFee = (subtotal: number) => {
    return subtotal >= freeShippingMinimum ? 0 : shippingFee;
  };

  const formatOrderData = (data: ShippingFormData, items: string, total: number) => {
    // Generate order ID
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000000);
    const orderId = parseInt(`${timestamp % 1000000}${randomNum % 1000}`, 10);

    const fee = calculateShippingFee(total);

    return {
      'Order ID': orderId.toString(),
      Status: 'pending',
      'Customer Name': data.name,
      Email: data.email,
      Phone: data.phone,
      Items: items,
      'Payment Method': 'pending',
      Timestamp: new Date().toISOString(),
      Total: total + fee,
      Type: 'shipping',
      // Set the full shipping address in the address field
      address: `${data.address}, ${data.city}, ${data.state} ${data.zipCode}`,
      // Clear delivery-specific fields
      Borough: '',
      'Delivery Fee': 0,
      'Delivery Date': '',
      // Add shipping fee
      'Shipping Fee': fee
    };
  };

  return {
    isLoading,
    shippingFee,
    freeShippingMinimum,
    calculateShippingFee,
    formatOrderData
  };
}

// US States data
export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
]; 