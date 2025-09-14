// --- Initialize Firebase ---
// This uses the firebaseConfig object from conf.js
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const analytics = firebase.analytics();

console.log("Firebase Initialized Successfully");


// --- Firebase Logic Functions ---

// Handles user login
function handleLogin(email, password) {
    console.log(`Attempting to log in ${email}`);
    // TODO: Add Firebase login logic here
    // auth.signInWithEmailAndPassword(email, password)
    //  .then(...)
    //  .catch(...)
    showNotification('Login Unavailable', 'This is a demo. Login functionality is not yet connected to Firebase.', 'fa-info-circle', 'var(--primary-color)');
}

// Handles new patient registration
function handlePatientRegister(email, password) {
    console.log(`Attempting to register patient ${email}`);
    // TODO: Add Firebase registration logic here
    // auth.createUserWithEmailAndPassword(email, password)
    //  .then((userCredential) => {
    //      userCredential.user.sendEmailVerification();
    //      showNotification('Registration Successful!', 'A verification link has been sent...');
    //  })
    //  .catch(...)
    showNotification('Registration Successful!', 'A verification link has been sent to your email. Please check your inbox to activate your account.');
}

// Handles new hospital registration
function handleHospitalRegister(email, password) {
    console.log(`Attempting to register hospital ${email}`);
    // TODO: Add Firebase registration logic and save hospital data to Firestore
    showNotification('Hospital Registration Submitted!', 'Your application has been received. You will be notified upon approval.');
}

// Handles password reset request
function handlePasswordReset(email) {
    console.log(`Attempting to send password reset to ${email}`);
    // TODO: Add Firebase password reset logic here
    // auth.sendPasswordResetEmail(email)
    //  .then(...)
    //  .catch(...)
    showNotification('Reset Link Sent', 'If an account with that email exists, a password reset link has been sent. Please check your inbox.', 'fa-paper-plane');
}


// --- DOM Event Listeners & UI Logic ---
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

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        handleLogin(email, password);
    });

    patientRegForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('patient-email').value;
        const password = document.getElementById('patient-password').value;
        handlePatientRegister(email, password);
        patientRegForm.reset();
    });

    hospitalRegForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('hospital-email').value;
        const password = document.getElementById('hospital-password').value;
        handleHospitalRegister(email, password);
        hospitalRegForm.reset();
    });
    
    forgotPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('reset-email').value;
        handlePasswordReset(email);
        forgotPasswordForm.reset();
        showCard(loginCard); // Return to login screen
    });
});
