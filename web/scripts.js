import{ createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hyljgkbyaekgfwrovjnj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5bGpna2J5YWVrZ2Z3cm92am5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNzIwNTEsImV4cCI6MjA5ODY0ODA1MX0.z90DXZtT30krgi2qt5hXpyT4aWJNkHHuFzvpya24HDM';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Supabase client initialized:', supabase);

//-------------------------------- LOGIN MODAL --------------------------------
function openLoginModal() {
    document.getElementById("loginModal").style.display = "flex";
}

function closeLoginModal() {
    document.getElementById("loginModal").style.display = "none";
}

window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;

//-------------------------------- LOGOUT --------------------------------
async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Logout error:", error);
        return;
    }
    window.location.href = "home.html";
}

window.logout = logout;

//-------------------------------- UPDATE LOGIN BUTTON --------------------------------
async function updateAuthButton() {
    const authButton = document.getElementById("authButton");
    if (!authButton) {
        return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        authButton.textContent = "Logout";
        authButton.onclick = logout;
    } else {
        authButton.textContent = "Login";
        authButton.onclick = openLoginModal;
    }
}

//-------------------------------- UPDATE NAVIGATION BASED ON ROLE --------------------------------
async function updateNavigation() {
    const staffLinks = document.querySelectorAll(".staff-only");
    const adminLinks = document.querySelectorAll(".admin-only");
    const { data: { session } } = await supabase.auth.getSession();

    //-------------------------------- PUBLIC VISITOR --------------------------------
    if (!session) {
        staffLinks.forEach(link => {
            link.style.display = "none";
        });
        adminLinks.forEach(link => {
            link.style.display = "none";
        });
        return;
    }

    //-------------------------------- GET USER ROLE --------------------------------
    const {
        data: profile,
        error: profileError
    } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

    if (profileError) {

        console.error("Profile error:", profileError);

        return;
    }

    //-------------------------------- STAFF --------------------------------

    if (profile.role === "staff") {
        staffLinks.forEach(link => {
            link.style.display = "list-item";
        });
        adminLinks.forEach(link => {
            link.style.display = "none";
        });
    }

    //-------------------------------- ADMIN --------------------------------
    if (profile.role === "admin") {
        staffLinks.forEach(link => {
            link.style.display = "list-item";
        });
        adminLinks.forEach(link => {
            link.style.display = "list-item";
        });
    }
}

//-------------------------------- LOGIN FORM --------------------------------
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email =
                document.getElementById("email").value;
            const password =
                document.getElementById("password").value;
            const loginMessage =
                document.getElementById("loginMessage");
            const loginButton =
                loginForm.querySelector(
                    "button[type='submit']"
                );

            loginButton.disabled = true;
            loginButton.textContent = "Logging in...";

            const {data,error} = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error("Login error:", error);
                loginMessage.textContent = error.message;
                loginMessage.style.color = "red";
                loginButton.disabled = false;
                loginButton.textContent = "Login";
                return;
            }

            console.log(
                "Login successful:",
                data
            );

            //-------------------------------- GET USER ROLE --------------------------------
            const { 
                data: profile,
                error: profileError
            } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", data.user.id)
                .single();

            if (profileError) {
                console.error("Profile error:", profileError);
                loginMessage.textContent = "Login successful, but profile was not found.";
                loginMessage.style.color = "red";
                loginButton.disabled = false;
                loginButton.textContent = "Login";
                return;
            }

            //-------------------------------- REDIRECT --------------------------------
            if (
                profile.role === "admin" ||
                profile.role === "staff"
            ) {
                window.location.href =
                    "home.html";
            }

            else {
                loginMessage.textContent =
                    "Invalid user role.";

                loginMessage.style.color =
                    "red";
                loginButton.disabled = false;
                loginButton.textContent = "Login";
            }
        });
    }

    //-------------------------------- INITIAL PAGE SETUP --------------------------------
    updateAuthButton();
    updateNavigation();
});

//-------------------------------- CURRENT YEAR --------------------------------
document.addEventListener("DOMContentLoaded", function () {
    const yearElement =
        document.getElementById("current-year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});
