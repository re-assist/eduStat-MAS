document.addEventListener('DOMContentLoaded', function (event) {
    
    //REVERSE SECURITY GUARD
    // Check if the user is logged in
    auth.onAuthStateChanged(user => {
        // Retrieve the logout flag from session storage
        const isLoggingOut = sessionStorage.getItem('isLoggingOut');

        // If the user is logged in and not logging out, redirect to the dashboard
        if (user && !isLoggingOut) {
            console.log("User already logged in. Redirecting to dashboard...");
            window.location.replace('./dashboard.html');
        // If the user is logging out, stay on the login page and clear inputs
        } else if (isLoggingOut) {
             console.log("Logout in progress, staying on login page.");
             if(document.getElementById('login-email')) document.getElementById('login-email').value = "";
             if(document.getElementById('login-password')) document.getElementById('login-password').value = "";
             // Remove the logout flag after a short delay
             setTimeout(() => { sessionStorage.removeItem('isLoggingOut'); }, 2000);
        }
    });

    const loginButton = document.getElementById('login-button');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const errorMessage = document.getElementById('login-error');

    if (loginButton) {
        
        loginButton.addEventListener('click', () => {
            const email = emailInput.value;
            const password = passwordInput.value;   

            errorMessage.innerText = '';

            // Basic validation: Check if email and password are provided
            if (!email || !password) {
                errorMessage.innerText = 'Please enter both email and password.';
                return;
            }

            console.log('Attempting to sign in with email:', email);


            // 1. Set Persistence to SESSION (Clears on tab close)
            // This ensures that the user is logged out when the browser session ends.
            auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
                .then(() => {

                    return auth.signInWithEmailAndPassword(email, password);
                })
                .then((userCredential) => {
                    // If login is successful:
                    // Remove any lingering logout flag
                    sessionStorage.removeItem('isLoggingOut');
                    console.log('User signed in (Session Only):', userCredential.user);
                    // Redirect to the dashboard page, replacing the current history entry
                    window.location.replace('./dashboard.html'); 
                })
                .catch((error) => {
                    // If login fails:
                    console.error('Error signing in:', error.code, error.message);
                    
                    // Handle invalid credentials
                    if (error.code === 'auth/invalid-credential' || 
                        (error.code === 'auth/internal-error' && error.message.includes('INVALID_LOGIN_CREDENTIALS'))
                       ) 
                    {
                        errorMessage.innerText = 'Invalid email or password. Please try again.';
                    } else {
                        
                        errorMessage.innerText = "An error occurred. Please try again later.";
                        console.error("A non-login error occurred:", error.code, error.message);
                    }
                });
            
        });
    } else {
        console.error('Login button not found in the DOM.');
    }
});