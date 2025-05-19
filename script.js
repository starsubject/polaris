// Firebase Imports - These must be at the very top for module scripts
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

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
const customDomain = "@polarisapp.com"; // Consider a more descriptive domain for your app

// Ensure DOM is fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {

    // --- General Polaris Website Functionality (Applies to all pages with sidebar) ---

    // Function to handle the "New: Moderator rounds are open!" button click
    const moderatorRoundsButton = document.getElementById('moderatorRoundsButton');
    if (moderatorRoundsButton) {
        moderatorRoundsButton.addEventListener('click', () => {
            alert('Moderator rounds are indeed open! Click OK to learn more.');
            window.location.href = 'new.html'; // Redirect to the 'new.html' page
        });
    }

    // Example of dynamic content change: Welcome message on index.html
    const welcomeTextElement = document.querySelector('.app-card .app-header div h2');
    if (welcomeTextElement) {
        // You could personalize this if a user was logged in, for example:
        // if (auth.currentUser) { welcomeTextElement.textContent = `Welcome, ${auth.currentUser.displayName || auth.currentUser.email.split('@')[0]}!`; }
        welcomeTextElement.textContent = 'Welcome to Polaris!';
    }

    // Function to add a new update to the "Recent updates" list on index.html
    function addNewUpdate(updateText) {
        const updatesList = document.getElementById('recentUpdatesList');
        if (updatesList) {
            const newListItem = document.createElement('li');
            newListItem.textContent = updateText;
            updatesList.appendChild(newListItem);
        }
    }

    // Example: Add a new update after a short delay on index.html
    // This will only run if an element with ID 'recentUpdatesList' exists
    const recentUpdatesList = document.getElementById('recentUpdatesList');
    if (recentUpdatesList) {
        setTimeout(() => {
            addNewUpdate('New feature: Discover Spaces section is now live!');
        }, 3000); // Adds the update after 3 seconds
    }


    // Highlight the current page in the sidebar navigation
    const currentPath = window.location.pathname.split('/').pop(); // Gets 'index.html', 'login.html', etc.
    const navLinks = document.querySelectorAll('.sidebar nav ul li a');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        // Handle both 'index.html' and root '/'
        if (currentPath === linkPath || (currentPath === '' && linkPath === 'index.html')) {
            link.classList.add('active-nav-link'); // Add a class to highlight the current page
        }
    });


    // --- Firebase Authentication Functionality (for login.html and settings.html) ---

    // Login/Register Buttons (typically on login.html)
    const registerBtn = document.getElementById("registerBtn");
    const loginBtn = document.getElementById("loginBtn");

    if (registerBtn) { // Check if the register button exists on the current page
        registerBtn.addEventListener("click", () => {
            const usernameInput = document.getElementById("username");
            const passwordInput = document.getElementById("password");

            if (!usernameInput || !passwordInput) {
                console.error("Username or password input field not found for registration.");
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
                    // Signed in
                    alert("User registered successfully!");
                    // Optionally redirect to a dashboard or confirm registration
                    // window.location.href = 'index.html';
                })
                .catch((error) => {
                    alert(`Registration Error: ${error.message}`);
                });
        });
    }

    if (loginBtn) { // Check if the login button exists on the current page
        loginBtn.addEventListener("click", () => {
            const usernameInput = document.getElementById("username");
            const passwordInput = document.getElementById("password");

            if (!usernameInput || !passwordInput) {
                console.error("Username or password input field not found for login.");
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
                    // Signed in
                    alert("Login successful!");
                    window.location.href = 'index.html'; // Redirect to home page after successful login
                })
                .catch((error) => {
                    alert(`Login Error: ${error.message}`);
                });
        });
    }

    // Settings Page Functionality (Logout, Profile Update, etc. - typically on settings.html)
    const logoutBtn = document.getElementById('logoutBtn');
    const displayNameInput = document.getElementById('displayName');
    const emailDisplayInput = document.getElementById('emailDisplay');
    const saveSettingsBtn = document.querySelector('.save-settings-btn');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const changePasswordBtn = document.querySelector('.change-password-btn');

    // Listener for authentication state changes (useful for settings page)
    auth.onAuthStateChanged((user) => {
        if (window.location.pathname.endsWith('settings.html')) {
            if (user) {
                // User is signed in, populate fields
                if (displayNameInput) displayNameInput.value = user.displayName || user.email.split('@')[0];
                if (emailDisplayInput) emailDisplayInput.value = user.email;
            } else {
                // User is not signed in, redirect to login page
                alert('You must be logged in to view settings.');
                window.location.href = 'login.html';
            }
        }
    });


    if (logoutBtn) { // Check if the logout button exists on the current page
        logoutBtn.addEventListener('click', () => {
            signOut(auth).then(() => {
                alert('You have been logged out.');
                window.location.href = 'login.html'; // Redirect to login page after logout
            }).catch((error) => {
                alert(`Logout Error: ${error.message}`);
            });
        });
    }

    if (saveSettingsBtn) { // Check if save profile button exists
        saveSettingsBtn.addEventListener('click', () => {
            const user = auth.currentUser;
            if (user && displayNameInput) {
                const newDisplayName = displayNameInput.value.trim();
                user.updateProfile({
                    displayName: newDisplayName
                }).then(() => {
                    alert('Profile updated successfully!');
                }).catch((error) => {
                    alert(`Error updating profile: ${error.message}`);
                });
            } else {
                alert('No user logged in or display name field not found.');
            }
        });
    }

    if (changePasswordBtn) { // Check if change password button exists
        changePasswordBtn.addEventListener('click', () => {
            const user = auth.currentUser;
            if (!user) {
                alert('No user logged in.');
                return;
            }

            if (!newPasswordInput || !confirmPasswordInput) {
                console.error("New password or confirm password input field not found.");
                return;
            }

            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (newPassword !== confirmPassword) {
                alert('New passwords do not match!');
                return;
            }
            if (newPassword.length < 6) { // Firebase requires a minimum of 6 characters for passwords
                alert('Password must be at least 6 characters long.');
                return;
            }

            

            user.updatePassword(newPassword).then(() => {
                alert('Password updated successfully!');
                newPasswordInput.value = ''; // Clear fields
                confirmPasswordInput.value = '';
            }).catch((error) => {
                alert(`Error changing password: ${error.message}. You may need to log in again if your session is old.`);
            });
        });
    }

    // --- End of all functionality ---
});