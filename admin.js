firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('user-email-display').textContent = user.email;
        document.getElementById('loading-state').classList.add('d-none');
        document.getElementById('dashboard-content').classList.remove('d-none');
    } else {
        window.location.href = 'index.html';
    }
});

document.getElementById('logout-button').addEventListener('click', () => {
    auth.signOut().then(() => window.location.href = 'index.html');
});
