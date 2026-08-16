
/*log in modal*/
function openLoginModal() {
    document.getElementById("loginModal").style.display = "flex";
}   
function closeLoginModal() {
    document.getElementById("loginModal").style.display = "none";
}

/* Set the current year in the footer */
document.addEventListener("DOMContentLoaded", function () {
    const yearElement = document.getElementById("current-year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

/*carousel*/

const slides = document.querySelectorAll(".img-slides img");
const dots = document.querySelectorAll(".dot");
const previous = document.querySelector(".previous");
const next = document.querySelector(".next");

let currentSlide = 0;
let slideInterval;




function showSlide(index) {
    slides.forEach(slide => {
        slide.style.display = "none";
    });

    dots.forEach(dot => {
        dot.classList.remove("active");
    });

    slides[index].style.display = "block";
    dots[index].classList.add("active");
    currentSlide = index;
}

function nextSlide() {
    currentSlide++;
    if (currentSlide >= slides.length) {
        currentSlide = 0;
    }
    showSlide(currentSlide);
}
function previousSlide() {
    currentSlide--;
    if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    }
    showSlide(currentSlide);
}
function startAutoSlide() {
    slideInterval = setInterval(nextSlide, 4000); 
}
function resetTimer() {
    clearInterval(slideInterval);
    startAutoSlide();
}

next.addEventListener("click", () => {
    nextSlide();
    resetTimer();
});
previous.addEventListener("click", () => {
    previousSlide();
    resetTimer();
});

dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
        showSlide(index);
        resetTimer();
    });
});

showSlide(currentSlide);
startAutoSlide();

/* ==================================== ADMIN UI JS ==================================== */

// ====for search bar==== //

let navBar = document.querySelector(".nav-bar");
let searchBox = document.querySelector(".search-box .search");

searchBox.addEventListener("click", () => {
    navBar.classList.toggle("showsearch");
    searchBox.classList.toggle("fa-xmark");
});



// ====for menu toggle bar==== //

let menuOpen = document.querySelector(".nav-bar .menu");
let close = document.querySelector(".nav-list .close");
let navList = document.querySelector(".nav-list");

menuOpen.addEventListener("click", ()=> {
  navList.style.left = "0";
});
  close.addEventListener("click", ()=> {
  navList.style.left = "-100%";
});


// ====for upload file modal==== //

function openpopupModal() {
    document.getElementById("popupModal").style.display = "flex";
}   
function closepopupModal() {
    document.getElementById("popupModal").style.display = "none";
}



// ====for upload file function==== //

const dragArea = document.querySelector('.drag-section');
const uploadBtn = document.querySelector('.upload-btn');
const fileInput = document.querySelector('.fileInput');

uploadBtn.onclick = () => fileInput.click();



// ====for scan modal==== //

function openscanModal() {
    document.getElementById("scanModal").style.display = "flex";
}   
function closescanModal() {
    document.getElementById("scanModal").style.display = "none";
}


// ====for account menu toggle==== //

function openMenu() {
    let menu = document.getElementById("accMenu");
    menu.classList.toggle("toggle-menu");
}

// ====for notification toggle==== //

function notifInfo() {
    let menu = document.getElementById("notifMenu");
    menu.classList.toggle("notif-toggle");
}

// ==== for user profile ==== //


const editBtn = document.getElementById('edit');
const saveBtn = document.getElementById('save');
const cancelBtn = document.getElementById('cancel');

// ==== for user profile edit ==== //

const userImg = document.getElementById('userImg');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const userPhone = document.getElementById('userPhone');
const userAddress = document.getElementById('userAddress');







