'use client';

import { useCart } from '@/lib/store/cart';
import type { CartItem } from '@/types/cart';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DeliverySetting } from '@/lib/airtable';
import { useShipping, US_STATES } from '@/features/cart/hooks/useShipping';

type DeliveryMethod = 'delivery' | 'shipping';

interface CheckoutForm {
  // Common fields
  name: string;
  phone: string;
  email: string;
  // Delivery fields
  address: string;
  zipCode: string;
  borough: string;
  instructions?: string;
  deliveryDate?: Date | undefined;
  // Shipping fields (US only)
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
}

interface OrderData {
  Status: string;
  'Customer Name': string;
  Email: string;
  Phone: string;
  Items: string[];
  'Payment Method': string;
  Timestamp: string;
  Total: number;
  Type: DeliveryMethod;
  address: string;
  Borough?: string;
  'Delivery Fee'?: number;
  'Delivery Date'?: string;
  'Shipping Fee'?: number;
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [formData, setFormData] = useState<CheckoutForm>({
    name: '',
    phone: '',
    email: '',
    // Delivery fields
    address: '',
    zipCode: '',
    borough: '',
    // Shipping fields
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingZipCode: '',
  });
  const [deliverySettings, setDeliverySettings] = useState<DeliverySetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { shippingFee, calculateShippingFee } = useShipping();

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

  // Get tomorrow's date for minimum delivery date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get date 2 weeks from now for maximum delivery date
  const twoWeeksFromNow = new Date();
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

  // Get today's date and check if it's before 6 PM
  const today = new Date();
  const isBeforeCutoff = today.getHours() < 18; // 18 is 6 PM

  // Set minimum delivery date based on current time
  const minDeliveryDate = isBeforeCutoff ? today : tomorrow;

  const subtotal = items.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
  
  // Calculate delivery/shipping fee based on method
  const deliverySetting = (deliverySettings || []).find(
    setting => setting.borough.toLowerCase() === formData.borough.toLowerCase()
  );
  
  const fee = deliveryMethod === 'delivery'
    ? (deliverySetting
        ? subtotal >= (deliverySetting.freeDeliveryMinimum || 0)
          ? 0
          : deliverySetting.deliveryFee
        : 0)
    : shippingFee;

  const total = subtotal + fee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBoroughSelect = (value: string) => {
    setFormData(prev => ({ ...prev, borough: value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, deliveryDate: date }));
  };

  const isDateDisabled = (date: Date) => {
    // Base restrictions for all orders (after today's date, within 2 weeks)
    if (date < minDeliveryDate || date > twoWeeksFromNow) {
      return true;
    }

    // For delivery orders
    if (deliveryMethod === 'delivery') {
      // No deliveries on Sundays
      if (date.getDay() === 0) {
        return true;
      }

      // Manhattan specific restrictions (only Tuesdays and Fridays)
      if (formData.borough.toLowerCase() === 'manhattan') {
        const dayOfWeek = date.getDay();
        // 2 is Tuesday, 5 is Friday
        return dayOfWeek !== 2 && dayOfWeek !== 5;
      }

      // If it's the same day, only allow if it's before 6 PM
      if (date.toDateString() === today.toDateString()) {
        return !isBeforeCutoff;
      }
    }

    // For shipping orders
    if (deliveryMethod === 'shipping') {
      // No shipping on weekends (Saturday = 6, Sunday = 0)
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return true;
      }

      // If it's the same day, only allow if it's before 2 PM for shipping
      if (date.toDateString() === today.toDateString()) {
        return today.getHours() >= 14; // 14 is 2 PM
      }
    }

    return false;
  };

  // Add form validation
  const validateForm = () => {
    if (!formData.name || !formData.phone || !formData.email) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return false;
    }

    if (deliveryMethod === 'delivery') {
      if (!formData.address || !formData.zipCode || !formData.borough || !formData.deliveryDate) {
        toast({
          title: 'Missing Delivery Information',
          description: 'Please fill in all delivery details including delivery date.',
          variant: 'destructive',
        });
        return false;
      }
    } else {
      if (!formData.shippingAddress || !formData.shippingCity || !formData.shippingState || !formData.shippingZipCode) {
        toast({
          title: 'Missing Shipping Information',
          description: 'Please fill in all shipping details.',
          variant: 'destructive',
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const orderData: Record<string, any> = {
        Status: 'Pending',
        'Customer Name': formData.name,
        Email: formData.email,
        Phone: formData.phone,
        // Send array of product record IDs
        Items: items.map(item => item.recordId || item.id),
        'Payment Method': 'pending',
        Timestamp: new Date().toISOString(),
        Total: total,
        Type: deliveryMethod,
        // Clear these fields for shipping orders
        Borough: deliveryMethod === 'shipping' ? '' : formData.borough,
        'Delivery Fee': deliveryMethod === 'shipping' ? 0 : fee,
        'Delivery Date': deliveryMethod === 'shipping' ? '' : formData.deliveryDate ? new Date(formData.deliveryDate).toISOString().split('T')[0] : '',
        // Set address based on delivery method
        address: deliveryMethod === 'shipping' 
          ? `${formData.shippingAddress}, ${formData.shippingCity}, ${formData.shippingState} ${formData.shippingZipCode}`
          : formData.address,
      };

      // Add shipping fee for shipping orders
      if (deliveryMethod === 'shipping') {
        orderData['Shipping Fee'] = calculateShippingFee(subtotal);
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const { orderId } = await response.json();

      // Clear cart and show success message
      clearCart();
      toast({
        title: 'Order Placed Successfully',
        description: 'We will contact you to confirm payment and delivery details.',
      });

      // Navigate to confirmation page
      router.push(`/order-confirmation?orderId=${orderId}`);
    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create order',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
        {/* Order Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={`${item.id}-${item.selectedVariation}`} className="flex justify-between">
                <span>
                  {item.name} {item.selectedVariation && `(${item.selectedVariation})`} x {item.quantity}
                </span>
                <span>${((item.price || 0) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{deliveryMethod === 'delivery' ? 'Delivery Fee' : 'Shipping Fee'}</span>
                <span>${fee.toFixed(2)}</span>
              </div>
              {deliveryMethod === 'delivery' && deliverySetting && (
                <div className="text-sm text-muted-foreground mt-1">
                  {subtotal < deliverySetting.freeDeliveryMinimum ? (
                    <span>
                      Add ${(deliverySetting.freeDeliveryMinimum - subtotal).toFixed(2)} more for free delivery
                    </span>
                  ) : (
                    <span>Free Delivery Applied!</span>
                  )}
                </div>
              )}
              <div className="flex justify-between font-bold mt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checkout Form */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={deliveryMethod}
                onValueChange={(value) => setDeliveryMethod(value as DeliveryMethod)}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="delivery"
                    id="delivery"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="delivery"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span>Local Delivery</span>
                    <span className="text-sm text-muted-foreground">NYC Area</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="shipping"
                    id="shipping"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="shipping"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span>Shipping</span>
                    <span className="text-sm text-muted-foreground">United States</span>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Delivery/Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>{deliveryMethod === 'delivery' ? 'Delivery Address' : 'Shipping Address'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deliveryMethod === 'delivery' ? (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="borough">Borough</Label>
                      <Select
                        value={formData.borough}
                        onValueChange={(value) => handleBoroughSelect(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select borough" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Manhattan">Manhattan</SelectItem>
                          <SelectItem value="Brooklyn">Brooklyn</SelectItem>
                          <SelectItem value="Queens">Queens</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.borough && deliverySetting && (
                      <div className="text-sm mt-1.5">
                        Free delivery for orders over <span className="font-bold">${deliverySetting.freeDeliveryMinimum.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
                    <Input
                      id="instructions"
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Delivery Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.deliveryDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.deliveryDate ? format(formData.deliveryDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-3">
                          <p className="text-sm text-muted-foreground mb-2">
                            {isBeforeCutoff 
                              ? "Orders placed before 6 PM can be delivered today"
                              : "Orders placed after 6 PM will be delivered starting tomorrow"}
                          </p>
                          <Calendar
                            mode="single"
                            selected={formData.deliveryDate}
                            onSelect={handleDateSelect}
                            disabled={isDateDisabled}
                            initialFocus
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    {formData.borough.toLowerCase() === 'manhattan' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Manhattan deliveries are available only on Tuesdays and Fridays
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress">Address</Label>
                    <Input
                      id="shippingAddress"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingCity">City</Label>
                    <Input
                      id="shippingCity"
                      name="shippingCity"
                      value={formData.shippingCity}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingState">State</Label>
                    <Select
                      value={formData.shippingState}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, shippingState: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AL">Alabama</SelectItem>
                        <SelectItem value="AK">Alaska</SelectItem>
                        <SelectItem value="AZ">Arizona</SelectItem>
                        <SelectItem value="AR">Arkansas</SelectItem>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="CO">Colorado</SelectItem>
                        <SelectItem value="CT">Connecticut</SelectItem>
                        <SelectItem value="DE">Delaware</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                        <SelectItem value="GA">Georgia</SelectItem>
                        <SelectItem value="HI">Hawaii</SelectItem>
                        <SelectItem value="ID">Idaho</SelectItem>
                        <SelectItem value="IL">Illinois</SelectItem>
                        <SelectItem value="IN">Indiana</SelectItem>
                        <SelectItem value="IA">Iowa</SelectItem>
                        <SelectItem value="KS">Kansas</SelectItem>
                        <SelectItem value="KY">Kentucky</SelectItem>
                        <SelectItem value="LA">Louisiana</SelectItem>
                        <SelectItem value="ME">Maine</SelectItem>
                        <SelectItem value="MD">Maryland</SelectItem>
                        <SelectItem value="MA">Massachusetts</SelectItem>
                        <SelectItem value="MI">Michigan</SelectItem>
                        <SelectItem value="MN">Minnesota</SelectItem>
                        <SelectItem value="MS">Mississippi</SelectItem>
                        <SelectItem value="MO">Missouri</SelectItem>
                        <SelectItem value="MT">Montana</SelectItem>
                        <SelectItem value="NE">Nebraska</SelectItem>
                        <SelectItem value="NV">Nevada</SelectItem>
                        <SelectItem value="NH">New Hampshire</SelectItem>
                        <SelectItem value="NJ">New Jersey</SelectItem>
                        <SelectItem value="NM">New Mexico</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="NC">North Carolina</SelectItem>
                        <SelectItem value="ND">North Dakota</SelectItem>
                        <SelectItem value="OH">Ohio</SelectItem>
                        <SelectItem value="OK">Oklahoma</SelectItem>
                        <SelectItem value="OR">Oregon</SelectItem>
                        <SelectItem value="PA">Pennsylvania</SelectItem>
                        <SelectItem value="RI">Rhode Island</SelectItem>
                        <SelectItem value="SC">South Carolina</SelectItem>
                        <SelectItem value="SD">South Dakota</SelectItem>
                        <SelectItem value="TN">Tennessee</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="UT">Utah</SelectItem>
                        <SelectItem value="VT">Vermont</SelectItem>
                        <SelectItem value="VA">Virginia</SelectItem>
                        <SelectItem value="WA">Washington</SelectItem>
                        <SelectItem value="WV">West Virginia</SelectItem>
                        <SelectItem value="WI">Wisconsin</SelectItem>
                        <SelectItem value="WY">Wyoming</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingZipCode">ZIP Code</Label>
                    <Input
                      id="shippingZipCode"
                      name="shippingZipCode"
                      value={formData.shippingZipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || items.length === 0}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </div>
            ) : (
              'Place Order'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 