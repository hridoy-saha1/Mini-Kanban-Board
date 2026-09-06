# Mini Kanban Board

A full-stack Kanban board application built as a Full-Stack Engineering Assessment.

The application allows authenticated users to create and manage boards, organize work using columns and tasks, share boards with other registered users, and move tasks through an interactive drag-and-drop interface.

## 🚀 Live Demo

- **Frontend:** https://mini-kanban-board-taupe.vercel.app/
- **Backend API:** https://mini-kanban-board-9bci.onrender.com
- **GitHub:** https://github.com/hridoy-saha1/Mini-Kanban-Board

---

## ✨ Features

### Authentication
- User registration
- User login
- JWT-based authentication
- Protected API routes
- Password hashing with bcrypt
- User profile endpoint

### Board Management
- Create boards
- View accessible boards
- Update boards
- Delete boards
- Board ownership
- Share boards with registered users

### Column Management
- Create columns
- Update columns
- Delete columns
- Reorder columns

### Task Management
- Create tasks
- Update tasks
- Delete tasks
- Move tasks within the same column
- Move tasks between columns
- Move tasks to a specific position
- Stable task ordering

### Access Control
- Users can only access boards they own or have been explicitly granted access to
- Board, column, and task operations validate authorization
- Prevents unauthorized cross-board access

### User Interface
- Responsive Kanban board interface
- Interactive drag-and-drop task movement
- Login and registration pages
- Clean and minimal UI
- Loading and error states

---

## 🛠️ Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- JWT
- Passport
- bcrypt

### Database
- PostgreSQL
- Supabase PostgreSQL

### Deployment
- Vercel — Frontend
- Render — Backend
- Supabase — Database

---

## 📁 Project Structure

```text
Mini-Kanban-Board/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── mini-kanban-board-backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── boards/
│   │   ├── columns/
│   │   ├── tasks/
│   │   └── ...
│   ├── package.json
│   └── ...
│
└── README.md
