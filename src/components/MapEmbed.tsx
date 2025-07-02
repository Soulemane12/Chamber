import React from 'react';

interface MapEmbedProps {
  address: string;
  className?: string;
}

export function MapEmbed({ address, className }: MapEmbedProps) {
  // Encode the address for the Google Maps embed URL
  const encodedAddress = encodeURIComponent(address);
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedAddress}`;

  return (
    <div className={className}>
      <iframe
        width="100%"
        height="300"
        style={{ border: 0, borderRadius: '0.5rem' }}
        loading="lazy"
        allowFullScreen
        src={mapUrl}
        title={`Map of ${address}`}
      ></iframe>
    </div>
  );
}
