# Academy Admin Dashboard

**Academy** is a specialized administrative interface designed for educational institutions to centralize their daily operations, including classroom allocation, teacher scheduling, and student lifecycle management.

---

## 1. Scenario

### The Problem

Educational institutions often face fragmented data management. Schedules reside in spreadsheets, student records in physical files, and classroom availability is often tracked manually or via memory. This fragmentation leads to:

* **Scheduling conflicts** between teachers and rooms.
* **Delayed access** to student guardian and payment information.
* **Inefficient resource usage** due to lack of real-time visibility.

### The Solution

Academy provides a unified, single-source-of-truth dashboard that allows administrators to:

* **Monitor Real-Time Status:** Instantly identify occupied vs. free classrooms.
* **Dynamic Scheduling:** A simplified interface to assign teachers to specific rooms and time slots.
* **Centralized Data:** Quick access to student attendance, guardian contacts, and payment status per subject.

---

## 2. Technical Stack

The application is built with a high-performance stack focused on type safety and developer velocity.

* **Framework:** [Next.js 14 (App Router)](https://nextjs.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Components:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI + Lucide React)
* **Language:** TypeScript
* **Data Simulation:** A custom `MockDataService` class handles CRUD operations with artificial delays to simulate a production backend environment.

### Key Design Decisions

* **Semantic Theming:** Uses CSS variables for colors, enabling seamless **Dark Mode** support by default.
* **Responsive Architecture:** Employs a mobile-first grid system where complex data views (like teacher lists) adapt gracefully from single-column to multi-column layouts.
* **Context Preservation:** Utilizes side-sheets (Drawers) and Modals for detail views to keep the administrator's place in large lists.

---

## 3. Core Modules & Walkthrough

### Dashboard Overview

The command center of the application. It features high-level stat cards (total students, active teachers, room count) and a visual room grid.

* **Visual Indicators:** Color-coded badges instantly show room availability.

![Dashboard Overview - Stats cards layout and room status grid](/development_logs/screen_dashboard_2.png)

### Weekly Master Schedule

A centralized timetable that displays the institution's entire weekly commitment.

* **Optimized UI:** Features horizontal internal scrolling to maintain layout stability on smaller screens while displaying dense data.

![Dashboard Overview - Stats cards layout and room status grid](/development_logs/screen_dashboard_1.png)

### Teacher Schedule Management

Administrators can manage staff availability through a dual-pane modal interface.

* **Actionable UI:** The left pane handles new slot entries, while the right pane displays the current schedule for immediate conflict verification.

![Schedule Manager Dialog - Side-by-side layout for adding slots](/development_logs/screen_teachers_1.png)

![Schedule Manager Dialog - Side-by-side layout for adding slots](/development_logs/screen_teachers_2.png)

### Student Records & Attendance

Detailed student profiles are accessible via side-sheets.

* **Data Aggregation:** View guardian contacts, subject-specific attendance, and monthly fee status (Paid/Pending) in a single pane.

![Student Details Sheet - Slide-out panel with student info](/development_logs/screen_students_1.png)

![Student Details Sheet - Slide-out panel with student info](/development_logs/screen_students_2.png)

---

## 4. Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/academy-admin.git

```


2. Install dependencies:
```bash
npm install

```


3. Run the development server:
```bash
npm run dev

```


4. Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser.
