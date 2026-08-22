import{ createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hyljgkbyaekgfwrovjnj.supabase.co'
const supabaseKey = 'sb_publishable_OxfQbHyrkLVXrisOS5kUhw_1LhfM_dD'

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: true, autoRefreshToken: true } });


// -------------------------------- LOGIN MODAL -------------------------------- 

function openLoginModal() {
    const modal = document.getElementById("loginModal");
    if (modal) {modal.style.display = "flex";}
}

function closeLoginModal() {
    const modal = document.getElementById("loginModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// -------------------------------- CURRENT YEAR --------------------------------
document.addEventListener("DOMContentLoaded", function () {
    const yearElement =
        document.getElementById("current-year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// -------------------------------- CAROUSEL --------------------------------
const slides =
    document.querySelectorAll(".img-slides img");

const dots =
    document.querySelectorAll(".dot");

const previous =
    document.querySelector(".previous");

const next =
    document.querySelector(".next");

let currentSlide = 0;
let slideInterval;


function showSlide(index) {

    if (slides.length === 0) {
        return;
    }

    slides.forEach(slide => {

        slide.style.display = "none";

    });

    dots.forEach(dot => {

        dot.classList.remove("active");

    });

    slides[index].style.display = "block";

    if (dots[index]) {

        dots[index].classList.add("active");

    }
    currentSlide = index;
}


function nextSlide() {
    if (slides.length === 0) {
        return;
    }
    currentSlide++;
    if (currentSlide >= slides.length) {
        currentSlide = 0;
    }
    showSlide(currentSlide);
}

function previousSlide() {
    if (slides.length === 0) {
        return;
    }
    currentSlide--;
    if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    }
    showSlide(currentSlide);
}

function startAutoSlide() {
    if (slides.length === 0) {
        return;
    }
    slideInterval = setInterval(nextSlide, 4000);
}

function resetTimer() {
    clearInterval(slideInterval);
    startAutoSlide();
}

// -------------------------------- NEXT BUTTON --------------------------------
if (next) {
    next.addEventListener("click", () => {
        nextSlide();
        resetTimer();
    });
}

// -------------------------------- PREVIOUS BUTTON --------------------------------
if (previous) {
    previous.addEventListener("click", () => {
        previousSlide();
        resetTimer();
    });
}

// -------------------------------- DOTS --------------------------------
dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
        showSlide(index);
        resetTimer();
    });
});

if (slides.length > 0) {
    showSlide(currentSlide);
    startAutoSlide();
}

// -------------------------------- SEARCH BAR --------------------------------

const navBar = document.querySelector(".nav-bar");
const searchBox = document.querySelector(".search-box .search");

if (searchBox && navBar) {
    searchBox.addEventListener("click", () => {
        navBar.classList.toggle("showsearch");
        searchBox.classList.toggle("fa-xmark");
    });
}

// -------------------------------- MOBILE MENU --------------------------------

const menuOpen = document.querySelector(".nav-bar .menu");
const close = document.querySelector(".nav-list .close");
const navList = document.querySelector(".nav-list");

if (menuOpen && navList) {
    menuOpen.addEventListener("click", () => {
        navList.style.left = "0";
    });
}

if (close && navList) {
    close.addEventListener("click", () => {
        navList.style.left = "-100%";
    });
}

// -------------------------------- ACCOUNT MENU --------------------------------

const accountButton = document.getElementById("accountButton");
const accountMenu = document.getElementById("accMenu");

if (accountButton && accountMenu) {
    accountButton.addEventListener("click", () => {
        accountMenu.classList.toggle("toggle-menu");
    });
}

// -------------------------------- NOTIFICATION MENU --------------------------------

const notificationButton = document.getElementById("notificationButton");
const notificationMenu = document.getElementById("notifMenu");

if (notificationButton && notificationMenu) {
    notificationButton.addEventListener("click", () => {
        notificationMenu.classList.toggle(
            "notif-toggle"
        );
    });
}

// -------------------------------- UPLOAD FILE MODAL --------------------------------
function openpopupModal() {
    const modal =
        document.getElementById("popupModal");
    if (modal) {
        modal.style.display = "flex";
    }
}

function closepopupModal() {
    const modal = document.getElementById("popupModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// -------------------------------- UPLOAD FILE --------------------------------
const uploadBtn = document.querySelector(".upload-btn");
const fileInput = document.querySelector(".fileInput");

if (uploadBtn && fileInput) {
    uploadBtn.addEventListener("click", () => {
        fileInput.click();
    });
}

// -------------------------------- SCAN MODAL --------------------------------
function openscanModal() {
    const modal =
        document.getElementById("scanModal");
    if (modal) {
        modal.style.display = "flex";
    }
}

function closescanModal() {
    const modal = document.getElementById("scanModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// -------------------------------- LOGOUT --------------------------------
const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener( "click", async (event) => { 
        event.preventDefault(); 
        console.log("Logging out...");
        const { error } = await supabase.auth.signOut();
        if (error) {console.error("Logout error:",error);
            alert("Logout failed. Please try again.");
            return;
        }
        console.log("Logout successful.");
        window.location.href = "/web/home.html";
        }
    );
}