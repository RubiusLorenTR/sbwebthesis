import{ createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hyljgkbyaekgfwrovjnj.supabase.co'
const supabaseKey = 'sb_publishable_OxfQbHyrkLVXrisOS5kUhw_1LhfM_dD'

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: true, autoRefreshToken: true } });

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
    window.location.href = "/web/home.html";
}
window.logout = logout;

//-------------------------------- UPDATE LOGIN BUTTON --------------------------------
async function updateAuthButton() {
    const authButton = document.getElementById("authButton");
    if (!authButton) return;

    const { data: { user }, error } = await supabase.auth.getUser();
    console.log("Auth check:", user);

    if (user) {
        authButton.textContent = "Logout";
        authButton.onclick = logout;
        } 
    else {
        authButton.textContent = "Login";
        authButton.onclick = openLoginModal;
    }
}
updateAuthButton();
//-------------------------------- UPDATE NAVIGATION BASED ON ROLE --------------------------------
async function updateNavigation() {
    const staffLinks = document.querySelectorAll(".staff-only");
    const adminLinks = document.querySelectorAll(".admin-only");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        staffLinks.forEach(link => link.style.display = "none");
        adminLinks.forEach(link => link.style.display = "none");
        return;
    }

    const {data: profile, error: profileError} = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError) {
        console.error("Profile error:", profileError);
        return;
    }

    if (profile.role === "staff") {
        staffLinks.forEach(link => link.style.display = "list-item");
        adminLinks.forEach(link => link.style.display = "none");
    }

    if (profile.role === "admin") {
        staffLinks.forEach(link => link.style.display = "list-item");
        adminLinks.forEach(link => link.style.display = "list-item");
    }
}
updateNavigation();
//-------------------------------- LOGIN FORM --------------------------------
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const loginMessage = document.getElementById("loginMessage");
            const loginButton = loginForm.querySelector("button[type='submit']");

            loginButton.disabled = true;
            loginButton.textContent = "Logging in...";

            const {data,error} = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                console.error("Login error:", error);
                loginMessage.textContent = error.message;
                loginMessage.style.color = "red";
                loginButton.disabled = false;
                loginButton.textContent = "Login";
                return;
            }
            const { data: { user } } = await supabase.auth.getUser();
            console.log("Login successful:", user);
            
            if (!user) {
                loginMessage.textContent = "Login failed to persist session.";
                return;
            }
            //-------------------------------- GET USER ROLE --------------------------------
            const { data: profile,error: profileError} = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profileError) {
                console.error("Profile error:", profileError);
                loginMessage.textContent = "Login successful, but profile was not found.";
                loginMessage.style.color = "red";
                loginButton.disabled = false;
                loginButton.textContent = "Login";
                return;
            }
            if (profile.role === "staff") {
                window.location.href ="/web/home.html";
            }
            if (profile.role === "admin") {
                window.location.href ="/web/a_dashboard.html";
            }
            else {
                loginMessage.textContent = "Invalid user role.";
                loginMessage.style.color = "red";
                loginButton.disabled = false;
                loginButton.textContent = "Login";
            }
        });
    }
});
//-------------------------------- CURRENT YEAR --------------------------------
document.addEventListener("DOMContentLoaded", function () {
    const yearElement =
        document.getElementById("current-year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});
