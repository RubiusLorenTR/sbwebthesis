import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hyljgkbyaekgfwrovjnj.supabase.co';
const supabaseKey = 'sb_publishable_OxfQbHyrkLVXrisOS5kUhw_1LhfM_dD';
const supabase = createClient(supabaseUrl, supabaseKey, {auth: { persistSession: true, autoRefreshToken: true }});

document.addEventListener("DOMContentLoaded", async () => {
    const uploadBtn = document.getElementById("uploadBtn");
    const uploadModal = document.getElementById("uploadModal");
    const closeUpload = document.querySelector(".close-upload");
    const uploadFileButton = document.getElementById("uploadFileButton");
    const fileInput = document.getElementById("fileInput");
    const fileTableBody = document.getElementById("fileTableBody");
    const CATEGORY = window.location.pathname.split("/").pop().replace(".html", "");
    let isAdmin = false;

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        isAdmin = profile?.role?.toLowerCase() === "admin";
    }

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

            if (!file) {
                return alert("Please select a file.");
            }

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return alert("You must be logged in.");
            }

            const storagePath = `${CATEGORY}/${Date.now()}-${file.name}`;

            const { error: uploadError } = await supabase.storage
                .from("school_files")
                .upload(storagePath, file, { upsert: true });

            if (uploadError) {
                console.error("Upload error:", uploadError);
                return alert("Upload failed: " + uploadError.message);
            }

            const { error: insertError } = await supabase
                .from("school_files")
                .insert({
                    category: CATEGORY,
                    file_name: file.name,
                    file_path: storagePath,
                    uploaded_by: user.id,
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

        if (!files || !files.length) {
            fileTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty">No files uploaded.</td>
                </tr>`;
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
                    <button class="download-btn" data-path="${file.file_path}">
                        Download
                    </button>
                    ${isAdmin ? `
                        <button class="delete-btn" data-id="${file.id}" data-path="${file.file_path}">
                            Delete
                        </button>
                    ` : ""}
                </td>`;

            fileTableBody.appendChild(row);
        });

        document.querySelectorAll(".download-btn").forEach(btn => {
            btn.addEventListener("click", async e => {
                const path = e.target.dataset.path;

                const { data, error } = await supabase.storage
                    .from("school_files")
                    .download(path);

                if (error) {
                    console.error("Download error:", error);
                    return alert("Download failed: " + error.message);
                }

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

        if (isAdmin) {
            document.querySelectorAll(".delete-btn").forEach(btn => {
                btn.addEventListener("click", async e => {
                    const id = e.target.dataset.id;
                    const path = e.target.dataset.path;

                    if (!confirm("Are you sure you want to delete this file?")) {
                        return;
                    }

                    const { data: { user } } = await supabase.auth.getUser();

                    if (!user) {
                        return alert("You must be logged in.");
                    }

                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("role")
                        .eq("id", user.id)
                        .single();

                    if (profile?.role?.toLowerCase() !== "admin") {
                        return alert("Only administrators can delete files.");
                    }

                    const { error: storageError } = await supabase.storage
                        .from("school_files")
                        .remove([path]);

                    if (storageError) {
                        console.error("Storage delete error:", storageError);
                        return alert("Failed to delete file: " + storageError.message);
                    }

                    const { error: dbError } = await supabase
                        .from("school_files")
                        .delete()
                        .eq("id", id);

                    if (dbError) {
                        console.error("Database delete error:", dbError);
                        return alert(
                            "File was removed from storage, but database deletion failed: " +
                            dbError.message
                        );
                    }

                    alert("File deleted successfully!");
                    loadFiles();
                });
            });
        }
    }

    loadFiles();
});