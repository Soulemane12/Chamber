"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Header } from "@/components/Header";
import { useLanguage } from "@/lib/LanguageContext";
import { Footer } from "@/components/Footer";

interface Accessory {
  id: string;
  name: string;
  price: number;
  description?: string;
}

const accessories: Accessory[] = [
  { id: 'premium_couch', name: 'Premium couch', price: 1000 },
  { id: 'stadium_seating', name: 'Stadium seating', price: 875 },
  { id: 'ac_unit', name: 'Air conditioner unit', price: 990 },
  { id: 'massage_table', name: 'Massage table', price: 725 },
  { id: 'ottoman', name: 'Ottoman', price: 589 },
  { id: 'custom_wrap', name: 'Custom wrap', price: 1700 },
  { id: 'custom_logo', name: 'Custom logo', price: 1380 },
];

export default function O2BoxT2R() {
  const { t } = useLanguage();
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [addressOrZip, setAddressOrZip] = useState('');
  const [paymentOption, setPaymentOption] = useState<'half' | 'full' | 'financing'>('full');
  
  // Pricing
  const basePrice = 95000; // Base price for T2-R
  
  const selectedAccessoriesTotal = selectedAccessories.reduce((total, accessoryId) => {
    const accessory = accessories.find(a => a.id === accessoryId);
    return total + (accessory?.price || 0);
  }, 0);
  
  const subtotal = basePrice + selectedAccessoriesTotal;
  const total = subtotal; // Delivery & install included
  const upfrontPayment = paymentOption === 'half' ? total / 2 : total;

  const handleAccessoryToggle = (accessoryId: string) => {
    setSelectedAccessories(prev => 
      prev.includes(accessoryId) 
        ? prev.filter(id => id !== accessoryId)
        : [...prev, accessoryId]
    );
  };

  const handlePurchase = () => {
    // This would integrate with payment processing
    alert(`Purchase initiated!\nTotal: $${total.toLocaleString()}\nUpfront Payment: $${upfrontPayment.toLocaleString()}\nDelivery Date: ${deliveryDate}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header currentPage="products" />

      <main className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li><Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link></li>
            <li>/</li>
            <li><Link href="/products" className="hover:text-blue-600 dark:hover:text-blue-400">Products</Link></li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white">O2 BOX T2-R</li>
          </ol>
        </nav>

        {/* Product Header */}
        <div className="mb-16 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-slide-in-up">
                O2 BOX T2-R
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-4 animate-slide-in-up animate-delay-200">
                Model: T2-R
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 animate-slide-in-up animate-delay-200">
                Designed for the comfort of 1-2 Persons
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                <Image 
                  src="/O2BOXT2R.png" 
                  alt="O2 BOX T2-R Hyperbaric Chamber" 
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Specifications */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Product Specifications
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Model Details</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    <strong>Model:</strong> T2-R (Horizontally long type)
                  </p>
                  
                  <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Dimensions</h4>
                  <div className="space-y-2 text-gray-600 dark:text-gray-300">
                    <p><strong>Main Body Outer Dimension:</strong></p>
                    <p>H60.67 in x W79.13 in x D37.80 in</p>
                    <p><strong>Main Body Inside Dimension:</strong></p>
                    <p>H54.49 in x W72.24 in x D30.87 in</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Technical Specifications</h4>
                  <div className="space-y-2 text-gray-600 dark:text-gray-300">
                    <p><strong>Total Weight:</strong> 1014.13 lbs</p>
                    <p><strong>Entrance Size:</strong></p>
                    <p>Height: 45.47 in, Width: 25.00 in</p>
                    <p><strong>Component:</strong></p>
                    <p>Control device x 1 (included)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Purchase Your O2 BOX T2-R
            </h2>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Options */}
              <div className="space-y-8">
                {/* Included Items */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Included with Purchase
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li>• Delivery & Installation</li>
                    <li>• TV</li>
                    <li>• Chairs</li>
                    <li>• AC</li>
                    <li>• 3-year warranty</li>
                  </ul>
                </div>

                {/* Optional Add-ons */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Optional Add-ons
                  </h3>
                  <div className="space-y-3">
                    {accessories.map((accessory) => (
                      <label key={accessory.id} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAccessories.includes(accessory.id)}
                          onChange={() => handleAccessoryToggle(accessory.id)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{accessory.name}</p>
                              {accessory.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-300">{accessory.description}</p>
                              )}
                            </div>
                            <p className="font-semibold text-blue-600">${accessory.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Delivery Scheduling */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Delivery & Installation Scheduling
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Delivery Date
                      </label>
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Delivery Time
                      </label>
                      <input
                        type="time"
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Address or ZIP Code
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your address or ZIP code"
                        value={addressOrZip}
                        onChange={(e) => setAddressOrZip(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Payment Options
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="full"
                        checked={paymentOption === 'full'}
                        onChange={(e) => setPaymentOption(e.target.value as 'full')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Pay in Full</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Pay the full amount upfront</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="half"
                        checked={paymentOption === 'half'}
                        onChange={(e) => setPaymentOption(e.target.value as 'half')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">50% Down Payment</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Pay 50% now, 50% before delivery</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="financing"
                        checked={paymentOption === 'financing'}
                        onChange={(e) => setPaymentOption(e.target.value as 'financing')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Financing Available</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Contact us for financing options</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-fit">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Order Summary
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">O2 BOX T2-R Base Price</span>
                    <span className="font-medium">${basePrice.toLocaleString()}</span>
                  </div>
                  
                  {selectedAccessories.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="font-medium text-gray-900 dark:text-white mb-2">Selected Accessories:</p>
                      {selectedAccessories.map(accessoryId => {
                        const accessory = accessories.find(a => a.id === accessoryId);
                        return (
                          <div key={accessoryId} className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-300">{accessory?.name}</span>
                            <span>${accessory?.price.toLocaleString()}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-blue-600">${total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Upfront Payment:</strong> ${upfrontPayment.toLocaleString()}
                    </p>
                    {paymentOption === 'half' && (
                      <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                        Remaining: ${(total - upfrontPayment).toLocaleString()} (due before delivery)
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={!deliveryDate || !deliveryTime || !addressOrZip}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed"
                >
                  Purchase Now - ${upfrontPayment.toLocaleString()}
                </button>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  * Final pricing subject to confirmation. Contact us for financing details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center">
            <Link 
              href="/contact" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:translate-y-[-3px] active:scale-95 inline-block"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </main>

      <Footer className="mt-16" />
    </div>
  );
}
