# CAMPUSCONNECT
## University Campus Management System
### Backend Development Capstone Project Report

**Technology Stack:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, Socket.IO

**Team Members:** ______________________________

**Course / Section:** ___________________________

**Faculty Mentor:** _____________________________

---

## 1. Abstract
CampusConnect is a backend application designed to organize essential university workflows. It provides role-specific services for administrators, faculty members and students. Administrators manage users, courses, sections and enrollments. Faculty members manage assigned academic activities and record attendance. Students can retrieve their enrolled courses, attendance records and announcements. The system uses a MongoDB database, REST APIs, JWT authentication, role-based authorization and Socket.IO notifications.

## 2. Problem Statement
Academic information is often distributed across separate systems or manual records. This can make it difficult to maintain accurate attendance, manage course enrollments and communicate updates. CampusConnect proposes a centralized backend that stores academic records and exposes controlled APIs for the three main user roles.

## 3. Objectives
- Build a centralized backend for core academic information.
- Provide secure role-specific access for administrators, faculty and students.
- Maintain student-course-faculty relationships using MongoDB references.
- Record attendance and calculate subject-wise percentages.
- Generate enrollment and low-attendance reports using aggregation.
- Deliver announcements through real-time notifications.

## 4. Scope and Limitations
The project covers authentication, user/course/section management, enrollment, attendance, reports and announcements. The current implementation is a backend API and can be connected to a web or mobile frontend. It does not include a full student information system, timetable, fee management or downloadable PDF reports. Real deployment would require additional security hardening and operational monitoring.

## 5. Functional Requirements
- Users can log in and access permitted endpoints.
- Admin can create and manage users, courses, sections and enrollments.
- Faculty can access assigned courses and mark attendance.
- Students can view their own attendance and course enrollments.
- Admin/faculty can view low-attendance reports.
- Authorized users can publish announcements.
- Connected clients receive announcement notifications in real time.

## 6. Non-Functional Requirements
- Security: bcrypt password hashing, JWT and RBAC.
- Reliability: centralized error handling and database constraints.
- Maintainability: MVC/layered folder organization.
- Performance: pagination and indexes.
- Usability: consistent JSON API responses.
- Scalability: stateless REST API and Socket.IO event delivery.

## 7. System Architecture
Client / Postman → Express Routes → Authentication & Role Middleware → Controllers → Mongoose Models → MongoDB → JSON Response.

Socket.IO connections are authenticated using access tokens. Announcement creation emits an internal EventEmitter event, which the server forwards to connected clients through Socket.IO.

## 8. Database Design
Collections:
- **users:** name, email, password hash, role, student ID, department, active status and refresh-token hash.
- **courses:** code, title, description, department, credits and faculty reference.
- **sections:** section name, course reference, faculty reference, semester and academic year.
- **enrollments:** student, course and section references.
- **attendances:** student, course, section, faculty, date, status and marker.
- **announcements:** title, message, audience, optional course/section and creator.

Relationships:
- One faculty member can teach multiple courses.
- A course can have multiple sections.
- A student can enroll in multiple courses.
- Attendance records refer to one student, course and class date.
- Announcements are associated with their creator and optionally a course or section.

Indexes include unique email, unique course code, unique enrollment per student/course, unique attendance per student/course/date and section/course/year uniqueness.

## 9. REST API Documentation
The API route table and sample request bodies are documented in `README.md`. Main route groups are `/api/auth`, `/api/users`, `/api/courses`, `/api/attendance`, `/api/announcements` and `/api/reports`.

## 10. Authentication and Authorization
Passwords are hashed using bcrypt. Login issues a short-lived JWT access token and a refresh token. Refresh tokens are stored as hashes and rotated when refreshed. Protected middleware verifies access tokens. Role middleware restricts operations to admin, faculty or student users. Public registration is limited to student accounts; admin provisions faculty and admin accounts.

## 11. Implementation Details
The project follows a layered structure:
- Routes define HTTP endpoints.
- Middleware performs authentication, authorization and error handling.
- Controllers implement business logic.
- Models define Mongoose schemas, validation and indexes.
- EventEmitter separates announcement creation from notification delivery.
- Socket.IO provides real-time announcement events.

## 12. Testing Strategy and Test Cases
| Test | Expected result |
|---|---|
| Login with valid credentials | 200 and tokens |
| Login with wrong password | 401 |
| Access protected route without token | 401 |
| Student calls admin-only endpoint | 403 |
| Register with missing required fields | 400 |
| Create duplicate enrollment | 409 |
| Mark attendance for unassigned section | 403 |
| Student requests own attendance | 200 with own records |
| Request invalid resource ID | 400 |
| Request unknown route | 404 |
| Create announcement with active socket | `announcement:new` event |

Actual test evidence/screenshots should be added after running the APIs in Postman.

## 13. Screenshots / Demonstration Evidence
Add screenshots of:
1. Server running and MongoDB connected.
2. Admin login response.
3. Student registration and login.
4. Course and section creation.
5. Attendance marking.
6. Attendance summary and low-attendance report.
7. Unauthorized request returning 401/403.
8. Socket.IO announcement event.

## 14. Conclusion and Future Enhancements
CampusConnect demonstrates a role-based academic backend with REST APIs, MongoDB data modelling, authentication, authorization, aggregation and real-time events. Future work can include timetable management, attendance correction audit logs, downloadable reports, email alerts, rate limiting and a dedicated frontend dashboard.

## 15. References
- Node.js documentation: https://nodejs.org/docs/
- Express.js documentation: https://expressjs.com/
- MongoDB documentation: https://www.mongodb.com/docs/
- Mongoose documentation: https://mongoosejs.com/docs/
- Socket.IO documentation: https://socket.io/docs/
- JSON Web Token introduction: https://jwt.io/introduction
