import{ createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hyljgkbyaekgfwrovjnj.supabase.co';
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
            if (profile.role === "admin" ||profile.role === "staff") {
                window.location.href ="/web/home.html";
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

//------------------------------- FILE UPLOAD MODAL --------------------------------
document.addEventListener("DOMContentLoaded", function () {
    const uploadBtn = document.getElementById("uploadBtn");
    const uploadModal = document.getElementById("uploadModal");
    const closeUpload = document.querySelector(".close-upload");
    const uploadFileButton = document.getElementById("uploadFileButton");
    const fileInput = document.getElementById("fileInput");
    const fileTableBody = document.getElementById("fileTableBody");

    const CATEGORY = window.location.pathname.split("/").pop().replace(".html", ""); 
    // if the leadership.html → "leadership", finance.html → "finance"

    if (uploadBtn) {
        uploadBtn.addEventListener("click", () => {
            uploadModal.style.display = "flex";
        });
    }
    if (closeUpload) {
        closeUpload.addEventListener("click", () => {
            uploadModal.style.display = "none";
        });
    }
    if (uploadFileButton) {
        uploadFileButton.addEventListener("click", async () => {
        const file = fileInput.files[0];
        if (!file) return alert("Please select a file.");

        // Get current user
        const { data: { user }, error } = await supabase.auth.getUser();
        console.log("User:", user);

        if (!user) return alert("You must be logged in.");
        const userId = user.id;

        // Path inside storage bucket
        const storagePath = `${CATEGORY}/${Date.now()}-${file.name}`;

        // Upload to Supabase storage
        const { data, error: uploadError } = await supabase.storage
            .from("school_files")
            .upload(storagePath, file, { upsert: true });

        if (uploadError) {
            console.error("Upload error:", uploadError);
            return alert("Upload failed: " + uploadError.message);
        }

        // Save metadata in SQL table
        const { error: insertError } = await supabase
            .from("school_files")
            .insert({
                category: CATEGORY,
                file_name: file.name,
                file_path: storagePath,
                uploaded_by: userId,
                uploaded_at: new Date().toISOString()
            });
        if (insertError) {
            console.error("Insert error:", insertError);
            return alert("Failed to save metadata: " + insertError.message);
        }

        alert("File uploaded successfully!");
        uploadModal.style.display = "none";
        fileInput.value = "";

        loadFiles();
        });
    }

    //-------------------------------- LOAD FILES --------------------------------
    async function loadFiles() {
        const { data: files, error } = await supabase
            .from("school_files")
            .select("*")
            .eq("category", CATEGORY)
            .order("uploaded_at", { ascending: false });

        if (error) {
            console.error("Load error:", error);
            return;
        }

        fileTableBody.innerHTML = "";

        if (!files || files.length === 0) {
            fileTableBody.innerHTML = `<tr><td colspan="5" class="empty">No files uploaded.</td></tr>`;
            return;
        }

        files.forEach(file => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${file.file_name}</td>
                <td>${file.uploaded_by}</td>
                <td>${new Date(file.uploaded_at).toLocaleString()}</td>
                <td>-</td>
                <td>
                    <button class="download-btn" data-path="${file.file_path}">Download</button>
                </td>
            `;
            fileTableBody.appendChild(row);
        });

        document.querySelectorAll(".download-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const path = e.target.getAttribute("data-path");
                const { data, error } = await supabase.storage
                    .from("school_files")
                    .download(path);

                if (error) {
                    console.error("Download error:", error);
                    return alert("Download failed: " + error.message);
                }

                // Trigger browser download
                const url = URL.createObjectURL(data);
                const a = document.createElement("a");
                a.href = url;
                a.download = path.split("/").pop();
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            });
        });
    }
    loadFiles();
});
