// --- Initialize Firebase ---
// This uses the firebaseConfig object from conf.js
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const analytics = firebase.analytics();

console.log("Firebase Initialized Successfully");


// --- Firebase Logic Functions (Now with real Firebase code) ---

/**
 * Handles user login using Firebase Auth.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 */
async function handleLogin(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        if (user.emailVerified) {
            console.log("User logged in successfully:", user.uid);
            // On success, you would typically redirect the user to the main app page.
            // For now, we'll show a success message.
            window.location.href = 'dashboard.html'; // Example redirect
        } else {
            // If the email is not verified, prevent login.
            showNotification('Login Failed', 'Please verify your email address before logging in. Check your inbox for a verification link.', 'fa-envelope', 'var(--primary-color)');
            auth.signOut(); // Sign out the user until they verify.
        }
    } catch (error) {
        console.error("Firebase Login Error:", error.code, error.message);
        let friendlyMessage = "An error occurred during login. Please try again.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            friendlyMessage = "Invalid email or password. Please check your credentials and try again.";
        }
        showNotification('Login Failed', friendlyMessage, 'fa-circle-xmark', '#dc3545');
    }
}


/**
 * Handles new patient registration using Firebase Auth.
 * @param {string} email - The patient's email.
 * @param {string} password - The patient's chosen password.
 */
async function handlePatientRegister(email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log("Patient account created, sending verification email...");
        
        // Send verification email
        await userCredential.user.sendEmailVerification();
        
        showNotification(
            'Registration Successful!',
            'Your account has been created. A verification link has been sent to your email. Please check your inbox to activate your account.'
        );
        auth.signOut(); // Sign out until they verify
    } catch (error) {
        console.error("Firebase Registration Error:", error.code, error.message);
        let friendlyMessage = "Couldn't create your account. Please try again.";
        if (error.code === 'auth/email-already-in-use') {
            friendlyMessage = "An account with this email address already exists. Please try logging in.";
        } else if (error.code === 'auth/weak-password') {
            friendlyMessage = "The password is too weak. It should be at least 6 characters long.";
        }
        showNotification('Registration Failed', friendlyMessage, 'fa-circle-xmark', '#dc3545');
    }
}

/**
 * Handles new hospital registration (placeholder).
 * In a real app, this would also save hospital details to a Firestore database for admin approval.
 * @param {string} email - The hospital contact's email.
 * @param {string} password - The hospital contact's password.
 */
async function handleHospitalRegister(email, password) {
    // For now, this follows the same logic as patient registration.
    // In a full application, you would add logic here to save hospital-specific data
    // to your Firestore database for an admin to review and approve.
    await handlePatientRegister(email, password); // Re-using the same auth logic for now
}

/**
 * Handles password reset request using Firebase Auth.
 * @param {string} email - The user's email to send the reset link to.
 */
async function handlePasswordReset(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        showNotification(
            'Reset Link Sent',
            'If an account with that email exists, a password reset link has been sent. Please check your inbox.',
            'fa-paper-plane'
        );
    } catch (error) {
        console.error("Firebase Password Reset Error:", error.code, error.message);
        // We show the same success message even on failure to prevent email enumeration attacks.
        showNotification(
            'Reset Link Sent',
            'If an account with that email exists, a password reset link has been sent. Please check your inbox.',
            'fa-paper-plane'
        );
    }
}


// --- DOM Event Listeners & UI Logic (No changes needed below this line) ---
document.addEventListener('DOMContentLoaded', function() {
    
    // --- Element Selections ---
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    const forgotPasswordCard = document.getElementById('forgot-password-card');
    
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const backToLoginLink = document.getElementById('back-to-login-link');

    // --- Card Switching Logic ---
    function showCard(cardToShow) {
        loginCard.classList.add('d-none');
        registerCard.classList.add('d-none');
        forgotPasswordCard.classList.add('d-none');
        cardToShow.classList.remove('d-none');
    }

    showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); showCard(registerCard); });
    showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showCard(loginCard); });
    forgotPasswordLink.addEventListener('click', (e) => { e.preventDefault(); showCard(forgotPasswordCard); });
    backToLoginLink.addEventListener('click', (e) => { e.preventDefault(); showCard(loginCard); });

    // --- Hide/Show Password Logic ---
    document.querySelectorAll('.toggle-password').forEach(iconEl => {
        iconEl.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const icon = this.querySelector('i');
if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    });

    // --- Notification Modal Logic ---
    const notificationModal = new bootstrap.Modal(document.getElementById('notificationModal'));
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalIcon = document.getElementById('modalIcon');
    
    window.showNotification = function(title, message, iconClass = 'fa-circle-check', iconColor = 'var(--success-color)') {
        modalTitle.textContent = title;
        modalBody.textContent = message;
        modalIcon.className = `fas ${iconClass} fa-4x`;
        modalIcon.style.color = iconColor;
        notificationModal.show();
    }
    
    // --- Form Submission Logic ---
    const loginForm = document.getElementById('login-form');
    const patientRegForm = document.getElementById('patient-register-form');
    const hospitalRegForm = document.getElementById('hospital-register-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        await handleLogin(email, password);
    });

    patientRegForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('patient-email').value;
        const password = document.getElementById('patient-password').value;
        await handlePatientRegister(email, password);
        patientRegForm.reset();
    });

    hospitalRegForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('hospital-email').value;
        const password = document.getElementById('hospital-password').value;
        await handleHospitalRegister(email, password);
        hospitalRegForm.reset();
    });
    
    forgotPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('reset-email').value;
        await handlePasswordReset(email);
        forgotPasswordForm.reset();
        showCard(loginCard); // Return to login screen
    });
});
