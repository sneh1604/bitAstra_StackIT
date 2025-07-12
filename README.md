# bitAstra_StackIT

Problem Statement: StackIt - A minimal Q&A Forum Platform

Team Member 1: Sneh Shah
Email: snehpshah5721@gmail.com

Team Member 2: Love Shah
Email: loveshah2112@gmail.com

Team Member 3: Dhruv Shah
Email: dhruv4064shah@gmail.com

Project Video Link: https://drive.google.com/drive/folders/1ZhRGHA008EombxUTg3bQc0hq1wn7Aews?usp=share_link
-----------------------------------------------------------------------------------------------------------------

# 🚀 bitAstra_StackIT - Advanced Q&A Platform

> **A full-stack Stack Overflow clone with enterprise-grade features, built for modern web development**

[![Next.js](https://img.shields.io/badge/Next.js-14.2.30-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC)](https://tailwindcss.com/)

## 🎯 Project Overview

**bitAstra_StackIT** is a sophisticated Q&A platform that replicates and enhances Stack Overflow's core functionality. Built with modern technologies and best practices, it features a comprehensive admin system, advanced content management, real-time notifications, and an intuitive user experience.

### 🏆 Hackathon Features

This project demonstrates advanced full-stack development capabilities including:
- **Real-time voting system** with reputation management
- **Advanced rich text editor** with TipTap integration
- **Comprehensive admin dashboard** with analytics
- **Automated notification system** with smart triggers
- **Robust content moderation** with reporting system
- **Modern UI/UX** with Framer Motion animations
- **Type-safe development** with TypeScript
- **Responsive design** with mobile-first approach

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **TipTap** - Advanced rich text editor
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Image and media management
- **Nodemailer** - Email service integration
- **Winston** - Advanced logging system

### DevOps & Tools
- **Vercel** - Frontend and backend deployment
- **MongoDB Atlas** - Cloud database
- **Git** - Version control
- **ESLint & Prettier** - Code formatting

---

## ✨ Key Features

### 🔐 Advanced Authentication System
- **JWT-based authentication** with secure token management
- **Role-based access control** (User/Admin)
- **Password hashing** with bcryptjs
- **Account banning system** for moderation
- **Session management** with automatic token refresh
- **Secure login/logout** with proper error handling

### 📝 Rich Content Management
- **Advanced TipTap Rich Text Editor** with:
  - Bold, italic, strikethrough formatting
  - Bullet and numbered lists
  - Code blocks with syntax highlighting
  - Image and link insertion
  - Emoji picker with 100+ emojis
  - Text alignment (left, center, right, justify)
  - Undo/redo functionality
  - Real-time preview
- **Tag system** with search and creation
- **Content validation** and sanitization
- **Markdown-like formatting** support

### 🗳️ Intelligent Voting System
- **Upvote/downvote** questions and answers
- **Reputation system** with automatic calculations:
  - +5 reputation for question upvotes
  - +10 reputation for answer upvotes
  - +15 reputation for accepted answers
  - +2 reputation for accepting answers
- **Vote tracking** with user-specific vote history
- **Anti-gaming measures** to prevent vote manipulation
- **Real-time vote updates** with animations

### 🏆 Answer Acceptance System
- **Question authors** can accept answers
- **Visual indicators** for accepted answers
- **Reputation bonuses** for accepted answers
- **Community recognition** for helpful contributors
- **Automatic notifications** for accepted answers

### 🔔 Smart Notification System
- **Real-time notifications** for:
  - New answers on your questions
  - Votes received on your content
  - Answer acceptance
  - User mentions (@username)
  - Milestone achievements
  - Admin announcements
- **Notification preferences** and management
- **Email notifications** via Nodemailer
- **In-app notification center**

### 🛡️ Comprehensive Admin Dashboard
- **User Management**:
  - View all users with detailed profiles
  - Ban/unban users with reason tracking
  - Role management (User/Admin)
  - User statistics and activity tracking
- **Content Moderation**:
  - Review reported content
  - Resolve or dismiss reports
  - Delete inappropriate content
  - User warning system
- **Analytics Dashboard**:
  - Real-time platform statistics
  - User growth metrics
  - Content engagement analytics
  - Popular tags and questions
- **Announcement System**:
  - Create platform-wide announcements
  - Target specific user groups
  - Scheduled announcements

### 📊 Advanced Reporting System
- **Multi-type reporting** (questions, answers, users)
- **Report categorization** with reasons
- **Admin review workflow** with status tracking
- **Automated report handling** with actions
- **Report analytics** and trends
- **Moderation history** tracking

### 🔍 Search & Discovery
- **Full-text search** across questions and answers
- **Tag-based filtering** and browsing
- **Advanced search filters** (date, votes, answers)
- **Search suggestions** and autocomplete
- **Related questions** recommendations
- **Trending topics** and popular tags

### 📱 Responsive Design
- **Mobile-first approach** with responsive layouts
- **Touch-friendly interfaces** for mobile devices
- **Progressive Web App** features
- **Cross-browser compatibility**
- **Accessibility compliance** (WCAG guidelines)
- **Dark/Light theme** support

### 🎨 Modern UI/UX
- **Framer Motion animations** for smooth interactions
- **Micro-interactions** and hover effects
- **Loading states** and skeleton screens
- **Toast notifications** for user feedback
- **Modal dialogs** and confirmation screens
- **Infinite scrolling** for content lists
- **Keyboard shortcuts** for power users

### 🔧 Developer Experience
- **TypeScript** for type safety
- **ESLint** and **Prettier** for code quality
- **Modular architecture** with clean separation
- **API documentation** with clear endpoints
- **Error handling** with detailed logging
- **Testing setup** with Jest
- **Hot reloading** for development

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Cloudinary account (for image uploads)
- Email service (Gmail, SendGrid, etc.)

-----

## 📁 Project Structure

```
bitAstra_StackIT/
├── backend/                 # Node.js/Express API
│   ├── config/             # Database, Passport, Cloudinary config
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Auth, error handling, upload
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Helper functions
│   └── server.js          # Entry point
├── frontend/              # Next.js application
│   ├── app/              # App Router pages
│   ├── components/       # Reusable components
│   ├── contexts/         # React contexts
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utility functions
│   └── public/          # Static assets
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create question
- `GET /api/questions/:id` - Get question details
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Answers
- `GET /api/questions/:id/answers` - Get answers for question
- `POST /api/questions/:id/answers` - Add answer
- `PUT /api/answers/:id/accept` - Accept answer

### Voting
- `POST /api/vote/question/:id` - Vote on question
- `POST /api/vote/answer/:id` - Vote on answer

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/ban` - Ban/unban user
- `GET /api/admin/reports` - Get all reports
- `PUT /api/admin/reports/:id/resolve` - Resolve report

---

## 🎯 Key Achievements

### 🏆 Technical Excellence
- **Full-stack TypeScript** implementation
- **Modern React patterns** with hooks and context
- **Scalable architecture** with clean separation
- **Performance optimized** with Next.js features
- **Security best practices** with JWT and bcrypt

### 🎨 User Experience
- **Intuitive interface** with modern design
- **Smooth animations** with Framer Motion
- **Responsive design** for all devices
- **Accessibility features** for inclusive design
- **Real-time feedback** with toast notifications

### 🔧 Developer Experience
- **Clean code structure** with proper organization
- **Type safety** throughout the application
- **Comprehensive error handling**
- **Detailed logging** for debugging
- **Modular components** for reusability

### 🚀 Production Ready
- **Vercel deployment** ready
- **MongoDB Atlas** integration
- **Cloudinary** for media management
- **Email service** integration
- **Environment configuration** management

---

## 👥 Team Members

- **Sneh Shah** - Frontend Developer
  - Email: snehpshah5721@gmail.com
  - Role: UI/UX Design & React Implementation

- **Love Shah** - Backend Developer  
  - Email: loveshah2112@gmail.com
  - Role: Backend Architecture & API Development

- **Dhruv Shah** - Database
  - Email: dhruv4064shah@gmail.com
  - Role: Database Design

---

## 📹 Demo & Documentation

- **Project Video**: [Watch Demo](https://drive.google.com/drive/folders/1ZhRGHA008EombxUTg3bQc0hq1wn7Aews?usp=share_link)
- **Live Demo**: [Coming Soon]
- **API Documentation**: [Coming Soon]

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- **Stack Overflow** for inspiration
- **Next.js team** for the amazing framework
- **TipTap** for the rich text editor
- **Framer Motion** for smooth animations
- **Tailwind CSS** for the utility-first approach
- **MongoDB** for the database solution

---

**Built with ❤️ by Team bitAstra for Hackathon 2024**

*This project demonstrates advanced full-stack development capabilities with modern technologies and best practices.*
