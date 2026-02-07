## 1. Project Overview

**Academy** is a specialized administrative dashboard designed for internal use by a single administrator. The system facilitates the management of classrooms, teachers, and students. The primary focus is on operational efficiency, real-time availability tracking, and data visualization.

### Technical Stack Requirements

* **Framework:** Next.js (App Router)
* **Styling:** Tailwind CSS
* **Component Library:** shadcn/ui (Recommended for consistency and accessibility)
* **State Management:** React Context API or Zustand (for local state handling)
* **Version Control:** Git (Local)

Base of the Project is already set-upped and provided
---

## 2. Core Entities and Data Models

### 2.1 Classrooms

* **Attributes:** Name/ID, Capacity (Student Count), Assigned Status (Occupied/Free).
* **Functionality:** Administrators can view a fixed list and add new classroom units.

### 2.2 Teachers

* **Attributes:** Full Name, Contact Number, Subject Specialization.
* **Schedule:** A collection of Date-Time objects representing assigned class slots.
* **Functionality:** Add/Remove teachers; update schedule by adding or removing time slots.

### 2.3 Students

* **Attributes:** Full Name, Contact Number, Guardian Name, Guardian Contact.
* **Academic Info:** List of registered subjects.
* **Financials:** Monthly fee status (tracked per month and per subject).
* **Attendance:** Log of attendance mapped to each registered subject.
* **Functionality:** Add/Remove students.

---

## 3. Functional Requirements

### 3.1 Dashboard & Navigation

The interface must prioritize "at-a-glance" information:

* **Availability Tracker:** A visual indicator of currently free vs. occupied classrooms.
* **Schedule Overview:** A view of upcoming classes based on the teacher's date-time objects.

### 3.2 Classroom Management

* **View:** List or Grid view of all classrooms.
* **Action:** Form to add new classrooms with capacity specifications.
* **Status:** Toggle or indicator showing if a room is "In Use" or "Free."

### 3.3 Teacher Management

* **Directory:** Searchable list of all teachers.
* **Schedule Editor:** Interface to manage a teacher's availability. This must allow adding new class instances and removing obsolete ones.
* **Dynamic Assignment:** Admin capability to link a teacher to a specific classroom for a scheduled slot.

### 3.4 Student Management & Attendance

* **Enrollment:** Form to capture student and guardian details.
* **Attendance Module:** A dedicated interface where the admin selects a class/subject and marks attendance for the enrolled students.
* **Payment Tracking:** A status board showing "Paid" or "Pending" for each student per subject, per month.

---

## 4. UI/UX Guidelines

### 4.1 Layout Structure

1. **Sidebar:** Navigation links (Dashboard, Classrooms, Teachers, Students, Attendance).
2. **Top Bar:** Title ("Academy Admin"), Date/Time, and Admin Profile.
3. **Main Content Area:** Dynamic views based on navigation.

### 4.2 Component Requirements (using shadcn/ui)

* **Tables:** For student and teacher directories with filtering.
* **Dialogs (Modals):** For adding/editing entities (Teachers, Students, Classrooms).
* **Cards:** To display classroom status and upcoming class summaries.
* **Badges:** For status indicators (e.g., "Paid", "Present", "Free").

---

## 5. System Logic and Constraints

* **Admin-Only Access:** The frontend should be structured as a protected administrative area. No public-facing views are required.
* **Dynamic Classroom Assignment:** The system must allow the admin to reassign classrooms based on availability.
* **Data Persistence:** While this is a frontend task, the components must be structured to send/receive JSON data representing the entities described above.

---

## 6. Information Architecture

| Feature | Description | Requirement |
| --- | --- | --- |
| **Classroom List** | Visual grid of all rooms | Show name, capacity, and current status |
| **Teacher Profile** | Detail view for staff | Manage subject and specific class timings |
| **Student Record** | Comprehensive data view | Track attendance and monthly fee status per subject |
| **Attendance Marker** | Daily operation tool | Simple checkbox or toggle list per class session |

---
