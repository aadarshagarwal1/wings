# Wings

Wings is a coaching institute management website with role-based access for admins, teachers, and students to manage classes, track attendance, and share learning resources.

This was a personal project built to help reduce the manual work involved in the day-to-day operations of a coaching institute.

## 📖 Table of Contents

* [Features](#-features)
* [Built With](#️-built-with)
* [Getting Started](#-getting-started)

---

## ✨ Features

* **Role-Based Access:** Separate logins and dashboards for Admins, Teachers, and Students.
* **Admin Dashboard:**
    * Create and manage teacher and student accounts.
    * Create classes and assign teachers/students.
    * Monitor attendance for all classes.
    * Upload and manage learning resources (video links, PDFs).
* **Teacher Dashboard:**
    * Take attendance for their assigned classes.
    * Monitor attendance records for their students.
    * Upload and manage learning resources.
* **Student Dashboard:**
    * View their current attendance status.
    * Access all learning resources shared by admins and teachers.

---

## 🛠️ Built With

* **Frontend:** [Next.js](https://nextjs.org/)
* **UI:** [Shadcn/UI](https://ui.shadcn.com/)
* **Backend:** [Node.js](https://nodejs.org/en)
* **Database:** [MongoDB](https://www.mongodb.com/)
* **Authentication:** [JSON Web Tokens (JWT)](https://jwt.io/)

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You must have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18 or later recommended)
* [npm](https://www.npmjs.com/) (which comes with Node.js)
* A running **MongoDB** instance (locally or on a cloud service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/aadarshagarwal1/wings.git](https://github.com/aadarshagarwal1/wings.git)
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd wings
    ```
3.  **Install npm packages:**
    ```sh
    npm install
    ```
4.  **Set up environment variables:**
    Create a file named `.env.local` in the root of the project and add your environment variables:
    ```
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_key_for_jwt
    ```
5.  **Run the development server:**
    ```sh
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the running application.
