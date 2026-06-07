# 🏫 EduStream: Enterprise-Grade School Management System (SMS)
### 🚀 Final Year Project (FYP) Technical Specification & Documentation

EduStream is a state-of-the-art, highly responsive, and feature-rich School Management System designed to connect school administrators, teaching staff, students, and parents into a single, cohesive academic workspace. Built on a cutting-edge technical stack of **Next.js 15 (App Router)**, **PostgreSQL**, **Prisma ORM**, **Tailwind CSS**, and **Zustand**, EduStream handles everything from administrative bootstrapping and custom school branding to role-based calendars, automated SMTP onboarding, and advanced real-time attendance analytics.

---

## 🗺️ Table of Contents
1. [🌟 Executive Summary & Key Highlights](#-executive-summary--key-highlights)
2. [🏗️ Architectural Design & Directory Topology](#%EF%B8%8F-architectural-design--directory-topology)
3. [⚙️ Global State Management System (Zustand)](#%EF%B8%8F-global-state-management-system-zustand)
4. [💾 Database Schema & Data Models (Prisma & PostgreSQL)](#-database-schema--data-models-prisma--postgresql)
5. [🔒 Security Framework & JWT Lifecycle](#-security-framework--jwt-lifecycle)
6. [🔄 Resilient API Token Refresh Queuing](#-resilient-api-token-refresh-queuing)
7. [⚡ Core Workflows & Engines](#-core-workflows--engines)
   - [A. School Workspace Bootstrapping & Auto-Mapping Engine](#a-school-workspace-bootstrapping--auto-mapping-engine)
   - [B. Timetable Excel Parsing & Preview Engine](#b-timetable-excel-parsing--preview-engine)
   - [C. Attendance Roll Call & Metric Aggregator](#c-attendance-roll-call--metric-aggregator)
   - [D. Nodemailer Automated Password Activation Flow](#d-nodemailer-automated-password-activation-flow)
8. [🔌 REST API Endpoint Directory](#-rest-api-endpoint-directory)
9. [👥 Role-Based Access Control (RBAC) Grid](#-role-based-access-control-rbac-grid)
10. [🛠️ Local Installation & Development Bootstrap Guide](#%EF%B8%8F-local-installation--development-bootstrap-guide)

---

## 🌟 Executive Summary & Key Highlights
EduStream moves beyond simple CRUD applications by offering a **tenant-isolated, multi-functional school management interface** where every school behaves as its own distinct workspace. 

- **Tenant Isolation & Custom Branding**: New schools can register their own workspaces, uploading logos and specifying HSL-based brand colors which dynamically set the app's visual system (headers, cards, buttons) at runtime.
- **Academic Engine**: Includes a robust **SheetJS Excel Timetable Parser** that extracts merged periods directly from Excel grids, mapping them into structured database rows while displaying live previews.
- **Automated Onboarding**: When administrators register staff, students, or parents, an asynchronous SMTP email invitation is dispatched via **Nodemailer**, prompting users to activate their accounts and establish secure passwords.
- **Attendance Insights**: Teachers can take daily roll calls for their designated classes. The system aggregates this data in real-time, feeding rich visual dashboards with weekly and monthly analytics.
- **PWA Ready**: Built-in service workers and offline manifest support make the system fully installable as a Progressive Web App on mobile and desktop platforms.

---

## 🏗️ Architectural Design & Directory Topology
The project implements a hybrid architecture combining **Next.js App Router API Route Handlers** as the serverless API layer and a highly responsive, animated client-side SPA layer.

```mermaid
graph TD
    Client[SPA Client Interface / Next.js Client Components] <--> Zustand[Zustand Client Stores: User, School, Counts]
    Client <--> APIClient[Axios API Client Interceptor Queue]
    APIClient <--> NextMiddleware[Next.js Auth Guard Middleware]
    NextMiddleware <--> APIHandlers[Next.js API Route Handlers /withAuthRoute/]
    APIHandlers <--> Prisma[Prisma Client Singleton]
    Prisma <--> DB[(PostgreSQL Database)]
    APIHandlers <--> Nodemailer[Nodemailer SMTP Engine]
```

### 📂 Directory Mapping
```text
├── prisma/
│   └── schema.prisma             # PostgreSQL Database Schema and Model Definitions
├── public/
│   └── timetableExcelTemp.xlsx   # Official Excel Timetable Template for upload
├── src/
│   ├── app/
│   │   ├── (auth)/               # Authentication routing group
│   │   │   ├── login/            # Interactive portal login page
│   │   │   ├── create/           # Initial school configuration wizard
│   │   │   ├── newschool/        # Dashboard landing for new school registration (confetti)
│   │   │   └── auth/             # Role-based landing and redirect interceptor
│   │   ├── (dashboard)/          # Application main shell (protected)
│   │   │   ├── admin/            # Administrative management dashboard
│   │   │   ├── staff/            # Teacher and Non-teaching dashboard
│   │   │   ├── student/          # Student attendance, classes, and schedules
│   │   │   ├── parent/           # Children portal dashboard
│   │   │   ├── list/             # Generic listings for Staff, Students, Classes, etc.
│   │   │   ├── profile/          # User personal card page
│   │   │   └── settings/         # Administrative brand and timetable settings page
│   │   ├── api/                  # API Endpoint handlers
│   │   │   ├── auth/             # Login, logout, token refresh, and email activation
│   │   │   ├── attendance/       # Daily class attendance CRUD operations
│   │   │   ├── school/           # Metrics generation and color style retrieval
│   │   │   └── ...               # Sub-resource API handlers (students, staff, subjects)
│   │   ├── globals.css           # Global custom classes & Tailwind base directives
│   │   ├── layout.tsx            # Global metadata and provider structure
│   │   └── page.tsx              # Public-facing platform marketing landing page
│   ├── components/
│   │   ├── forms/                # Specialized forms (AddStudents, AddTimeTable, etc.)
│   │   ├── ui/                   # Modular Radix and Tailwind components
│   │   ├── Menu.tsx              # Role-restricted sidebar navigation
│   │   ├── Header.tsx            # Contextual user actions and status bar
│   │   └── ScheduleCalender.tsx  # Dynamic grid rendering timetables
│   ├── lib/
│   │   ├── apiclient.ts          # Resilient Axios instance with refresh interceptor
│   │   ├── prisma.ts             # PrismaClient connection pool singleton
│   │   ├── routeauth.ts          # Higher-Order API route decorator (withAuthRoute)
│   │   └── helpers.ts            # Dynamic formatting and parsing utilities
│   ├── middleware.ts             # Next.js edge-level route authorization guard
│   ├── store.ts                  # Client-side global Zustand stores
│   └── server-actions.ts         # Next.js Server Actions for secure session decoding
```

---

## ⚙️ Global State Management System (Zustand)
EduStream uses **Zustand** for lightweight, performance-optimized client-state synchronization, eliminating React prop-drilling. The state is compartmentalized into six focused client stores defined in `src/store.ts`:

1. **`useUser`**: Holds basic session identifiers of the currently logged-in user (`id`, `name`, `email`, `role`, `schoolId`).
2. **`useUserData`**: Stores profile-specific variables (`image`, `phoneNo`, `address`, `teaching`, `admin`) to display in headers and settings.
3. **`useRole`**: Tracks the active security role (`ADMIN`, `TEACHER`, `STUDENT`, `PARENT`, `NONTEACHING`, `AUTH`) to handle Client-side UI element visibility and navigation guards.
4. **`useSchool`**: Maintains the customized school metadata, primary/secondary/accent CSS hex codes, principal and vice-principal details, and the timetable HTML grid structure.
5. **`useCounts`**: Tracks system metrics, including total counts for students, classes, parents, staff, gender distribution ratios, and compiled arrays for weekly daily attendance and monthly attendance graphs.
6. **`useRecents`**: Keeps count of recently published announcements and scheduled events for real-time badge updates.

---

## 💾 Database Schema & Data Models (Prisma & PostgreSQL)
The database structure is designed to represent complex scholastic relationships with complete cascade protection, ensuring that deleting a school safely cascades down to purge sub-entities, while maintaining record integrity for students and parents.

### 📊 Entity Relation Model Chart

```mermaid
erDiagram
    SCHOOL ||--o{ USER : contains
    SCHOOL ||--o{ REFRESH-TOKENS : hosts
    SCHOOL ||--o{ STAFF : employs
    SCHOOL ||--o{ PARENT : manages
    SCHOOL ||--o{ STUDENT : educates
    SCHOOL ||--o{ SUBJECT : offers
    SCHOOL ||--o{ CLASS : divides
    SCHOOL ||--o{ TIMETABLE : schedules
    SCHOOL ||--o{ ATTENDANCE : tracks
    SCHOOL ||--o{ EVENT : hosts
    SCHOOL ||--o{ ANNOUNCEMENT : broadcasts

    USER ||--|| STAFF : relates_to
    USER ||--|| PARENT : relates_to
    USER ||--|| STUDENT : relates_to
    USER ||--o{ REFRESH-TOKENS : signs

    PARENT ||--o{ STUDENT : guardians

    CLASS ||--o{ ATTENDANCE : registers
    STUDENT ||--o{ ATTENDANCE : records
```

### 🗂️ Detailed Model Dictionary

#### 1. `School`
Houses the metadata and branding configuration of each distinct workspace.
| Field Name | Data Type | Modifiers / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id`, `default(uuid())` | Primary key of the school workspace. |
| `name` | `String` | - | Name of the institution. |
| `address` | `String` | - | Location address. |
| `primaryColor` | `String` | `@default("")` | Base branding primary theme color. |
| `primaryColorLight`| `String` | `@default("")` | Muted contrast primary background. |
| `secondaryColor` | `String` | `@default("")` | Accent theme highlight color. |
| `logo` | `String` | - | Image URL of school logo. |
| `principal` | `String` | - | Principal name. |
| `type` | `SchoolType`| `Enum` (`PRIMARY`, `JUNIOR`, `SENIOR`) | Stage level of the school. |
| `timetableHtml` | `String` | - | Cached HTML representation of the timetable. |

#### 2. `User`
Main credentials and core security context.
| Field Name | Data Type | Modifiers / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id` | Shared mapping key (linked to specific profiles). |
| `name` | `String` | - | Real name of user. |
| `email` | `String` | `@unique` | Login credential email. |
| `password` | `String` | `@default("")` | Bcrypt hashed password. |
| `role` | `Role` | `Enum` (`ADMIN`, `TEACHER`, `STUDENT`, `PARENT`, `NONTEACHING`) | Core security role assignment. |
| `schoolId` | `String` | Foreign Key references `School.id` (`onDelete: Cascade`) | School workspace relationship. |
| `resetToken` | `String?` | Nullable | SMTP Password set/activation token. |
| `resetTokenExpiry`| `DateTime?`| Nullable | Expiry timestamp for onboarding activation. |
| `tempPassword` | `String?` | Nullable | Unhashed staging password for confirmation link. |

#### 3. `RefreshTokens`
Active secure JWT sessions tracking and revocation engine.
| Field Name | Data Type | Modifiers / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id`, `default(uuid())` | Primary key. |
| `userId` | `String` | Foreign Key references `User.id` (`onDelete: Cascade`) | Owner of the session. |
| `tokenHash` | `String` | `@unique` | SHA-256 Hash of the issued JWT refresh token. |
| `deviceInfo` | `String` | `@default("")` | Client browser User Agent string. |
| `ipAddress` | `String` | `@default("")` | Client IP address at token creation. |
| `createdAt` | `DateTime` | `@default(now())` | Registration time. |
| `expiresOn` | `DateTime` | - | Expiration limit of refresh window. |
| `lastUsed` | `DateTime` | - | Last recorded activity timestamp. |

#### 4. `Staff`
Detailed profile for teaching and non-teaching personnel.
| Field Name | Data Type | Modifiers / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id`, Foreign Key references `User.id` (`onDelete: Cascade`)| Shared profile relationship. |
| `name` | `String` | - | Name. |
| `email` | `String` | `@unique` | Email address. |
| `registrationNo`| `String` | - | Government employment reference code. |
| `designation` | `String` | - | Professional title. |
| `teaching` | `Boolean` | - | Flag indicating class assignment. |
| `admin` | `Boolean` | `@default(false)` | Flag indicating administrative dashboard controls. |
| `classesTeaching`| `String[]`| `@default([])` | Array list of classes taught. |
| `subjectsTaught` | `String[]`| `@default([])` | Array list of subjects taught. |

#### 5. `Parent`
Detailed profile for parents and legal guardians.
| Field Name | Data Type | Modifiers / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id`, Foreign Key references `User.id` (`onDelete: Cascade`)| Shared profile relationship. |
| `name` | `String` | - | Name. |
| `email` | `String` | `@unique` | Email address. |
| `phoneNo` | `String` | - | Primary telephone contact. |
| `address` | `String` | - | House address. |

#### 6. `Student`
Detailed profile for students.
| Field Name | Data Type | Modifiers / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id`, Foreign Key references `User.id` (`onDelete: Cascade`)| Shared profile relationship. |
| `name` | `String` | - | Name. |
| `email` | `String` | `@unique` | Email. |
| `parentId` | `String` | Foreign Key references `Parent.id` | Link to primary contact parent. |
| `class` | `String` | - | Academic grade name (e.g. "1A", "JSS1"). |
| `gender` | `Gender` | `Enum` (`MALE`, `FEMALE`) | Biological gender. |

#### 7. `Timetable`
Master timetable schedules parsed from Excel files.
| Field Name | Data Type | Modifiers / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id`, `default(uuid())` | Primary key. |
| `day` | `String` | - | Weekday name (e.g., "MONDAY"). |
| `startTime` | `String` | - | Period start boundary (e.g. "8:10AM"). |
| `endTime` | `String` | - | Period end boundary (e.g. "8:50AM"). |
| `class` | `String` | - | Class division name. |
| `subject` | `String` | - | Subject assigned to period. |
| `period` | `Int` | - | Sequence number of the slot. |
| `periodSpan` | `Int` | - | Number of blocks this subject covers (merged cells). |

#### 8. `Attendance`
Daily roll call database.
| Field Name | Data Type | Modifiers / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id`, `default(uuid())` | Primary Key. |
| `date` | `DateTime` | - | Calendar date of attendance record. |
| `schoolId` | `String` | Foreign Key references `School.id` (`onDelete: Cascade`) | Scope. |
| `studentId` | `String` | Foreign Key references `Student.id` | Targeted student. |
| `classId` | `String` | Foreign Key references `Class.id` (`onDelete: Cascade`) | Scope class. |
| `status` | `AttendanceType`| `Enum` (`PRESENT`, `ABSENT`) | Attendance result. |

---

## 🔒 Security Framework & JWT Lifecycle
EduStream implements a **stateless JSON Web Token (JWT)** security architecture with high-security safeguards, including database-backed session tracking and instant token rotation.

```text
Authentication Flow:
1. POST /api/auth/login with credentials.
2. Verify bcrypt password match.
3. Sign Access Token (15 mins duration, HTTP-Only Cookie).
4. Sign Refresh Token (1 week/4 weeks duration, HTTP-Only Cookie).
5. Hash Refresh Token (SHA-256) and write to database 'RefreshTokens' with Client details.
```

### 🗝️ Token Configuration & Parameters
- **Access Token (`accesstoken`)**: Signed with `JWT_SECRET`, valid for **15 minutes**. It is stored in a secure `HttpOnly`, `SameSite=Strict`, `Path=/` cookie. In production, the cookie has the `Secure` flag enabled (HTTPS only).
- **Refresh Token (`refreshtoken`)**: Signed with `JWT_SECRET`, valid for **1 week** (extended to **4 weeks** on email activations). It is stored in a matching secure `HttpOnly` cookie.
- **Session Tracking Database Record**: Every login hashes the refresh token using a crypto-safe **SHA-256** digest (`crypto.createHash('sha256')`). This token hash is saved to the database along with the user's IP Address and browser User Agent. This provides security benefits:
  1. Admins can view active logged-in sessions.
  2. Users can perform a complete log out which deletes their refresh token record, instantly revoking all active sessions on that device.
  3. If a token is stolen, the system detects any reuse or signature tampering, immediately marking it invalid.

---

## 🔄 Resilient API Token Refresh Queuing
When an active user stays on the platform, their 15-minute `accesstoken` will eventually expire. The application handles this transparently behind the scenes using a **custom Axios response interceptor** inside `src/lib/apiclient.ts`.

If multiple asynchronous components attempt to fetch API data concurrently after the access token has expired, they might trigger a wave of parallel refresh token requests. EduStream prevents this by implementing a **Failed Request Queue Mechanism**:

```mermaid
sequenceDiagram
    participant C as API Client
    participant I as Axios Interceptor
    participant S as /api/auth/refresh (API)
    
    Note over C,I: Access Token Expired (Cookie)
    C->>I: Request A (Failed 401)
    C->>I: Request B (Failed 401)
    Note over I: Set isRefreshing = true
    Note over I: Queue Request A & Request B
    I->>S: POST /api/auth/refresh (One Call)
    S-->>I: Success (New Cookies Set)
    Note over I: Process Failed Queue
    I->>C: Retry Request A (Success)
    I->>C: Retry Request B (Success)
    Note over I: Set isRefreshing = false
```

### 💻 Interceptor Implementation (`src/lib/apiclient.ts`)
```typescript
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(apiClient(prom.config));
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post("/api/auth/refresh");
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError);
        if (typeof window !== "undefined") {
          window.location.href = "/logout";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
```

---

## ⚡ Core Workflows & Engines

### A. School Workspace Bootstrapping & Auto-Mapping Engine
The initial system setup is handled by `/api/auth/create`. This endpoint is capable of bootstrapping an entire school environment in a single transactional payload. When an admin registers a school, they upload a bulk package consisting of staff data, class listings, student details, parent registries, and timetable configs.

Rather than forcing sequential, error-prone CRUD calls, the **Auto-Mapping Engine** executes a robust relationship-linking sequence:
1. Generates a new `schoolId` (UUID).
2. Generates distinct UUIDs for all incoming Parents and Staff.
3. **Automatic Parent-Student Linking**: It automatically loops through the uploaded Students and matches them to their corresponding Parents by comparing the student's `parentName` and `parentNo` against the Parent list's `name` and `phoneNo`. Once matched, the parent's generated UUID is mapped to the student's `parentId` foreign key.
4. Generates unique UUIDs for all Students, Subjects, Classes, and Timetable slots.
5. Invokes bulk insertions (`createMany`) across `School`, `Staff`, `Parent`, `Student`, `Subject`, `Class`, and `Timetable` tables.
6. Automatically populates the master `User` security table with corresponding records, setting correct roles (`ADMIN`, `TEACHER`, `STUDENT`, `PARENT`, `NONTEACHING`) according to the staff's designation flags.

---

### B. Timetable Excel Parsing & Preview Engine
The timetable system utilizes a custom client-side uploader powered by **SheetJS (`xlsx`)** inside `src/components/forms/AddTimeTable.tsx` which parses raw spreadsheets into organized databases.

#### ⚙️ Extraction Flow & Merged Period Logic
```text
Spreadsheet Row Structure:
[ Day/Class ] | [ Class Name ] | [ Period 1: 8:10-8:50 ] | [ Period 2: 8:50-9:30 ] | ...
-----------------------------------------------------------------------------------------
 MONDAY       | 1A             | MATHEMATICS            | MATHEMATICS            | ...
 (Merged Row) | 1B             | MARKETING              | <Empty (merged block)> | ...
```
1. **Header Analysis**: The system extracts the top row starting at column index 2 to identify periods and their exact times (e.g., `"8:10AM - 8:50AM"`).
2. **Double-Pointer Mapping**: It iterates through the rows. Column 0 represents the `Day` (with fallback to the last seen non-empty day value to support merged cells). Column 1 holds the `Class Name` (e.g., `"1A"`).
3. **Merged Column Span Resolution**: 
   - If a subject is detected in column `colIndex`, a new entry is initialized with a `periodSpan` of `1` and start/end times mapped from the header.
   - If the next cell is empty or null, the engine recognizes a horizontally merged cell (a multi-period subject block). It increments the `periodSpan` of the active subject by `1` and updates its `endTime` to match the end time of the merged period.
4. **HTML Caching**: The engine generates raw HTML representation of the excel using `sheet_to_html` and saves it directly in the `School` model. This allows lightning-fast rendering of the master school calendar without rebuilding grids on the client.

---

### C. Attendance Roll Call & Metric Aggregator
The Attendance Roll Call engine provides class-level tracking for teachers with direct real-time metric updates.

- **Double-State Submission (`POST` /api/attendance)**: When a teacher submits roll call, the system checks if database records already exist for today. If not, it executes a bulk `createMany` operation. If records do exist, it maps them by student ID and performs a delta diff, executing `update` calls only for students whose attendance status changed. This minimizes database writes.
- **Metric Aggregation (`POST` /api/school)**: When dashboard analytics load, the system computes metrics concurrently using advanced Prisma aggregate tools:
  - **Gender Distribution**: Group-by count on `Student` table grouped by `gender`.
  - **Weekly Daily Aggregation**: Runs 5 asynchronous calls in parallel for the current week's Mon-Fri days. Uses `.groupBy` on `Attendance` status for that specific date range, giving accurate totals of students present and absent each day.
  - **Yearly Monthly Aggregation**: Runs 12 parallel range calls for each month of the current year, providing the data needed for long-term attendance charts.

---

### D. Nodemailer Automated Password Activation Flow
To maintain secure workflows, unhashed passwords are never sent or created directly by admins. Instead, the application uses an **asynchronous activation process**:

```mermaid
sequenceDiagram
    participant A as Admin Dashboard
    participant API as /api/auth/email
    participant DB as PostgreSQL
    participant E as User Email Inbox
    participant C as /api/auth/confirm
    
    A->>API: Post user creation email & tempPassword
    Note over API: Generate UUID v4 Token
    API->>DB: Save resetToken, resetTokenExpiry, tempPassword
    API->>E: Send onboarding invitation link
    Note over E: User clicks Link
    E->>C: GET request with token
    Note over C: Validate token & expiry
    C->>DB: Hash tempPassword with Bcrypt
    C->>DB: Clear resetToken & tempPassword fields
    C->>DB: Set active cookies & sessions
    C-->>A: Redirect to role-based dashboard
```

1. **Staging**: Creating a new user stores their temporary password inside the `tempPassword` field, and leaves the actual `password` blank (or set to `""`).
2. **Token Dispatch**: An SMTP Nodemailer transporter creates a secure connection to Gmail on port 465. It generates a unique UUID v4 `resetToken` along with an expiry timestamp set to exactly 1 hour.
3. **Invitation**: An invitation containing an activation URL (`/api/auth/confirm?token=TOKEN`) is sent to the user's inbox.
4. **Bcrypt Resolution**: When clicked, the backend verifies the token and expiry. It then hashes the temporary password using `bcryptjs` with `10` salt rounds, writing the secure result to the `password` field and clearing all temporary staging credentials.
5. **Direct Login**: Finally, the response generates the JWT session, logs the user in immediately, and redirects them to their personal dashboard.

---

## 🔌 REST API Endpoint Directory

### 📂 Authentication & Onboarding
| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/create` | Public / Initial | Bootstraps a new school, its initial staff, classes, parents, students, timetables, and root administrators. |
| `POST` | `/api/auth/login` | Public | Authenticates credentials, generates Access/Refresh tokens, sets secure cookies, and stores the session details. |
| `POST` | `/api/auth/logout` | Authenticated | Clears cookies and deletes active refresh token hashes from the database. |
| `POST` | `/api/auth/refresh` | Authenticated | Validates refresh tokens, rotates sessions, and issues a fresh set of Access/Refresh tokens. |
| `POST` | `/api/auth/email` | Admin Only | Stages temp credentials, creates a v4 activation token, and dispatches the invitation email via Nodemailer. |
| `GET` | `/api/auth/confirm` | Public | Validates onboarding tokens, hashes staging passwords, initiates immediate login sessions, and redirects. |

### 📊 Dashboard & School Metadata
| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/school` | Authenticated | Computes dashboard analytics (student gender ratios, school-wide headcounts, weekly daily charts, yearly monthly trends). |
| `PUT` | `/api/school` | Admin Only | Updates brand colors, principal names, and school slogans. Re-writes or replaces timetable schedules in bulk. |

### 📅 Attendance Tracker
| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/attendance` | Teacher Only | Fetches all students in the teacher's assigned class along with their compiled attendance for today. |
| `POST` | `/api/attendance` | Teacher Only | Records or updates today's class-wide attendance roll call using diff-delta optimizations. |
| `PATCH`| `/api/attendance` | Teacher Only | Updates a specific student's attendance record (e.g. marking a late student present). |
| `DELETE`| `/api/attendance`| Teacher Only | Deletes a specific attendance record by ID. |

### 👥 Entity Operations (CRUD)
| Method | Endpoint | Scope / Path | Authorization | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/staffs` | `?page=1&limit=10` | Authenticated | Lists staff members with dynamic pagination. |
| `POST` | `/api/staffs` | - | Admin Only | Creates a new staff member and staging credentials. |
| `GET` | `/api/students`| `?page=1&limit=10` | Staff Only | Lists student directory with search filters. |
| `POST` | `/api/students`| - | Admin Only | Creates a new student and automatically links parent. |
| `GET` | `/api/parents` | `?page=1&limit=10` | Staff Only | Lists parent directories. |
| `GET` | `/api/classes` | - | Authenticated | Lists class names and assigned class teachers. |
| `GET` | `/api/subjects`| - | Authenticated | Lists academic courses and assigned instructors. |

---

## 👥 Role-Based Access Control (RBAC) Grid
EduStream secures routes, API requests, and user menus based on roles.

| Dashboard Sidebar Item | Admin | Teacher | Student | Parent | Non-Teaching |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Dashboard Home** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Staff Directory** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Student Directory**| ✅ | ✅ | ❌ | ❌ | ✅ |
| **Parent Directory** | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Subjects Catalog** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Class Formations** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Daily Attendance** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Events Manager** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Announcements** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Settings Panel** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🛠️ Local Installation & Development Bootstrap Guide
Follow these steps to run a local instance of the EduStream platform:

### 📋 Prerequisites
- **Node.js**: `v18.x` or higher
- **PostgreSQL Database**: local instance or hosted service (e.g., Neon, Supabase)
- **SMTP Server**: A Gmail account with a configured App Password for automated emails.

### 🔌 Step 1: Clone & Install Dependencies
Run the installation command using the peer-dependency bypass to ensure smooth package resolution:
```bash
npm install --legacy-peer-deps
```

### 📂 Step 2: Configure Environment Variables
Create a `.env` file in the root directory of your project and populate it with the following configuration:
```env
# Database Credentials (PostgreSQL connection string)
DATABASE_URL="postgresql://username:password@localhost:5432/edustream?schema=public"

# Session Security (Enter a strong, random key)
JWT_SECRET="your_jwt_signature_secret_key_here"

# Next.js Application URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
BASE_URL="http://localhost:3000"

# SMTP Nodemailer Credentials
EMAIL="your_gmail_address@gmail.com"
EMAIL_PASSWORD="your_gmail_app_password"
```

### 💾 Step 3: Initialize Database Schema
Generate your local Prisma Client and sync the database schema directly to PostgreSQL:
```bash
# Generate the client structure
npx prisma generate

# Sync schemas and create tables
npx prisma db push
```

### 🚀 Step 4: Run Development Server
Start the development environment with Next.js Turbopack compiler:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`. You can now click "Get Started" and begin creating your first custom branded school!

---

## 📄 License
This application is licensed under the Apache License 2.0. Developed as a high-performance, industry-ready Final Year Project (FYP).
