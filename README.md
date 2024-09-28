RTSP Video Streaming App with Custom Overlays
This project provides a full-stack solution for streaming RTSP video and managing custom overlays using Python (Flask), React, and MongoDB.

Getting Started
This project was bootstrapped with Create React App.

Prerequisites
Ensure you have the following installed:

Node.js: Install Node.js
MongoDB: MongoDB Installation Guide
Python (with Flask): Flask Installation Guide
Setup
Clone the repository:
bash
Copy code
git clone https://github.com/gangeswaran/RTSP_fullStack
cd RTSP_fullStack
Install frontend dependencies:
bash
Copy code
cd frontend
npm install
Install backend dependencies:
bash
Copy code
cd backend
pip install -r requirements.txt
Start the MongoDB server:
Ensure your MongoDB server is running locally or remotely.

Run the backend server:
bash
Copy code
cd backend
flask run
Run the frontend app:
bash
Copy code
cd frontend
npm start
Open http://localhost:3000 to view the app in the browser.

Features
RTSP Stream: View live video streams using RTSP.
Overlay Management: Add, edit, delete custom overlays (texts, images) on the video stream.
CRUD Operations: Fully functional API to manage overlays.
Available Scripts (Frontend)
In the frontend directory, you can run the following commands:

npm start
Runs the app in development mode at http://localhost:3000.
The page will automatically reload when you make changes.

npm run build
Builds the app for production, optimizing the build for best performance.

npm run eject
Ejects the project configuration to allow deeper customization. Use this carefully as it’s a one-way operation.

Overlay Management API
The app provides a CRUD API for managing overlays. Here’s a brief on the API endpoints:

GET /overlays: Retrieve all overlays.
POST /overlays: Create a new overlay.
PUT /overlays/
: Update an existing overlay.
DELETE /overlays/
: Delete an overlay.
For more details, refer to the API documentation in the project.

Input RTSP URL
When you launch the app, you'll be prompted to enter an RTSP URL to stream video from. The URL should be in the format:

php
Copy code
rtsp://<username>:<password>@<camera-ip>:<port>/<stream-path>
Customizing Overlays
You can position and manage overlays directly through the UI. Each overlay can be customized with text, images, and its position on the video stream.

Learn More
For detailed documentation, you can refer to the following resources:

Create React App Documentation
Flask Documentation
MongoDB Documentation
This README provides a more detailed description of how to set up and use the RTSP video streaming app. Feel free to adjust it based on additional requirements or features.
