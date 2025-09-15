// --- Initialize Firebase ---
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//                 -- ADMIN CONFIGURATION --
//
//   IMPORTANT: Replace the placeholder email below with the
//   actual email address you want to use for the system administrator.
//   This is the ONLY email that will be redirected to administration.html
//
const ADMIN_EMAIL = "rahulr16184@gmail.com";
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


console.log("Firebase and Firestore Initialized. Admin email is set to:", ADMIN_EMAIL);

// --- Loading Spinner and Notification ---
const notificationModal = new bootstrap.Modal(document.getElementById('notificationModal'));
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalIcon = document.getElementById('modalIcon');
const modalSpinner = document.getElementById('modal-spinner');
const modalOkBtn = document.getElementById('modal-ok-btn');

function showNotification(title, message, iconClass = 'fa-circle-check', iconColor = 'var(--success-color)') {
    modalSpinner.classList.add('d-none');
    modalIcon.classList.remove('d-none');
    modalOkBtn.classList.remove('d-none');

    modalTitle.textContent = title;
    modalBody.textContent = message;
    modalIcon.className = `fas ${iconClass} fa-4x`;
    modalIcon.style.color = iconColor;
    notificationModal.show();
}

function showLoading(message) {
    modalIcon.classList.add('d-none');
    modalOkBtn.classList.add('d-none');
    modalSpinner.classList.remove('d-none');
    
    modalTitle.textContent = message;
    modalBody.textContent = 'Please wait...';
    notificationModal.show();
}

// --- Firebase Logic Functions ---

async function handleLogin(email, password) {
    showLoading('Signing In');
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
            auth.signOut();
            return showNotification('Login Failed', 'Please verify your email address before signing in.', 'fa-envelope', 'var(--primary-color)');
        }

        // ** ROLE-BASED REDIRECTION LOGIC **
        if (user.email === ADMIN_EMAIL) {
            console.log("Administrator login successful.");
            window.location.href = 'administration.html';
            return;
        }

        // Fetch user role from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            auth.signOut();
            return showNotification('Login Failed', 'User data not found. Please contact support.', 'fa-user-slash', '#dc3545');
        }

        const userData = userDoc.data();
        switch (userData.role) {
            case 'patient':
                console.log("Patient login successful.");
                window.location.href = 'patient.html';
                break;
            case 'hospital':
                 console.log("Hospital login successful.");
                window.location.href = 'hospital.html';
                break;
            default:
                auth.signOut();
                showNotification('Login Failed', 'No valid role assigned to this account.', 'fa-exclamation-triangle', '#ffc107');
        }

    } catch (error) {
        let msg = "Invalid email or password. Please try again.";
        console.error("Login Error:", error.code, error.message);
        showNotification('Login Failed', msg, 'fa-circle-xmark', '#dc3545');
    }
}

async function handlePatientRegister(name, email, password) {
    showLoading('Creating Account');
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName: name });
        await userCredential.user.sendEmailVerification();
        await db.collection('users').doc(userCredential.user.uid).set({
            name: name,
            email: email,
            role: 'patient',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        auth.signOut();
        showNotification('Registration Successful!', 'A verification link has been sent to your email. Please check your inbox to activate your account.');
    } catch (error) {
        let msg = "Couldn't create your account. Please try again.";
        if (error.code === 'auth/email-already-in-use') msg = "An account with this email already exists.";
        if (error.code === 'auth/weak-password') msg = "Password is too weak. It must be at least 6 characters.";
        console.error("Registration Error:", error.code);
        showNotification('Registration Failed', msg, 'fa-circle-xmark', '#dc3545');
    }
}

async function handleHospitalRegister(hospitalData) {
    showLoading('Submitting Application');
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(hospitalData.email, hospitalData.password);
        await userCredential.user.updateProfile({ displayName: hospitalData.contactName });
        await userCredential.user.sendEmailVerification();
        
        const userDocRef = db.collection('users').doc(userCredential.user.uid);
        const hospitalDocRef = db.collection('hospitals').doc(userCredential.user.uid);

        const batch = db.batch();
        batch.set(userDocRef, {
            name: hospitalData.contactName,
            email: hospitalData.email,
            role: 'hospital',
            hospitalId: userCredential.user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        batch.set(hospitalDocRef, {
            hospitalName: hospitalData.hospitalName,
            address: hospitalData.address,
            contactName: hospitalData.contactName,
            contactEmail: hospitalData.email,
            status: 'pending_approval',
            adminId: userCredential.user.uid
        });
        await batch.commit();

        auth.signOut();
        showNotification('Application Submitted!', 'A verification link has been sent to your email. Your application is now pending review by an administrator.');
    } catch (error) {
        let msg = "Couldn't submit your application. Please try again.";
        if (error.code === 'auth/email-already-in-use') msg = "An account with this contact email already exists.";
        console.error("Hospital Registration Error:", error.code, error.message);
        showNotification('Application Failed', msg, 'fa-circle-xmark', '#dc3545');
    }
}

async function handlePasswordReset(email) {
    showLoading('Sending Link');
    try {
        await auth.sendPasswordResetEmail(email);
        showNotification('Reset Link Sent', 'If an account with that email exists, a password reset link has been sent. Please check your inbox.', 'fa-paper-plane');
    } catch (error) {
        console.error("Password Reset Error:", error.code);
        showNotification('Reset Link Sent', 'If an account with that email exists, a password reset link has been sent. Please check your inbox.', 'fa-paper-plane');
    }
}

// --- DOM Event Listeners & UI Logic ---
document.addEventListener('DOMContentLoaded', function() {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    const forgotPasswordCard = document.getElementById('forgot-password-card');

    function showCard(cardToShow) {
        loginCard.classList.add('d-none');
        registerCard.classList.add('d-none');
        forgotPasswordCard.classList.add('d-none');
        cardToShow.classList.remove('d-none');
    }

    document.getElementById('show-register-link').addEventListener('click', (e) => { e.preventDefault(); showCard(registerCard); });
    document.getElementById('show-login-link').addEventListener('click', (e) => { e.preventDefault(); showCard(loginCard); });
    document.getElementById('forgot-password-link').addEventListener('click', (e) => { e.preventDefault(); showCard(forgotPasswordCard); });
    document.getElementById('back-to-login-link').addEventListener('click', (e) => { e.preventDefault(); showCard(loginCard); });

    document.querySelectorAll('.toggle-password').forEach(el => {
        el.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const icon = this.querySelector('i');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            } else {
                passwordInput.type = 'password';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            }
        });
    });

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin(document.getElementById('login-email').value, document.getElementById('login-password').value);
    });

    document.getElementById('patient-register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handlePatientRegister(document.getElementById('patient-name').value, document.getElementById('patient-email').value, document.getElementById('patient-password').value);
    });

    document.getElementById('hospital-register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const hospitalData = {
            hospitalName: document.getElementById('hospital-name').value,
            address: document.getElementById('hospital-address').value,
            contactName: document.getElementById('hospital-contact-name').value,
            email: document.getElementById('hospital-email').value,
            password: document.getElementById('hospital-password').value
        };
        handleHospitalRegister(hospitalData);
    });

    document.getElementById('forgot-password-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handlePasswordReset(document.getElementById('reset-email').value);
    });
});

