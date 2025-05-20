// Firebase Imports - These must be at the very top for module scripts
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { getDocs } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js"; // Added getDocs for discover page

// Your Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZxd9oql0a8y8fXe-z_6qfxRAqGQUsFIg", // REPLACE WITH YOUR ACTUAL API KEY
  authDomain: "polaris-a273e.firebaseapp.com",
  projectId: "polaris-a273e",
  storageBucket: "polaris-a273e.firebasestorage.app",
  messagingSenderId: "677589636568",
  appId: "1:677589636568:web:bf1c0dbaa9ed1e337b4ead"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore
const customDomain = "@polarisapp.com"; // Consider a more descriptive domain for your app

// Constants for Daily XP
const DAILY_XP_AMOUNT = 50;


// --- Popup Functions ---
let popupOverlay;
let popupBox;
let popupTitle;
let popupMessage;
let popupButton;

function initializePopupElements() {
    if (!popupOverlay) {
        popupOverlay = document.createElement('div');
        popupOverlay.id = 'custom-popup-overlay';
        popupOverlay.classList.add('hidden'); // Start hidden
        document.body.appendChild(popupOverlay);

        popupBox = document.createElement('div');
        popupBox.id = 'custom-popup-box';
        popupOverlay.appendChild(popupBox);

        popupTitle = document.createElement('h3');
        popupTitle.id = 'custom-popup-title';
        popupBox.appendChild(popupTitle);

        popupMessage = document.createElement('p');
        popupMessage.id = 'custom-popup-message';
        popupBox.appendChild(popupMessage);

        popupButton = document.createElement('button');
        popupButton.id = 'custom-popup-button';
        popupButton.textContent = 'OK';
        popupBox.appendChild(popupButton);

        // Event listener for closing the popup
        popupButton.addEventListener('click', hidePopup);
        popupOverlay.addEventListener('click', (event) => {
            if (event.target === popupOverlay) { // Close if clicked outside the box
                hidePopup();
            }
        });
    }
}

function showPopup(message, title = "Polaris Notification") {
    initializePopupElements(); // Ensure elements are ready
    popupTitle.textContent = title;
    popupMessage.textContent = message;
    // Use the 'show' class for animation
    popupOverlay.classList.remove('hidden');
    popupOverlay.classList.add('show');
}

function hidePopup() {
    if (popupOverlay) {
        // Use the 'hidden' class for animation
        popupOverlay.classList.remove('show');
        popupOverlay.classList.add('hidden');
    }
}


// Helper function to update user XP in Firestore
async function updateUserXP(userId, xpAmount) {
    if (!userId) {
        console.warn("Attempted to update XP for null user ID.");
        return;
    }
    const userRef = doc(db, "users", userId);
    try {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const currentXP = userDoc.data().xp || 0;
            await updateDoc(userRef, {
                xp: currentXP + xpAmount,
                // Store Date.now() as a number for easier comparison
                lastClaimedXP: Date.now()
            });
            console.log(`User ${userId} XP updated to ${currentXP + xpAmount}`);
        } else {
            // If user document doesn't exist, create it
            await setDoc(userRef, {
                xp: xpAmount,
                lastClaimedXP: Date.now(), // Initialize last claimed time as a number
                createdAt: serverTimestamp()
            });
            console.log(`New user ${userId} created with ${xpAmount} XP.`);
        }
    } catch (error) {
        console.error("Error updating user XP:", error);
        throw error; // Re-throw to allow calling function to catch
    }
}


// --- Common HTML Structure for Header and Footer (will be dynamically inserted) ---

const commonHeaderHTML = `
    <header class="main-header">
        <a href="index.html" class="header-logo">Polaris</a>
        <nav class="header-nav">
            <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="discover.html">Discover Spaces</a></li>
                <li><a href="test.html">Login</a></li>
                <li><a href="settings.html">Settings</a></li>
            </ul>
        </nav>
        <button id="moderatorRoundsButtonHeader" class="header-button">New: Moderator rounds open!</button>
    </header>
`;

const commonFooterHTML = `
    <footer class="main-footer">
        <p>&copy; 2025 Polaris. Made by 3 passionate people.</p>
        <div class="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Support</a>
        </div>
    </footer>
`;


// --- DOM Content Loaded Event Listener ---
document.addEventListener('DOMContentLoaded', () => {

    // Dynamically inject header and footer into all pages
    document.body.insertAdjacentHTML('afterbegin', commonHeaderHTML);
    document.body.insertAdjacentHTML('beforeend', commonFooterHTML);

    initializePopupElements(); // Initialize popup elements after injecting header/footer


    // Re-attach listener for the moderator button, now that it's in the header
    const moderatorRroundsButton = document.getElementById('moderatorRoundsButtonHeader');
    if (moderatorRroundsButton) {
        moderatorRroundsButton.addEventListener('click', () => {
            showPopup('Moderator rounds are indeed open! Click OK to learn more.', 'Important Announcement');
            window.location.href = 'new.html'; // Redirect to the 'new.html' page
        });
    }

    // Example of dynamic content change: Welcome message on index.html
    const welcomeTextElement = document.querySelector('.app-card .app-header div h2');
    if (welcomeTextElement) {
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

    const recentUpdatesList = document.getElementById('recentUpdatesList');
    if (recentUpdatesList) {
        setTimeout(() => {
            addNewUpdate('New feature: Discover Spaces section is now live!');
        }, 3000);
    }

    // Highlight the current page in the header navigation
    const currentPath = window.location.pathname.split('/').pop();
    const headerNavLinks = document.querySelectorAll('.header-nav ul li a');

    headerNavLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        // Handle both 'index.html' and root '/'
        if (currentPath === linkPath || (currentPath === '' && linkPath === 'index.html')) {
            link.classList.add('active-nav-link');
        }
    });


    // --- Firebase Authentication Functionality (for test.html and settings.html) ---

    // Login/Register Buttons (on test.html)
    const registerBtn = document.getElementById("registerBtn");
    const loginBtn = document.getElementById("loginBtn");
    const xpBonusSection = document.getElementById("xpBonusSection");
    const claimXpBtn = document.getElementById("claimXpBtn");
    const xpBonusMessage = document.getElementById("xpBonusMessage");

    // Function to check and display XP bonus status
    async function updateXpBonusStatus(user) {
        if (!xpBonusSection || !claimXpBtn || !xpBonusMessage) {
            // If the elements don't exist, we can't update status
            return;
        }

        if (!user) {
            // If user is not logged in, hide the XP section
            xpBonusSection.style.display = 'none';
            return;
        }

        // If user is logged in, ensure XP section is visible
        xpBonusSection.style.display = 'block';

        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        // Ensure lastClaimedXP is treated as a number
        const lastClaimTime = userDoc.exists() ? (userDoc.data().lastClaimedXP || 0) : 0;

        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        if (lastClaimTime && (now - lastClaimTime < twentyFourHours)) {
            const timeLeft = twentyFourHours - (now - lastClaimTime);
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            xpBonusMessage.textContent = `Claim again in ${hours}h ${minutes}m.`;
            claimXpBtn.disabled = true; // Use disabled attribute directly
        } else {
            xpBonusMessage.textContent = `Claim your ${DAILY_XP_AMOUNT} XP bonus!`;
            claimXpBtn.disabled = false; // Use disabled attribute directly
        }
    }


    if (claimXpBtn) {
        claimXpBtn.addEventListener('click', async () => {
            const user = auth.currentUser;
            if (!user) {
                showPopup('You must be logged in to claim XP!', 'Login Required');
                return;
            }

            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            const lastClaimTime = userDoc.exists() ? (userDoc.data().lastClaimedXP || 0) : 0;
            const now = Date.now();
            const twentyFourHours = 24 * 60 * 60 * 1000;

            if (lastClaimTime && (now - lastClaimTime < twentyFourHours)) {
                showPopup("You've already claimed your daily XP! Please wait.", 'Daily XP Bonus');
                return;
            }

            try {
                await updateUserXP(user.uid, DAILY_XP_AMOUNT);
                showPopup(`You claimed ${DAILY_XP_AMOUNT} XP!`, 'Daily XP Claimed');
                updateXpBonusStatus(user); // Update status immediately
            } catch (error) {
                showPopup(`Failed to claim XP: ${error.message}`, 'XP Claim Error');
                console.error("XP Claim Error:", error);
            }
        });
    }

    if (registerBtn) {
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
                return showPopup("Both fields are lit, so fill them in!", "Missing Information");
            }

            const email = username + customDomain;
            createUserWithEmailAndPassword(auth, email, password)
                .then(async (userCredential) => { // Made async to await profile update
                    showPopup("User registered successfully!", "Registration Success");
                    if (userCredential.user) {
                         await userCredential.user.updateProfile({ displayName: username }); // Set display name immediately
                         // Also create a user document in Firestore for XP tracking
                         await setDoc(doc(db, "users", userCredential.user.uid), {
                             email: userCredential.user.email,
                             displayName: username,
                             xp: 0,
                             lastClaimedXP: 0, // Initialize last claimed time as a number
                             createdAt: serverTimestamp()
                         });
                         console.log("Display name and user document set.");
                    }
                    window.location.href = 'index.html'; // Redirect to home after register
                })
                .catch((error) => {
                    showPopup(`Registration Error: ${error.message}`, "Registration Failed");
                });
        });
    }

    if (loginBtn) {
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
                return showPopup("Fill in both fields, fam.", "Missing Information");
            }

            const email = username + customDomain;
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    showPopup("Login successful!", "Login Success");
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    showPopup(`Login Error: ${error.message}`, "Login Failed");
                });
        });
    }

    // Settings Page Functionality (Logout, Profile Update, etc. - on settings.html)
    const logoutBtn = document.getElementById('logoutBtn');
    const displayNameInput = document.getElementById('displayName');
    const emailDisplayInput = document.getElementById('emailDisplay');
    const saveSettingsBtn = document.querySelector('.save-settings-btn');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const changePasswordBtn = document.querySelector('.change-password-btn');

    let xpInterval; // Declare it here to be accessible within auth.onAuthStateChanged and logoutBtn

    // Listener for authentication state changes (useful for settings page and chat)
    auth.onAuthStateChanged((user) => {
        // Handle settings page specific user info display
        if (window.location.pathname.endsWith('settings.html')) {
            if (user) {
                if (displayNameInput) displayNameInput.value = user.displayName || user.email.split('@')[0];
                if (emailDisplayInput) emailDisplayInput.value = user.email;
            } else {
                showPopup('You must be logged in to view settings.', 'Access Denied');
                window.location.href = 'test.html'; // Redirect to new login page
            }
        }

        // Handle Daily XP bonus status on test.html if user is logged in
        if (window.location.pathname.endsWith('test.html')) {
            if (xpInterval) { // Clear any existing interval
                clearInterval(xpInterval);
                xpInterval = null; // Reset it
            }

            if (user) {
                updateXpBonusStatus(user);
                xpInterval = setInterval(() => updateXpBonusStatus(user), 60 * 1000); // Update every minute
            } else {
                // User logged out on test.html, hide the XP section
                if (xpBonusSection) xpBonusSection.style.display = 'none';
            }
        }


        // Handle chat.html user info and messages
        if (window.location.pathname.endsWith('chat.html')) {
            const userEl = document.getElementById("chatUsername"); // New ID for chat username display
            const listEl = document.getElementById("channelList");
            const msgsEl = document.getElementById("messages");
            const titleEl= document.getElementById("chatTitle");
            const input  = document.getElementById("messageInput");
            const sendBtn= document.getElementById("sendBtn");

            const p          = new URLSearchParams(location.search);
            const community  = (p.get("community")||"").toLowerCase();
            const reqChannel = (p.get("channel")  ||"").toLowerCase();

            if (!user) {
                showPopup('You must be logged in to access chat.', 'Access Denied');
                location.href = "test.html"; // Redirect to login if not authenticated
                return;
            }

            userEl.innerText = user.displayName || user.email.split("@")[0]; // Use display name or email

            if (!community) {
                titleEl.innerText = "No community selected.";
                msgsEl.innerHTML = `<p>Select a community.</p>
                  <button onclick="location.href='discover.html'">Discover</button>`;
                return;
            }

            const ref = doc(db,"chats",community);
            getDoc(ref).then(async snap => {
                if (!snap.exists()) {
                    titleEl.innerText = `Community "${community}" not found.`;
                    msgsEl.innerHTML = `<p>Doesnâ€™t exist.</p>
                      <button onclick="location.href='discover.html'">Discover</button>`;
                    return;
                }

                // ensure this channel is recorded
                // Note: The 'channels' subcollection approach in your HTML script was a bit unusual.
                // A simpler way for a chat app is to have a 'channels' array within the community document.
                // If you intend to have separate channel documents in a subcollection, the structure
                // in your original chat.html was fine for reading them, but `arrayUnion` on the
                // `chats` document updates a field in that document, not a subcollection.
                // For simplicity here, I'm assuming 'channels' is an array field on the community doc.
                await updateDoc(ref, { channels: arrayUnion(reqChannel) });

                const updated = await getDoc(ref);
                const data = updated.data();
                const channels = Array.isArray(data.channels)
                  ? data.channels.map(c=>c.toLowerCase())
                  : [];

                if (!channels.length) {
                    titleEl.innerText = `${community} (no channels)`;
                    msgsEl.innerHTML = `<p>No channels.</p>`;
                    return;
                }

                const channel = channels.includes(reqChannel) ? reqChannel : channels[0];

                listEl.innerHTML = "";
                channels.forEach(ch => {
                    const li = document.createElement("li");
                    const a  = document.createElement("a");
                    a.href        = `chat.html?community=${community}&channel=${ch}`;
                    a.textContent = `# ${ch}`;
                    if (ch === channel) { // Highlight active channel
                        a.classList.add('active-channel-link');
                    }
                    li.appendChild(a);
                    listEl.appendChild(li);
                });

                titleEl.innerText = `#${channel} in ${community}`;
                // Now, query the actual messages subcollection
                const messagesCollectionRef = collection(db, "chats", community, channel);
                const q = query(messagesCollectionRef, orderBy("timestamp","asc"));
                onSnapshot(q, s => {
                    msgsEl.innerHTML = "";
                    s.forEach(d => {
                        const m = d.data();
                        const t = m.timestamp?.toDate().toLocaleTimeString()||"";
                        const senderName = m.sender || 'Anonymous';
                        const div = document.createElement("div");
                        div.className = "message-item";
                        div.innerHTML = `<span class="message-sender">${senderName}</span> <span class="message-time">[${t}]</span>: <span class="message-content">${m.content}</span>`;
                        msgsEl.appendChild(div);
                    });
                    msgsEl.scrollTop = msgsEl.scrollHeight;
                });

                sendBtn.onclick = async () => {
                    const txt = input.value.trim();
                    if (!txt) return;
                    await addDoc(collection(db,"chats",community,channel),{
                        content: txt,
                        sender: user.displayName || user.email.split("@")[0],
                        timestamp: serverTimestamp()
                    });
                    input.value = "";
                };
                input.onkeydown = e => { if(e.key==="Enter") sendBtn.click(); };
            }).catch(error => {
                console.error("Error loading chat community:", error);
                showPopup(`Error loading community: ${error.message}`, 'Chat Error');
                titleEl.innerText = "Error loading community.";
                msgsEl.innerHTML = `<p>An error occurred: ${error.message}</p>`;
            });
        }

        // Discover page community loading
        if (window.location.pathname.endsWith('discover.html')) {
            const grid = document.getElementById("communityGrid");
            if (grid) {
                async function loadCommunities() {
                    const communitiesSnap = await getDocs(collection(db, "chats"));
                    grid.innerHTML = ''; // Clear previous content if any

                    if (communitiesSnap.empty) {
                        grid.innerHTML = '<p>No communities found yet. Be the first to create one!</p>';
                        return;
                    }

                    for (const community of communitiesSnap.docs) {
                        const communityId = community.id;
                        // For simplicity, we're assuming a 'channels' subcollection for all chats
                        const channelsRef = collection(db, "chats", communityId, "channels"); // This was meant to be a subcollection of channels
                        const channelsSnap = await getDocs(channelsRef);

                        // Only display if there's at least one channel for the community
                        if (!channelsSnap.empty) {
                            const firstChannel = channelsSnap.docs[0].id; // Get the ID of the first channel

                            const card = document.createElement("div");
                            card.className = "app-card space-card";
                            card.innerHTML = `
                                <div class="app-header">
                                <img src="https://via.placeholder.com/60/3c5b8e/ffffff?text=${communityId.charAt(0).toUpperCase()}" alt="${communityId}" class="app-icon">
                                <div>
                                    <h2 style="margin: 0;">${communityId}</h2>
                                    <p style="margin: 0; font-size: 0.9rem; color: #ccc;">
                                    A growing educational space for curious minds.
                                    </p>
                                </div>
                                </div>
                                <p>Channels: ${channelsSnap.size}</p>
                                <div class="tags">
                                <span class="tag">Community</span>
                                <span class="tag">Chat</span>
                                <span class="tag">Explore</span>
                                </div>
                                <button class="join-space-btn" onclick="location.href='chat.html?community=${communityId}&channel=${firstChannel}'">Join Space</button>
                            `;
                            grid.appendChild(card);
                        }
                    }
                }
                loadCommunities();
            }
        }
    });


    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            signOut(auth).then(() => {
                showPopup('You have been logged out.', 'Logged Out');
                window.location.href = 'test.html'; // Redirect to new login page
                if (xpInterval) { // Clear interval on logout
                    clearInterval(xpInterval);
                    xpInterval = null;
                }
            }).catch((error) => {
                showPopup(`Logout Error: ${error.message}`, 'Logout Failed');
            });
        });
    }

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            const user = auth.currentUser;
            if (user && displayNameInput) {
                const newDisplayName = displayNameInput.value.trim();
                user.updateProfile({
                    displayName: newDisplayName
                }).then(() => {
                    showPopup('Profile updated successfully!', 'Profile Update');
                }).catch((error) => {
                    showPopup(`Error updating profile: ${error.message}`, 'Profile Update Failed');
                });
            } else {
                showPopup('No user logged in or display name field not found.', 'Error');
            }
        });
    }

    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            const user = auth.currentUser;
            if (!user) {
                showPopup('No user logged in.', 'Error');
                return;
            }

            if (!newPasswordInput || !confirmPasswordInput) {
                console.error("New password or confirm password input field not found.");
                return;
            }

            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (newPassword !== confirmPassword) {
                showPopup('New passwords do not match!', 'Password Mismatch');
                return;
            }
            if (newPassword.length < 6) {
                showPopup('Password must be at least 6 characters long.', 'Password Too Short');
                return;
            }

            user.updatePassword(newPassword).then(() => {
                showPopup('Password updated successfully!', 'Password Change');
                newPasswordInput.value = '';
                confirmPasswordInput.value = '';
            }).catch((error) => {
                showPopup(`Error changing password: ${error.message}. You may need to log in again if your session is old.`, 'Password Change Failed');
            });
        });
    }
});