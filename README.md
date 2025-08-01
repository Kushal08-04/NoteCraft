🔐 NOTE CRAFT – Secure Note-Taking Web Application   |   Presented by: Kushal Chaudhary   |   Authentication Powered by: IBM Cloud App ID

📌 Project Overview :::   NOTE CRAFT is a modern, full-stack note-taking web app that allows users to securely create, organize, and manage their personal notes and folders.
The application ensures that only authenticated users can access their notes, folders, calendar reminders, archive, and trash—thanks to robust authentication 
provided by IBM Cloud App ID. The app emphasizes a clean, minimalistic user experience while maintaining strict data protection.

🎯 Objectives

Design a visually modern, user-friendly notepad web application

Implement secure login using IBM Cloud App ID

Protect all note operations behind authenticated routes

Enable calendar-based reminder management

Provide dynamic folder and note creation, deletion, and archival

Offer seamless UX across all devices

🛠️ Tools & Technologies

Frontend:   HTML, CSS, JavaScript (Vanilla JS)

Backend:   Node.js, Express.js

Storage:   JSON file-based storage (notes.json & reminders.json)

Authentication:  IBM Cloud App ID
                 OAuth2 and OpenID Connect
                 IBM's WebAppStrategy with Passport.js

Development Tools:   Visual Studio Code, GitHub

Deployed on: Render

✅ Key Features : 

Secure login/logout using IBM Cloud App ID

Dynamic folder and note management with pastel UI

Calendar integration with reminder creation and deletion

Sidebar navigation (Add, Calendar, Archive, Trash)

Profile picture upload and display

Protected backend APIs (notes & reminders)

Responsive and minimal UI inspired by apps like Notion

🔁 Workflow

User opens NOTE CRAFT and clicks Login

Redirected to IBM App ID login page

Authenticates using email or social login (if configured)

Session is established and user is redirected back

User can now view, add, archive, or delete notes/folders/reminders

Calendar reminders are synced and editable

Logout clears the session securely

🌟 Future Enhancements

Move from JSON to cloud database (e.g., MongoDB or IBM Cloudant)

Real-time collaborative note editing

Push notification reminders

Role-based access control for shared notebooks

Full deployment on Render or Vercel

Integration with CI/CD pipelines for auto-deployments
