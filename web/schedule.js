import{ createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hyljgkbyaekgfwrovjnj.supabase.co';
const supabaseKey = 'sb_publishable_OxfQbHyrkLVXrisOS5kUhw_1LhfM_dD'

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: true, autoRefreshToken: true } });

console.log('Supabase client initialized:', supabase);

/* --------------------- Schedule --------------------- */
document.addEventListener("DOMContentLoaded", () => {

    const scheduleImage = document.getElementById("scheduleImage");
    const scheduleUploadBtn = document.getElementById("scheduleUploadBtn");
    const scheduleUploadModal = document.getElementById("scheduleUploadModal");
    const closeScheduleUpload = document.querySelector(".close-upload");
    const scheduleFileInput = document.getElementById("scheduleFile");
    const uploadScheduleButton = document.getElementById("uploadScheduleButton");
    const scheduleList = document.getElementById("scheduleList");

    if (!scheduleImage) return;

    async function loadSchedule() {

        const { data: image, error } = await supabase
            .from("schedule_image")
            .select("*")
            .eq("is_active", true)
            .single();

        if (error || !image) {
            console.log("No active schedule.");
            return;
        }

        const { data } = supabase.storage
            .from("school_files")
            .getPublicUrl(`schedule/${image.image_path}`);

        scheduleImage.src = data.publicUrl + "?t=" + Date.now();
    }
    async function loadScheduleList() {

        if (!scheduleList) return;

        const { data, error } = await supabase
            .from("schedule_image")
            .select("*")
            .order("uploaded_at", { ascending: false });

        if (error) {
            console.log(error);
            return;
        }

        scheduleList.innerHTML = "";

        data.forEach(image => {

            const item = document.createElement("div");
            item.className = "schedule-item";

            item.innerHTML = `
                <span>${image.image_name}</span>
                <button class="showScheduleBtn">Show</button>
            `;

            item.querySelector(".showScheduleBtn").onclick = async () => {

                await supabase
                    .from("schedule_image")
                    .update({ is_active: false })
                    .eq("is_active", true);

                await supabase
                    .from("schedule_image")
                    .update({ is_active: true })
                    .eq("id", image.id);

                loadSchedule();
            };

            scheduleList.appendChild(item);

        });

    }
    if (scheduleUploadBtn) {

        scheduleUploadBtn.onclick = () => {
            scheduleUploadModal.style.display = "flex";
        };

    }

    if (closeScheduleUpload) {

        closeScheduleUpload.onclick = () => {
            scheduleUploadModal.style.display = "none";
        };

    }
    if (uploadScheduleButton) {

        uploadScheduleButton.onclick = async () => {

            const file = scheduleFileInput.files[0];

            if (!file) {
                alert("Please choose an image.");
                return;
            }

            if (!file.type.startsWith("image/")) {
                alert("Please upload a PNG, JPG or JPEG.");
                return;
            }

            const uniqueName = Date.now() + "_" + file.name;

            const { error: uploadError } = await supabase.storage
                .from("school_files")
                .upload(`schedule/${uniqueName}`, file);

            if (uploadError) {
                alert(uploadError.message);
                return;
            }

            await supabase
                .from("schedule_image")
                .update({ is_active: false })
                .eq("is_active", true);

            const { error: insertError } = await supabase
                .from("schedule_image")
                .insert({
                    image_name: file.name,
                    image_path: uniqueName,
                    is_active: true
                });

            if (insertError) {
                alert(insertError.message);
                return;
            }

            loadSchedule();
            loadScheduleList();

            scheduleUploadModal.style.display = "none";
            scheduleFileInput.value = "";

            alert("Schedule uploaded successfully!");

        };

    }
    loadSchedule();
    loadScheduleList();
});