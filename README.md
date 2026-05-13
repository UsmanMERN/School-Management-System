# 🚀 EduStream: Modern School Management System 🏫

A comprehensive school management application built with **Next.js**, **Prisma**, and **Tailwind CSS**, designed to connect admins, teachers, parents, and students. This project was developed as a Final Year Project (FYP).

## ✨ Features

- 👩‍🏫 **Admin Dashboard**: Manage staff, parents, and students with full editing capabilities.
- 📅 **Personalized Schedule Calendars**: Students and teachers receive real-time schedule calendars based on the school timetable.
- 📊 **Attendance Analytics**: Teachers can take attendance and access real-time analytics on attendance rates.
- 👪 **Parent Portal**: Parents can conveniently view the schedules of all their children.
- 📢 **School-Wide Communication**: Share important announcements and events school-wide to keep everyone in the loop.
- 📱 **PWA Support**: Install the app on any device for quick and easy access.

## 💻 Technologies Used

| Technology     | Description                                                              |
| :------------- | :----------------------------------------------------------------------- |
| Next.js        | React framework for building performant web applications                 |
| TypeScript     | Superset of JavaScript for enhanced type safety                        |
| Tailwind CSS   | Utility-first CSS framework for rapid UI development                   |
| Prisma         | Modern database toolkit & ORM                                          |
| JSON Web Tokens| For Secure Authentication                                                |
| Nodemailer     | For automated email services                                             |
| Framer Motion  | Used for smooth animations and transitions                               |
| React Hook Form| Used for efficient form handling                                         |
| Zod            | For robust schema validation                                             |
| Zustand        | For lightweight state management                                         |

## 🛠️ Installation

Follow these steps to set up the project locally:

1.  **Install dependencies**:
    ```bash
    npm install --legacy-peer-deps
    ```

2.  **Set up your .env file**:
    -   Create a `.env` file in the root directory.
    -   Add the following environment variables:
    ```
    DATABASE_URL=your_database_url
    JWT_SECRET=your_jwt_secret
    NEXT_PUBLIC_BASE_URL=http://localhost:3000
    EMAIL=your_email
    EMAIL_PASSWORD=your_email_password
    ```

3.  **Sync Database**:
    ```bash
    npx prisma db push
    ```

4.  **Start the development server**:
    ```bash
    npm run dev
    ```

## 🚀 Usage

1.  **Access the application**:
    -   Open your browser and navigate to `http://localhost:3000`.

2.  **Register a new school**:
    -   Click on "Get Started" and navigate to create a new school.
    
3.  **Login**:
    -   Log in with the credentials provided during school registration.
    
4.  **Explore the dashboard**:
    -   Admins can manage school data.
    -   Teachers can take attendance and view schedules.
    -   Parents can view their children's schedules.
    -   Students can view their schedules and announcements.

## 📄 License

This project is licensed under the Apache License 2.0.
