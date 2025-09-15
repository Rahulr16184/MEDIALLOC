// --- Initialize Firebase ---
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//                 -- ADMIN CONFIGURATION --
const ADMIN_EMAIL = "YOUR_ADMIN_EMAIL@example.com";
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log("Firebase and Firestore Initialized. Admin email is:", ADMIN_EMAIL);

// --- Notification and Loading Functions ---
const notificationModalEl = document.getElementById('notificationModal');
const notificationModal = new bootstrap.Modal(notificationModalEl);
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


// --- Firebase Logic Functions (These are already correct) ---
async function handleLogin(email, password) { /* ... NO CHANGES IN THIS FUNCTION ... */ showLoading('Authenticating...'); try { const userCredential = await auth.signInWithEmailAndPassword(email, password); const user = userCredential.user; console.log("Step 1: Auth successful for:", user.uid); if (!user.emailVerified) { auth.signOut(); console.log("Login failed: Email not verified."); return showNotification('Login Failed', 'Please verify your email address.', 'fa-envelope', 'var(--primary-color)'); } console.log("Step 2: Checking for Admin role..."); if (user.email === ADMIN_EMAIL) { console.log("SUCCESS: Admin identified. Redirecting..."); window.location.href = 'administration.html'; return; } console.log("Step 3: Fetching user role from Firestore..."); const userDoc = await db.collection('users').doc(user.uid).get(); if (userDoc.exists) { const userData = userDoc.data(); console.log("Step 4: User doc found:", userData); const userRole = userData.role; switch (userRole) { case 'patient': console.log("SUCCESS: Role 'patient'. Redirecting..."); window.location.href = 'patient.html'; break; case 'hospital': console.log("SUCCESS: Role 'hospital'. Redirecting..."); window.location.href = 'hospital.html'; break; default: auth.signOut(); console.error("Login failed: Invalid role:", userRole); showNotification('Login Failed', 'Your account has no valid role.', 'fa-exclamation-triangle', '#ffc107'); } } else { auth.signOut(); console.error("Login failed: User document does not exist in Firestore for UID:", user.uid); showNotification('Login Failed', 'Could not find user data.', 'fa-user-slash', '#dc3545'); } } catch (error) { console.error("Login Error:", error); let msg = "Invalid email or password."; if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') { msg = "The email or password you entered is incorrect."; } showNotification('Login Failed', msg, 'fa-circle-xmark', '#dc3545'); } }
async function handlePatientRegister(name, email, password) { /* ... NO CHANGES IN THIS FUNCTION ... */ showLoading('Creating Account'); try { const userCredential = await auth.createUserWithEmailAndPassword(email, password); await userCredential.user.updateProfile({ displayName: name }); await userCredential.user.sendEmailVerification(); await db.collection('users').doc(userCredential.user.uid).set({ name: name, email: email, role: 'patient', createdAt: firebase.firestore.FieldValue.serverTimestamp() }); auth.signOut(); showNotification('Registration Successful!', 'A verification link has been sent to your email. Please check your inbox to activate your account.'); } catch (error) { let msg = "Couldn't create your account."; if (error.code === 'auth/email-already-in-use') msg = "This email is already in use."; if (error.code === 'auth/weak-password') msg = "Password must be at least 6 characters."; console.error("Registration Error:", error.code); showNotification('Registration Failed', msg, 'fa-circle-xmark', '#dc3545'); } }
async function handleHospitalRegister(hospitalData) { /* ... NO CHANGES IN THIS FUNCTION ... */ showLoading('Submitting Application'); try { const userCredential = await auth.createUserWithEmailAndPassword(hospitalData.email, hospitalData.password); await userCredential.user.updateProfile({ displayName: hospitalData.contactName }); await userCredential.user.sendEmailVerification(); const userDocRef = db.collection('users').doc(userCredential.user.uid); const hospitalDocRef = db.collection('hospitals').doc(userCredential.user.uid); const batch = db.batch(); batch.set(userDocRef, { name: hospitalData.contactName, email: hospitalData.email, role: 'hospital', hospitalId: userCredential.user.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp() }); batch.set(hospitalDocRef, { hospitalName: hospitalData.hospitalName, address: hospitalData.address, contactName: hospitalData.contactName, contactEmail: hospitalData.email, status: 'pending_approval', adminId: userCredential.user.uid }); await batch.commit(); auth.signOut(); showNotification('Application Submitted!', 'A verification link has been sent to your email. Your application is pending review.'); } catch (error) { let msg = "Couldn't submit application."; if (error.code === 'auth/email-already-in-use') msg = "This contact email is already in use."; console.error("Hospital Registration Error:", error.code); showNotification('Application Failed', msg, 'fa-circle-xmark', '#dc3545'); } }
async function handlePasswordReset(email) { /* ... NO CHANGES IN THIS FUNCTION ... */ showLoading('Sending Link'); try { await auth.sendPasswordResetEmail(email); showNotification('Reset Link Sent', 'If an account with that email exists, a password reset link has been sent to your inbox.', 'fa-paper-plane'); } catch (error) { console.error("Password Reset Error:", error.code); showNotification('Reset Link Sent', 'If an account with that email exists, a password reset link has been sent to your inbox.', 'fa-paper-plane'); } }


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   -- EVENT LISTENERS & UI LOGIC (THIS IS THE CORRECTED SECTION) --
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

document.addEventListener('DOMContentLoaded', function() {
    
    // --- Card Switching Logic ---
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

    // --- Hide/Show Password Logic ---
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

    // --- Form Submission Logic ---
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        handleLogin(email, password);
    });

    document.getElementById('patient-register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('patient-name').value;
        const email = document.getElementById('patient-email').value;
        const password = document.getElementById('patient-password').value;
        handlePatientRegister(name, email, password);
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
        const email = document.getElementById('reset-email').value;
        handlePasswordReset(email);
    });
});

