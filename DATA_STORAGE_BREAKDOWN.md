# Midtown Biohack - Data Storage Breakdown

## 🔵 SUPABASE (Cloud Database) - dxvfphiugcilrfjzeitj.supabase.co

### Connected Services:
- **URL**: https://dxvfphiugcilrfjzeitj.supabase.co
- **Auth**: Supabase Authentication system
- **Database**: PostgreSQL database
- **Storage**: File storage for avatars/documents

---

## 📊 SUPABASE DATABASE TABLES

### 1. **bookings** ✅
**What it stores**: All customer bookings/appointments
**Columns**:
- `id` - Unique booking ID
- `user_id` - Links to auth.users (can be null for guest bookings)
- `first_name`, `last_name`, `email`, `phone` - Customer info
- `date`, `time` - Appointment date/time
- `duration` - Session length
- `location` - "midtown" or other location
- `group_size` - Number of people
- `amount` - Price paid (stored in database)
- `booking_reason` - Service type (e.g., "gray-matter-recovery-3mo")
- `notes` - Customer notes
- `gender`, `race`, `education`, `profession`, `age` - Demographics
- `status` - Booking status (confirmed, completed, cancelled, no_show)
- `payment_status` - Payment status (completed, pending)
- `chamber_id` - Assigned chamber
- `stripe_payment_intent_id` - Stripe payment reference
- `created_at` - When booking was made

**Security**: Row Level Security (RLS) enabled - users can only see their own bookings

---

### 2. **profiles** ✅
**What it stores**: Extended user profile information
**Columns**:
- `id` - Links to auth.users
- `full_name` - User's name
- `address` - Home address
- `phone` - Phone number
- `dob` - Date of birth
- `avatar_url` - Profile picture URL
- `gender`, `race`, `education`, `profession` - Demographics

**Security**: RLS enabled - users can only access their own profile

---

### 3. **chambers** ✅
**What it stores**: Hyperbaric chamber information
**Columns**:
- `id` - Chamber ID
- `name` - Chamber name
- `description` - Chamber details
- `status` - Available/Maintenance/etc.
- `location` - Physical location

---

### 4. **chamber_sessions** ✅
**What it stores**: Chamber usage sessions
**Columns**:
- `id` - Session ID
- `chamber_id` - Which chamber
- `booking_id` - Linked booking
- `start_time`, `end_time` - Session duration
- `status` - Session status
- `notes` - Session notes

---

### 5. **hip_hop_bookings** ✅
**What it stores**: Special Hip Hop nominee bookings
**Columns**:
- `id` - Booking ID
- `nominee_name`, `email`, `phone` - Nominee info
- `service` - Service type (hbot, pemf, nmr, etc.)
- `preferred_date`, `preferred_time` - Preferences
- `additional_notes` - Extra info
- `created_at` - When submitted

---

### 6. **chat_sessions** ✅
**What it stores**: Admin chatbot conversations
**Columns**:
- `id` - Session ID
- `messages` - Chat history (JSON)
- `created_at` - Session start time
- `updated_at` - Last message time

---

### 7. **cleaning_schedules** ✅
**What it stores**: Chamber cleaning schedules
**Columns**:
- `id` - Schedule ID
- `chamber_id` - Which chamber
- `scheduled_time` - When to clean
- `completed` - Cleaning done or not
- `notes` - Cleaning notes

---

## 👤 SUPABASE AUTH (auth.users table)

### What's stored in auth.users:
- `id` - User ID (UUID)
- `email` - User email
- `encrypted_password` - Hashed password
- `email_confirmed_at` - Email verification timestamp
- `created_at` - Account creation date
- `user_metadata` - JSON object with extra data (see below)

### user_metadata (JSON object in Supabase Auth):
```json
{
  "name": "John Smith",
  "address": "123 Main St",
  "phone": "555-1234",
  "dob": "1990-01-01",
  "gender": "male",
  "race": "asian",
  "education": "bachelors",
  "profession": "Engineer",
  "credits": [
    {
      "type": "gray_matter",
      "balance": 12,
      "expiresAt": "2025-03-31T00:00:00.000Z",
      "packageName": "Gray Matter Recovery (3-month)",
      "purchasedAt": "2025-01-01T00:00:00.000Z",
      "originalBalance": 12,
      "notes": "Purchased via Stripe"
    }
  ]
}
```

**Credits System**: Stored in user_metadata.credits as JSON array
- Each user can have multiple credit packages
- Credits track balance, expiration, type, package name
- Updated when credits are used for bookings
- Updated when Super Admin grants credits
- Updated when Stripe payment succeeds

---

## 💾 LOCAL STORAGE (Browser only - NOT in database)

### What's stored in user's browser localStorage:

1. **`language`**
   - User's preferred language (en, fr, es, zh, ja, it)
   - Location: `src/lib/LanguageContext.tsx`
   - Changes when user switches language

2. **`adminAuthenticated`**
   - Admin login status (true/false)
   - Location: `src/app/admin/page.tsx`
   - Cleared when admin logs out
   - NOT SECURE - just convenience

3. **`superAdminSettings`** (NEW - just added)
   - Site text customizations
   - Location: `src/components/SuperAdmin.tsx`
   - Stores:
     ```json
     {
       "landingPageTitle": "Welcome to Midtown Biohack™",
       "landingPageSubtitle": "New York's...",
       "landingPageDescription": "This is your access...",
       "bookingPageTitle": "Choose Your Recovery Options",
       "bookingPageSubtitle": "Choose the package..."
     }
     ```
   - **NOTE**: This is PER-USER, not global!
   - Each admin's browser stores their own settings
   - Does NOT affect other users

---

## 🔐 ENVIRONMENT VARIABLES (.env.local)

### What's NOT in database but in environment:

1. **Supabase Connection**:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public API key (safe to expose)
   - `SUPABASE_SERVICE_ROLE_KEY` - Admin API key (KEEP SECRET)

2. **Stripe (Midtown)**:
   - `MID_STRIPE_SECRET_KEY` - Stripe secret key
   - `NEXT_PUBLIC_MID_STRIPE_PUBLISHABLE_KEY` - Stripe public key
   - `MID_STRIPE_WEBHOOK_SECRET` - Webhook signature key

3. **Admin**:
   - `NEXT_PUBLIC_ADMIN_PASSWORD` - Admin login password

4. **Email**:
   - `EMAIL_PASSWORD` - SMTP password for sending emails

5. **AI**:
   - `GROQ_API_KEY` - AI chatbot API key

---

## 📁 FILE STORAGE (Supabase Storage)

### Storage Buckets:
Located in Supabase Storage (not database tables)

1. **`uploads` bucket**:
   - User avatars: `{user_id}/avatar.{ext}`
   - User documents: `{user_id}/documents/{filename}`
   - Accessible via: `https://dxvfphiugcilrfjzeitj.supabase.co/storage/v1/object/public/uploads/...`

---

## 🔄 DATA FLOW EXAMPLES

### When a user books an appointment:
1. **User fills form** → Data temporarily in React state
2. **Payment via Stripe** → Payment processed
3. **Stripe webhook fires** → `/api/stripe/webhook`
4. **Data saved to Supabase**:
   - → `bookings` table (appointment details)
   - → `auth.users.user_metadata.credits` (if using credits)
5. **User can see booking**:
   - Loads from `bookings` table
   - Displayed in account page

### When Super Admin grants credits:
1. **Admin selects user** → Loads from Supabase `auth.users`
2. **Admin fills form** → Data in React state
3. **Click "Grant Credits"** → Calls `supabase.auth.admin.updateUserById()`
4. **Credits added to**:
   - → `auth.users.user_metadata.credits` array
5. **User immediately sees credits**:
   - Loads from their user_metadata
   - Displayed in CreditsDisplay component

### When user logs in:
1. **User enters email/password** → Temporary in memory
2. **Supabase Auth checks** → Validates against `auth.users`
3. **Session created** → Stored in browser cookies (by Supabase)
4. **Profile loaded**:
   - From `auth.users.user_metadata`
   - From `profiles` table
5. **Credits loaded**:
   - From `auth.users.user_metadata.credits`

---

## 🚨 IMPORTANT NOTES

### What's NOT backed up if you clear browser:
- ❌ Language preference (resets to English)
- ❌ Admin login status (need to login again)
- ❌ Super Admin text settings (YOUR customizations only)

### What's SAFE in Supabase (survives browser clear):
- ✅ All user accounts
- ✅ All bookings
- ✅ All credits
- ✅ All user profiles
- ✅ All chambers
- ✅ All chat sessions
- ✅ All uploaded files
- ✅ All payment records

### Current Super Admin Text Settings Limitation:
⚠️ **The Super Admin text editor saves to localStorage**
- This means each admin sees their OWN customizations
- Settings are NOT shared across different browsers/computers
- Settings are NOT visible to other admins
- To make text changes global, you need to:
  1. Edit the actual component files, OR
  2. Create a new `site_settings` table in Supabase

---

## 🎯 SUMMARY

### In Supabase (Cloud - Permanent):
- ✅ User accounts & authentication
- ✅ User credits (in user_metadata)
- ✅ All bookings
- ✅ User profiles
- ✅ Chambers & sessions
- ✅ Hip Hop bookings
- ✅ Chat sessions
- ✅ Uploaded files

### In localStorage (Browser - Temporary):
- Language preference
- Admin login status (not secure)
- Super Admin text customizations (per-user)

### In Environment Variables (Server - Secret):
- Supabase keys
- Stripe keys
- Passwords
- API keys

Your Supabase project is fully connected and operational at:
**https://dxvfphiugcilrfjzeitj.supabase.co**
