# Farmer one stop Solution: Next-Gen Agri-Tech Platform

##  Live Demo
[Check out Farmer Solutions](https://farmerones.vercel.app/) *

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Tech Stack](https://img.shields.io/badge/stack-MERN-blue)
![Real Time](https://img.shields.io/badge/real--time-Socket.io-orange)
![AI Powered](https://img.shields.io/badge/AI-Groq%20SDK-purple)

##  Overview

**Farmer Solutions** is a comprehensive digital ecosystem designed to empower farmers by bridging the gap between traditional agriculture and modern technology. It facilitates a seamless marketplace for selling produce, renting equipment, and accessing real-time agricultural insights.

Built with the **MERN Stack**, this application integrates **Real-time WebSockets**, **AI-powered assistance**, and **Secure Payments** to deliver a robust, enterprise-grade solution.

---

## Key Features

###  Marketplace & Commerce
*   **Authorised Sellers**: only authorized sellers which are approved by admin can sell their products like seeds,fertilizers,etc in Marketplace.
*   **Equipment Rental**: A peer-to-peer rental system for tractors and heavy machinery.
*   **Secure Checkout**: Integrated **Razorpay** payment gateway for seamless transactions.
*   **Invoice Generation**: Automated PDF invoicing using **jsPDF** for order records.

###  Real-Time Connectivity
*   **Equipment Bidding**: Live bidding system powered by **Socket.io**.
*   **Instant Chat**: Real-time messaging between farmers and equipment owners.
*   **Live Notifications**: Instant updates on order status and rental requests.

###  Smart Insights
*   **AI Assistant**: Powered by **Groq SDK**, offering 24/7 answers to farming queries.
*   **Weather Integration**: Real-time weather forecasts to help plan farming activities.


### Admin & Analytics
*   **Dashboard**: Comprehensive admin panel to manage users, products, and verification statuses.
*   **Seller Verification**: Robust approval workflow to ensure marketplace trust.
*   **Responsive Design**: Fully responsive UI built with **Tailwind CSS** for mobile and desktop.

---

## Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React, Framer Motion |
| **Backend** | Node.js, Express.js, Socket.io |
| **Database** | MongoDB (Mongoose ODM) |
| **Storage** | Cloudinary (Image Optimization) |
| **AI & API** | Groq SDK (LLM), Razorpay (Payments) |
| **DevOps** | Render (Backend), Vercel (Frontend), GitHub Actions |

---

## Architecture

The application follows a **Micro-services inspired Monolithic Architecture**:
*   **RESTful API**: Handles standard CRUD operations (Products, Orders, Auth).
*   **WebSocket Layer**: Dedicated event-driven layer for high-frequency updates (Chats, Bidding).
*   **MVC Pattern**: Clean code structure in the backend (Models, Views, Controllers).
*   **JWT Authentication**: Secure, stateless authentication for session management.

---

## Getting Started

Follow these steps to run the project locally.

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas URI)
*   Cloudinary Account
*   Razorpay Test Credentials

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/pj-prathmeshjanjale/FarmerSolutions.git
    cd FarmerSolutions
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    # Create .env file with your credentials (MONGO_URI, JWT_SECRET, etc.)
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    # Create .env file with VITE_API_URL=http://localhost:5000/api
    npm run dev
    ```

4.  **Access the App**
    *   Frontend: `http://localhost:5173`
    *   Backend: `http://localhost:5000`

---

## Contact & Portfolio

I am a Full Stack Developer passionate about building scalable, user-centric applications.

*   **Email**: [EMAIL_ADDRESS(prathmeshjanjalepj@gmail.com)]

---

*Made with ❤️ by Prathamesh Janjale*
