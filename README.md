# Chat UM 🚀

**Chat UM** is a full-stack, real-time messaging application inspired by modern communication platforms. It provides a seamless user experience with features like direct messaging, searchable public group chats, and real-time status updates.

This project is built with the MERN stack (MongoDB, Express, React, Node.js) and utilizes WebSockets for instant communication, ensuring a fast and responsive interface.

---

**Live Link:** [https://surya-kaliappan.github.io/chat-um](https://surya-kaliappan.github.io/chat-um)

---

## ✨ Key Features

* **Dual Chat Modes:** Engage in private **Direct Messaging (DM)** or join public **Group Chats**.

* **Search & Join:** Users can search for both DM contacts and public group chats by name.
* **Media Sharing:** Send text messages and various file types (zip, pdf, images, etc.) in both DMs and group chats.
* **Real-Time Functionality:**
    * **Live Messaging:** Messages appear instantly without needing to refresh the page, powered by Socket.IO.
    * **Online Status:** See real-time online/offline status indicators for users in your direct message contacts.
* **User Authentication:** Secure signup and login system using JWT, with user sessions stored in cookies for up to 3 days.
* **Detailed Messaging:**
    * Messages include timestamps and are grouped by date.
    * Group chat messages display sender details (profile, name, email).
    * Clickable user profiles in group chats to quickly initiate a direct message.

---

## 🔧 Technology Stack

* **Frontend:**

    * **React (via Vite):** A fast and modern toolchain for building the user interface.
    * **Zustand:** For lightweight global state management.
    * **Tailwind CSS:** For styling the user interface.
    * **Shadcn ui:** For structured Components.
    * **Socket.io-client:** For handling real-time WebSocket communication on the client side.
* **Backend:**
    * **Node.js & Express.js:** For the server-side application logic.
    * **Socket.IO:** For managing the real-time WebSocket server.
    * **Mongoose:** As an Object Data Modeler (ODM) for MongoDB.
    * **JSON Web Token (JWT):** For handling user authentication.
    * **Bcrypt:** For hashing user passwords.
    * **Multer:** For handling file uploads.
* **Database:**
    * **MongoDB:** A NoSQL database for storing all application data.

---

## ⚙️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### **Prerequisites**

Make sure you have the following installed on your system:
* [Node.js](https://nodejs.org/) (v18.x or higher)
* [npm](https://www.npmjs.com/) (Node Package Manager)
* [MongoDB](https://www.mongodb.com/) (running locally or a cloud instance like MongoDB Atlas)

### **Installation**

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/Surya-Kaliappan/chat-um.git
    cd chat-um
    ```

2.  **Install backend dependencies:**
    ```sh
    cd backend
    npm install
    ```

3.  **Install frontend dependencies:**
    ```sh
    cd ../frontend
    npm install
    ```

### **Environment Variables**

You will need to create a `.env` file in both the `backend` and `frontend` directories.

1.  **Backend (`server/.env`):**

    ```env
    PORT = 1234
    JWT_KEY = "your_super_secret_jwt_key"
    ORIGIN = "http://localhost:5173"
    DATABASE_URL = "mongodb://localhost:27017/chat-um"
    ```

2.  **Frontend (`client/.env`):**

    ```env
    VITE_SERVER_URL = "http://localhost:1234"
    ```

### **Running the Application**

You will need to run the frontend and backend servers in two separate terminals.

1. **Start the backend server:**

   From the `backend` directory, run:

    ```bash
    npm start
    ```

    The server should now be running on the port specified in your `.env` file.

2. **Start the frontend development server:**

    From the frontend directory, run:

    ```bash
    npm run dev
    ```
    
    The application should now be running. Open your browser and navigate to the local URL provided (e.g., http://localhost:5173).