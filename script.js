// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

// Your Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZxd9oql0a8y8fXe-z_6qfxRAqGQUsFIg",
  authDomain: "polaris-a273e.firebaseapp.com",
  projectId: "polaris-a273e",
  storageBucket: "polaris-a273e.firebasestorage.app",
  messagingSenderId: "677589636568",
  appId: "1:677589636568:web:bf1c0dbaa9ed1e337b4ead"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const customDomain = "@myapp.com"; // Change this to whatever fixed domain you prefer

// Ensure DOM is fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
    // --- Existing Polaris Website Functionality ---

    // Function to handle the "New: Moderator rounds are open!" button click
    const moderatorRoundsButton = document.getElementById('moderatorRoundsButton');
    if (moderatorRoundsButton) {
        moderatorRroundsButton.addEventListener('click', () => {
            alert('Moderator rounds are indeed open! Click OK to learn more.');
            window.location.href = 'new.html';
        });
    }

    // Example of dynamic content change: Welcome message
    const welcomeTextElement = document.querySelector('.app-card .app-header div h2');
    if (welcomeTextElement) {
        welcomeTextElement.textContent = 'Welcome to Polaris!';
    }

    // Function to add a new update to the "Recent updates" list
    function addNewUpdate(updateText) {
        const updatesList = document.getElementById('recentUpdatesList');
        if (updatesList) {
            const newListItem = document.createElement('li');
            newListItem.textContent = updateText;
            updatesList.appendChild(newListItem);
        }
    }

    // Example: Add a new update after a short delay
    setTimeout(() => {
        addNewUpdate('New feature: Discover Spaces section is now live!');
    }, 3000); // Adds the update after 3 seconds

    // Highlight the current page in the sidebar navigation
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.sidebar nav ul li a');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        // Handle both 'index.html' and root '/'
        if (currentPath === linkPath || (currentPath === '' && linkPath === 'index.html') || (currentPath === 'login.html' && linkPath === 'login.html')) {
            link.classList.add('active-nav-link');
        }
    });

    // --- Firebase Authentication Functionality (only for login.html or pages with these elements) ---

    const registerBtn = document.getElementById("registerBtn");
    const loginBtn = document.getElementById("loginBtn");

    if (registerBtn) { // Check if the button exists on the current page
        registerBtn.addEventListener("click", () => {
            const usernameInput = document.getElementById("username");
            const passwordInput = document.getElementById("password");

            // Ensure elements exist before trying to access their value
            if (!usernameInput || !passwordInput) {
                console.error("Username or password input field not found.");
                return;
            }

            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            if (!username || !password) {
                return alert("Both fields are lit, so fill them in!");
            }

            const email = username + customDomain;
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    alert("User registered successfully!");
                    // Optionally redirect or update UI
                })
                .catch((error) => {
                    alert(`Registration Error: ${error.message}`);
                });
        });
    }

    if (loginBtn) { // Check if the button exists on the current page
        loginBtn.addEventListener("click", () => {
            const usernameInput = document.getElementById("username");
            const passwordInput = document.getElementById("password");

            if (!usernameInput || !passwordInput) {
                console.error("Username or password input field not found.");
                return;
            }

            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            if (!username || !password) {
                return alert("Fill in both fields, fam.");
            }

            const email = username + customDomain;
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    alert("Login successful!");
                    // Redirect to home page or dashboard after successful login
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    alert(`Login Error: ${error.message}`);
                });
        });
    }
});