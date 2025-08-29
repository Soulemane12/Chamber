"use client";

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFDownloaderProps {
  htmlContent: string;
  filename: string;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onError?: (error: string) => void;
}

export default function PDFDownloader({
  htmlContent,
  filename,
  onDownloadStart,
  onDownloadComplete,
  onError
}: PDFDownloaderProps) {
  
  const downloadPDF = async () => {
    try {
      onDownloadStart?.();
      
      // Create a temporary div to render the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '800px'; // Set a fixed width for consistent rendering
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '20px';
      document.body.appendChild(tempDiv);

      // Convert HTML to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempDiv.scrollHeight
      });

      // Remove the temporary div
      document.body.removeChild(tempDiv);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      pdf.save(`${filename}.pdf`);
      
      onDownloadComplete?.();
    } catch (error) {
      console.error('Error generating PDF:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to generate PDF');
    }
  };

  return (
    <button
      onClick={downloadPDF}
      className="inline-flex items-center px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg font-medium transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Download PDF
    </button>
  );
} 