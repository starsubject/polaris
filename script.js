// Firebase Imports - These must be at the very top for module scripts
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";


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
                lastClaimedXP: Date.now() // Store last claim time in Firestore
            });
            console.log(`User ${userId} XP updated to ${currentXP + xpAmount}`);
        } else {
            // If user document doesn't exist, create it
            await setDoc(userRef, {
                xp: xpAmount,
                lastClaimedXP: Date.now(),
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


    // Re-attach listener for the moderator button, now that it's in the header
    const moderatorRoundsButton = document.getElementById('moderatorRoundsButtonHeader');
    if (moderatorRoundsButton) {
        moderatorRoundsButton.addEventListener('click', () => {
            alert('Moderator rounds are indeed open! Click OK to learn more.');
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
        if (!xpBonusSection || !claimXpBtn || !xpBonusMessage || !user) return; // Only run if elements exist and user is logged in

        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        const lastClaimTime = userDoc.exists() ? userDoc.data().lastClaimedXP : 0;

        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        if (lastClaimTime && (now - lastClaimTime < twentyFourHours)) {
            const timeLeft = twentyFourHours - (now - lastClaimTime);
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            xpBonusMessage.textContent = `Claim again in ${hours}h ${minutes}m.`;
            claimXpBtn.disabled = true;
            claimXpBtn.classList.add('disabled-button');
        } else {
            xpBonusMessage.textContent = `Claim your ${DAILY_XP_AMOUNT} XP bonus!`;
            claimXpBtn.disabled = false;
            claimXpBtn.classList.remove('disabled-button');
        }
    }


    if (claimXpBtn) {
        claimXpBtn.addEventListener('click', async () => {
            const user = auth.currentUser;
            if (!user) {
                alert('You must be logged in to claim XP!');
                return;
            }

            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            const lastClaimTime = userDoc.exists() ? userDoc.data().lastClaimedXP : 0;
            const now = Date.now();
            const twentyFourHours = 24 * 60 * 60 * 1000;

            if (lastClaimTime && (now - lastClaimTime < twentyFourHours)) {
                alert("You've already claimed your daily XP! Please wait.");
                return;
            }

            try {
                await updateUserXP(user.uid, DAILY_XP_AMOUNT);
                alert(`You claimed ${DAILY_XP_AMOUNT} XP!`);
                updateXpBonusStatus(user); // Update status immediately
            } catch (error) {
                alert(`Failed to claim XP: ${error.message}`);
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
                return alert("Both fields are lit, so fill them in!");
            }

            const email = username + customDomain;
            createUserWithEmailAndPassword(auth, email, password)
                .then(async (userCredential) => { // Made async to await profile update
                    alert("User registered successfully!");
                    if (userCredential.user) {
                         await userCredential.user.updateProfile({ displayName: username }); // Set display name immediately
                         // Also create a user document in Firestore for XP tracking
                         await setDoc(doc(db, "users", userCredential.user.uid), {
                             email: userCredential.user.email,
                             displayName: username,
                             xp: 0,
                             lastClaimedXP: 0, // Initialize last claimed time
                             createdAt: serverTimestamp()
                         });
                         console.log("Display name and user document set.");
                    }
                    window.location.href = 'index.html'; // Redirect to home after register
                })
                .catch((error) => {
                    alert(`Registration Error: ${error.message}`);
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
                return alert("Fill in both fields, fam.");
            }

            const email = username + customDomain;
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    alert("Login successful!");
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    alert(`Login Error: ${error.message}`);
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

    // Listener for authentication state changes (useful for settings page and chat)
    auth.onAuthStateChanged((user) => {
        // Handle settings page specific user info display
        if (window.location.pathname.endsWith('settings.html')) {
            if (user) {
                if (displayNameInput) displayNameInput.value = user.displayName || user.email.split('@')[0];
                if (emailDisplayInput) emailDisplayInput.value = user.email;
            } else {
                alert('You must be logged in to view settings.');
                window.location.href = 'test.html'; // Redirect to new login page
            }
        }

        // Handle Daily XP bonus status on test.html if user is logged in
        if (window.location.pathname.endsWith('test.html')) {
            if (user) {
                updateXpBonusStatus(user);
                // Set an interval to update the countdown
                // Ensure this interval is cleared if the user navigates away or logs out,
                // or consider a more robust state management if this becomes an issue.
                setInterval(() => updateXpBonusStatus(user), 60 * 1000); // Update every minute
            } else {
                // If not logged in on test.html, ensure XP bonus section is hidden or disabled
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
                    msgsEl.innerHTML = `<p>Doesn’t exist.</p>
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
                alert('You have been logged out.');
                window.location.href = 'test.html'; // Redirect to new login page
            }).catch((error) => {
                alert(`Logout Error: ${error.message}`);
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
                    alert('Profile updated successfully!');
                }).catch((error) => {
                    alert(`Error updating profile: ${error.message}`);
                });
            } else {
                alert('No user logged in or display name field not found.');
            }
        });
    }

    if (changePasswordBtn) {
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
            if (newPassword.length < 6) {
                alert('Password must be at least 6 characters long.');
                return;
            }

            user.updatePassword(newPassword).then(() => {
                alert('Password updated successfully!');
                newPasswordInput.value = '';
                confirmPasswordInput.value = '';
            }).catch((error) => {
                alert(`Error changing password: ${error.message}. You may need to log in again if your session is old.`);
            });
        });
    }
});