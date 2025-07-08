import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
);

// Create a Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Function to fetch data for PDF generation
async function fetchDataForPDF() {
  try {
    // Fetch bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*');

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      throw new Error('Failed to fetch bookings data');
    }

    // Fetch users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('*');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw new Error('Failed to fetch users data');
    }

    // Calculate summary stats
    const totalBookings = bookings?.length || 0;
    const totalRevenue = bookings?.reduce((sum, booking) => sum + (Number(booking.amount) || 0), 0) || 0;
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    return {
      bookings,
      users,
      summaryStats: {
        totalBookings,
        totalRevenue,
        averageBookingValue,
      }
    };
  } catch (error) {
    console.error('Error fetching data for PDF:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { documentType, customRequest, data } = await request.json();
    
    if (!documentType) {
      return NextResponse.json({ error: 'Document type is required' }, { status: 400 });
    }

    // Verify that GROQ API key is configured
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured' }, { status: 500 });
    }

    // Fetch data for context
    let systemData;
    try {
      systemData = await fetchDataForPDF();
    } catch (error) {
      console.error('Error fetching data for PDF:', error);
      return NextResponse.json({ 
        error: "Sorry, I had trouble accessing the database. Please try again or contact system support."
      });
    }

    // Generate document content based on type
    let documentContent = '';
    let documentTitle = '';

    switch (documentType) {
      case 'booking_report':
        documentTitle = 'Booking Report';
        documentContent = generateBookingReport(systemData);
        break;
      case 'user_report':
        documentTitle = 'User Report';
        documentContent = generateUserReport(systemData);
        break;
      case 'revenue_report':
        documentTitle = 'Revenue Report';
        documentContent = generateRevenueReport(systemData);
        break;
      case 'custom':
        documentTitle = 'Custom Report';
        documentContent = await generateCustomDocument(customRequest, systemData);
        break;
      default:
        return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }

    // Generate PDF using AI
    const pdfContent = await generatePDFContent(documentTitle, documentContent);

    return NextResponse.json({ 
      success: true,
      pdfContent,
      documentTitle,
      message: `Your ${documentTitle.toLowerCase()} has been generated successfully.`
    });

  } catch (error) {
    console.error('Error in PDF generation API:', error);
    return NextResponse.json({ 
      error: "Sorry, an error occurred while generating your document. Please try again."
    }, { status: 500 });
  }
}

function generateBookingReport(data: any) {
  const { bookings, summaryStats } = data;
  
  return `
    <h1>Booking Report</h1>
    <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
    
    <h2>Summary Statistics</h2>
    <ul>
      <li><strong>Total Bookings:</strong> ${summaryStats.totalBookings}</li>
      <li><strong>Total Revenue:</strong> $${summaryStats.totalRevenue.toFixed(2)}</li>
      <li><strong>Average Booking Value:</strong> $${summaryStats.averageBookingValue.toFixed(2)}</li>
    </ul>
    
    <h2>Recent Bookings</h2>
    <table border="1" style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th>Date</th>
          <th>Customer</th>
          <th>Location</th>
          <th>Duration</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${bookings?.slice(0, 20).map((booking: any) => `
          <tr>
            <td>${new Date(booking.date).toLocaleDateString()}</td>
            <td>${booking.first_name} ${booking.last_name}</td>
            <td>${booking.location}</td>
            <td>${booking.duration} min</td>
            <td>$${booking.amount}</td>
          </tr>
        `).join('') || '<tr><td colspan="5">No bookings found</td></tr>'}
      </tbody>
    </table>
  `;
}

function generateUserReport(data: any) {
  const { users } = data;
  
  // Calculate user statistics
  const totalUsers = users?.length || 0;
  const genderStats = users?.reduce((acc: any, user: any) => {
    const gender = user.gender || 'Not Specified';
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {}) || {};
  
  const ageGroups = users?.reduce((acc: any, user: any) => {
    const age = user.age || 'Not Specified';
    acc[age] = (acc[age] || 0) + 1;
    return acc;
  }, {}) || {};

  return `
    <h1>User Report</h1>
    <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
    
    <h2>Summary Statistics</h2>
    <ul>
      <li><strong>Total Users:</strong> ${totalUsers}</li>
    </ul>
    
    <h2>Gender Distribution</h2>
    <ul>
      ${Object.entries(genderStats).map(([gender, count]) => 
        `<li><strong>${gender}:</strong> ${count}</li>`
      ).join('')}
    </ul>
    
    <h2>Age Group Distribution</h2>
    <ul>
      ${Object.entries(ageGroups).map(([age, count]) => 
        `<li><strong>${age}:</strong> ${count}</li>`
      ).join('')}
    </ul>
    
    <h2>User List</h2>
    <table border="1" style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Age Group</th>
          <th>Gender</th>
        </tr>
      </thead>
      <tbody>
        ${users?.slice(0, 20).map((user: any) => `
          <tr>
            <td>${user.name || user.full_name || 'N/A'}</td>
            <td>${user.email || 'N/A'}</td>
            <td>${user.phone || 'N/A'}</td>
            <td>${user.age || 'N/A'}</td>
            <td>${user.gender || 'N/A'}</td>
          </tr>
        `).join('') || '<tr><td colspan="5">No users found</td></tr>'}
      </tbody>
    </table>
  `;
}

function generateRevenueReport(data: any) {
  const { bookings, summaryStats } = data;
  
  // Calculate revenue by location
  const revenueByLocation = bookings?.reduce((acc: any, booking: any) => {
    const location = booking.location || 'Unknown';
    acc[location] = (acc[location] || 0) + (Number(booking.amount) || 0);
    return acc;
  }, {}) || {};
  
  // Calculate revenue by month
  const revenueByMonth = bookings?.reduce((acc: any, booking: any) => {
    const month = new Date(booking.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    acc[month] = (acc[month] || 0) + (Number(booking.amount) || 0);
    return acc;
  }, {}) || {};

  return `
    <h1>Revenue Report</h1>
    <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
    
    <h2>Summary Statistics</h2>
    <ul>
      <li><strong>Total Revenue:</strong> $${summaryStats.totalRevenue.toFixed(2)}</li>
      <li><strong>Total Bookings:</strong> ${summaryStats.totalBookings}</li>
      <li><strong>Average Booking Value:</strong> $${summaryStats.averageBookingValue.toFixed(2)}</li>
    </ul>
    
    <h2>Revenue by Location</h2>
    <ul>
      ${Object.entries(revenueByLocation).map(([location, revenue]) => 
        `<li><strong>${location}:</strong> $${Number(revenue).toFixed(2)}</li>`
      ).join('')}
    </ul>
    
    <h2>Revenue by Month</h2>
    <ul>
      ${Object.entries(revenueByMonth).map(([month, revenue]) => 
        `<li><strong>${month}:</strong> $${Number(revenue).toFixed(2)}</li>`
      ).join('')}
    </ul>
  `;
}

async function generateCustomDocument(customRequest: string, data: any) {
  const contextString = `
Current system data:
- Total users: ${data.users?.length || 0}
- Total bookings: ${data.summaryStats?.totalBookings || 0}
- Total revenue: $${data.summaryStats?.totalRevenue.toFixed(2) || 0}
- Average booking value: $${data.summaryStats?.averageBookingValue.toFixed(2) || 0}

User request: ${customRequest}

Please generate a professional document based on the user's request and the available data. 
Format the response as HTML with proper styling for a PDF document.
Include relevant data and insights from the system.
`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a professional document generator for a hyperbaric oxygen therapy booking system. 
        Generate well-formatted HTML documents that can be converted to PDF. 
        Use proper HTML structure with headers, tables, and styling.
        Include relevant data and insights from the provided system data.
        Make the document professional and easy to read.`
      },
      {
        role: 'user',
        content: contextString
      }
    ],
    temperature: 0.3,
    max_completion_tokens: 1000
  });

  return completion.choices[0]?.message?.content || 'Unable to generate custom document.';
}

async function generatePDFContent(title: string, content: string) {
  const fullHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 20px;
          color: #333;
        }
        h1 {
          color: #2563eb;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 10px;
        }
        h2 {
          color: #1e40af;
          margin-top: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f8fafc;
          font-weight: bold;
        }
        ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        li {
          margin: 5px 0;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <p><strong>WellNex02 - Hyperbaric Oxygen Therapy</strong></p>
      </div>
      
      ${content}
      
      <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p>WellNex02 Admin System</p>
      </div>
    </body>
    </html>
  `;

  return fullHTML;
} 