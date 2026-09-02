# ☁️ Cloud Based Media File Storage Service

## 📌 Project Overview

Cloud Based Media File Storage Service is a web-based application that allows users to securely store and manage their files.

Users can create an account, log in, upload files, view their stored files, download files, and delete files using a simple and colorful dashboard.

The system provides a centralized place for managing personal files through a web application.

---

## 🎯 Problem Statement

Managing files on a personal computer can become difficult when there are many documents, images, videos, and other files.

Users need a simple system where they can:

- Store files
- View uploaded files
- Search files easily
- Download files when needed
- Delete unwanted files
- Access their files through a web interface
- Keep files separated between different users

This project provides a simple solution for these requirements.

---

## 💡 Proposed Solution

We developed a Cloud Based Media File Storage Service with a React frontend and Flask backend.

The application provides:

- User registration
- User login
- Secure JWT authentication
- File uploading
- File listing
- File downloading
- File deletion
- File search
- File category filtering
- Storage usage information
- Colorful and responsive dashboard

Each user's files are associated with their user account.

---

## ✨ Main Features

### 👤 User Registration

New users can create an account using:

- Name
- Email
- Password

### 🔐 User Login

Registered users can log in using their email and password.

After successful login, the application generates a JWT access token.

### 📤 File Upload

Users can upload files through the dashboard.

The uploaded file is:

1. Received by the Flask backend
2. Given a unique file name
3. Stored in the server's upload folder
4. File information is stored in the SQLite database

### 📁 My Files

Users can view the files they have uploaded.

The dashboard displays:

- File name
- File type
- File size
- File category

### 🔎 Search

Users can search for files by entering the file name.

### 🗂️ File Categories

Files are organized into categories such as:

- Documents
- Images
- Videos
- Audio
- Other files

### ⬇️ Download

Users can download their uploaded files whenever required.

### 🗑️ Delete

Users can delete unwanted files from their storage.

The file is removed from the server and its database record is also deleted.

### 📊 Storage Statistics

The dashboard displays information such as:

- Total number of files
- Total storage used
- Number of images
- Number of documents
- Number of videos

### 🎨 Modern Dashboard

The frontend contains:

- Colorful design
- Gradient backgrounds
- Animated elements
- Storage progress bar
- Responsive layout
- File search and filtering

---

## 🛠️ Technologies Used

### Frontend

- React.js
- Vite
- JavaScript
- HTML
- CSS
- Axios

### Backend

- Python
- Flask
- Flask-SQLAlchemy
- Flask-JWT-Extended
- Flask-CORS

### Database

- SQLite
- SQLAlchemy ORM

### Development Tools

- Visual Studio Code
- Git
- GitHub
- Postman

---

## 🏗️ Project Architecture

The project contains three main parts:

```text
User
  ↓
React Frontend
  ↓
Axios API Requests
  ↓
Flask Backend
  ↓
SQLAlchemy
  ↓
SQLite Database
  ↓
File Storage