import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
);

export async function POST() {
  try {
    console.log('Starting IFS service migration...');

    // Step 1: Handle existing rows that might have multiple services (comma-separated)
    console.log('Step 1: Cleaning up comma-separated services...');
    const { data: commaRows, error: selectError } = await supabase
      .from('hip_hop_bookings')
      .select('id, service')
      .like('service', '%,%');

    if (selectError) {
      console.error('Error selecting comma-separated services:', selectError);
    } else if (commaRows && commaRows.length > 0) {
      console.log(`Found ${commaRows.length} rows with comma-separated services`);
      for (const row of commaRows) {
        const firstService = row.service.split(',')[0].trim();
        console.log(`Updating row ${row.id}: "${row.service}" -> "${firstService}"`);

        const { error: updateError } = await supabase
          .from('hip_hop_bookings')
          .update({ service: firstService })
          .eq('id', row.id);

        if (updateError) {
          console.error(`Error updating row ${row.id}:`, updateError);
        }
      }
    }

    // Step 2: Handle any service values that aren't in our expected list
    console.log('Step 2: Checking for invalid services...');
    const validServices = ['hbot', 'electric-exercise', 'pemf', 'nmr', 'nutrition'];
    const { data: allRows, error: selectAllError } = await supabase
      .from('hip_hop_bookings')
      .select('id, service');

    if (selectAllError) {
      console.error('Error selecting all services:', selectAllError);
    } else if (allRows) {
      const invalidRows = allRows.filter(row => !validServices.includes(row.service));
      if (invalidRows.length > 0) {
        console.log(`Found ${invalidRows.length} rows with invalid services`);
        for (const row of invalidRows) {
          console.log(`Updating invalid service row ${row.id}: "${row.service}" -> "hbot"`);

          const { error: updateError } = await supabase
            .from('hip_hop_bookings')
            .update({ service: 'hbot' })
            .eq('id', row.id);

          if (updateError) {
            console.error(`Error updating invalid service row ${row.id}:`, updateError);
          }
        }
      } else {
        console.log('No invalid services found');
      }
    }

    // Step 3: We cannot directly alter table constraints with Supabase client
    // So we'll provide the SQL to run manually
    const migrationSQL = `
-- Drop the existing constraint
ALTER TABLE hip_hop_bookings DROP CONSTRAINT IF EXISTS hip_hop_bookings_service_check;

-- Add the new constraint with the 'ifs' service included
ALTER TABLE hip_hop_bookings ADD CONSTRAINT hip_hop_bookings_service_check
  CHECK (service IN ('hbot', 'electric-exercise', 'pemf', 'nmr', 'nutrition', 'ifs'));

-- Update the comment to reflect the new service option
COMMENT ON COLUMN hip_hop_bookings.service IS 'Type of wellness service requested: hbot, electric-exercise, pemf, nmr, nutrition, or ifs (Internal Family Systems)';

-- Optional: Add a comment about the IFS service
COMMENT ON TABLE hip_hop_bookings IS 'Stores booking requests from Hip Hop nominees for wellness services including HBOT, Electric Exercise, PEMF, NMR, Nutrition, and Internal Family Systems (IFS) therapy with Ty Cutner';
`;

    console.log('Data cleanup completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Data cleanup completed. Please run the SQL migration manually.',
      commaRowsFixed: commaRows?.length || 0,
      invalidRowsFixed: allRows?.filter(row => !validServices.includes(row.service)).length || 0,
      sqlToRun: migrationSQL
    });

  } catch (error) {
    console.error('Error running IFS service migration:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return HTML page with migration instructions
  const migrationSQL = `-- Drop the existing constraint
ALTER TABLE hip_hop_bookings DROP CONSTRAINT IF EXISTS hip_hop_bookings_service_check;

-- Add the new constraint with the 'ifs' service included
ALTER TABLE hip_hop_bookings ADD CONSTRAINT hip_hop_bookings_service_check
  CHECK (service IN ('hbot', 'electric-exercise', 'pemf', 'nmr', 'nutrition', 'ifs'));

-- Update the comment to reflect the new service option
COMMENT ON COLUMN hip_hop_bookings.service IS 'Type of wellness service requested: hbot, electric-exercise, pemf, nmr, nutrition, or ifs (Internal Family Systems)';`;

  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>Add IFS Service Migration</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
          }
          h1 { color: #2563eb; }
          pre {
            background-color: #f1f5f9;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .steps {
            background-color: #f8fafc;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            text-decoration: none;
            margin: 10px 5px 0 0;
            cursor: pointer;
          }
          .button:hover {
            background-color: #1d4ed8;
          }
        </style>
      </head>
      <body>
        <h1>🧘‍♂️ Add IFS Service Migration</h1>
        <p>
          This migration adds Internal Family Systems (IFS) with Ty Cutner to the hip services.
          First, click to clean up existing data, then run the SQL below.
        </p>

        <div class="steps">
          <h3>Step 1: Clean up existing data</h3>
          <button class="button" onclick="cleanupData()">Clean up data and get SQL</button>
          <div id="cleanup-result" style="margin-top: 10px;"></div>
        </div>

        <div class="steps">
          <h3>Step 2: Run this SQL in Supabase Dashboard</h3>
          <ol>
            <li>Go to your <a href="https://app.supabase.com" target="_blank">Supabase dashboard</a></li>
            <li>Select your project → SQL Editor</li>
            <li>Copy and paste the SQL below</li>
            <li>Run the query</li>
          </ol>
        </div>

        <h3>SQL to run:</h3>
        <pre id="sql-content">${migrationSQL}</pre>

        <script>
          async function cleanupData() {
            const button = document.querySelector('button');
            const resultDiv = document.getElementById('cleanup-result');

            button.textContent = 'Cleaning up data...';
            button.disabled = true;

            try {
              const response = await fetch('/api/admin/add-ifs-service', {
                method: 'POST'
              });

              const result = await response.json();

              if (result.success) {
                resultDiv.innerHTML = \`
                  <div style="background: #10b981; color: white; padding: 10px; border-radius: 5px;">
                    ✅ Data cleanup completed!<br>
                    • Fixed \${result.commaRowsFixed} comma-separated services<br>
                    • Fixed \${result.invalidRowsFixed} invalid services<br>
                    Now run the SQL above in Supabase.
                  </div>
                \`;
              } else {
                resultDiv.innerHTML = \`
                  <div style="background: #dc2626; color: white; padding: 10px; border-radius: 5px;">
                    ❌ Error: \${result.error}
                  </div>
                \`;
              }
            } catch (error) {
              resultDiv.innerHTML = \`
                <div style="background: #dc2626; color: white; padding: 10px; border-radius: 5px;">
                  ❌ Error: \${error.message}
                </div>
              \`;
            } finally {
              button.textContent = 'Clean up data and get SQL';
              button.disabled = false;
            }
          }
        </script>
      </body>
    </html>`,
    {
      headers: {
        'Content-Type': 'text/html',
      },
    }
  );
}