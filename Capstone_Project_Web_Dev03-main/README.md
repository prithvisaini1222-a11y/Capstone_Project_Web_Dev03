# CampusConnect – University Campus Management System

Backend Development Capstone Project (Node.js, Express.js, MongoDB, Mongoose).

## Features
- Three roles: admin, faculty and student; bcrypt password hashing.
- JWT access + rotating refresh tokens and protected RBAC routes.
- Student/faculty/course/section/enrollment management.
- Attendance marking, student attendance history and percentage summaries.
- Low-attendance report and course-enrollment aggregation reports.
- University/course/section announcements.
- Socket.IO authenticated connections and live announcement events.
- EventEmitter event `announcement.created`.
- Centralized errors, request logging, validation and MongoDB indexes.

## Requirements
Node.js 18+, npm, MongoDB local instance or MongoDB Atlas.

## Setup
1. Extract the project and open its folder in VS Code.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set your MongoDB URI and two long random JWT secrets.
4. Start MongoDB if using a local database.
5. Run `npm run seed` to create demo users, course, section and enrollments.
6. Run `npm run dev`.
7. Open `http://localhost:5000`.

Never upload `.env` to GitHub. `.gitignore` already excludes it.

## Demo accounts
- Admin: `admin@campus.test` / `Admin@12345`
- Faculty: `faculty@campus.test` / `Faculty@12345`
- Student: `student1@campus.test` / `Student@12345`

Change demo passwords before any public deployment.

## Authentication
Login at `POST /api/auth/login`. Send `Authorization: Bearer <accessToken>` on protected routes. When access expires, send refresh token to `POST /api/auth/refresh`; the server rotates the refresh token. Logout at `POST /api/auth/logout` invalidates refresh-token use.

Public registration creates student accounts only. Admin creates faculty/admin accounts.

## API quick reference

| Method | Endpoint | Role |
|---|---|---|
| POST | `/api/auth/register` | Public (student) |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Authenticated |
| GET | `/api/auth/me` | Authenticated |
| GET/POST | `/api/users` | Admin |
| PATCH/DELETE | `/api/users/:id` | Admin |
| GET/POST | `/api/courses` | Authenticated / Admin create |
| GET/PATCH/DELETE | `/api/courses/:id` | Authenticated / Admin or assigned faculty |
| GET/POST | `/api/courses/sections` | Authenticated / Admin or assigned faculty create |
| POST | `/api/courses/enrollments` | Admin |
| GET | `/api/courses/enrollments/mine` | Authenticated |
| POST | `/api/attendance/mark` | Admin/Faculty |
| GET | `/api/attendance/mine` | Student; faculty can query `?student=<id>` |
| GET | `/api/attendance/summary` | Student; admin/faculty can query `?student=<id>` |
| GET | `/api/attendance/low?threshold=75` | Admin/Faculty |
| GET/POST | `/api/announcements` | Authenticated / Admin or Faculty create |
| GET | `/api/reports/enrollments` | Admin |

## Example request bodies

Register student:
```json
{ "name":"A Student", "email":"a@student.test", "password":"Student@123", "studentId":"STU100", "department":"CSE" }
```

Create faculty (admin token):
```json
{ "name":"Faculty Name", "email":"faculty2@campus.test", "password":"Faculty@123", "role":"faculty", "department":"CSE" }
```

Create course (admin token):
```json
{ "code":"CSE301", "title":"Database Systems", "department":"CSE", "credits":4, "faculty":"FACULTY_USER_ID" }
```

Mark attendance (faculty/admin token):
```json
{
  "course":"COURSE_ID", "section":"SECTION_ID", "date":"2026-11-20",
  "records":[
    { "student":"STUDENT_ID_1", "status":"present" },
    { "student":"STUDENT_ID_2", "status":"absent" }
  ]
}
```

Create announcement:
```json
{ "title":"Lab Notice", "message":"Lab starts at 10 AM.", "audience":"university" }
```

## Socket.IO
Connect with:
```js
const socket = io("http://localhost:5000", { auth: { token: accessToken } });
socket.on("announcement:new", data => console.log(data));
```
Socket authentication uses the JWT access token. On announcement creation, the EventEmitter emits `announcement.created`; the server relays it as `announcement:new`.

## Aggregation pipelines and indexes
1. Attendance summary groups records by student and course, calculates percentage and looks up course details.
2. Low-attendance report groups attendance, calculates percentages and looks up student/course documents.
3. Enrollment report counts students per course and joins course details.
Indexes include unique user email, course code, section/course/year, enrollment student/course, attendance student/course/date, and course/date.

## Testing checklist (Postman)
1. Login with each demo role and save the access token.
2. Create a course as admin; confirm faculty cannot create one.
3. Mark attendance as assigned faculty; confirm unassigned faculty gets 403.
4. Fetch attendance as a student; confirm only own records are returned.
5. Send missing fields to registration/attendance; expect 400.
6. Call protected endpoint without token; expect 401.
7. Call admin endpoint as student; expect 403.
8. Repeat enrollment; expect duplicate conflict (409).
9. Request an unknown ID/route; expect 400/404.
10. Create announcement and confirm connected socket receives `announcement:new`.

## Important implementation note
This is an academic starter implementation. Before production use, add rate limiting, stricter schema validation, audit history for attendance corrections, transactional bulk attendance handling, and more granular announcement audience filtering. Test all flows with your course's exact rubric before submission.
