// DOM Elements
const calendarBtn = document.getElementById("calendarBtn");
const feedBtn = document.getElementById("feedBtn");
const calendarView = document.getElementById("calendarView");
const feedView = document.getElementById("feedView");
const loginOverlay = document.getElementById("loginOverlay");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

// New elements for Registration & Guest
const guestBtn = document.getElementById("guestBtn");
const loginCard = document.getElementById("loginCard");
const registerCard = document.getElementById("registerCard");
const toRegister = document.getElementById("toRegister");
const toLogin = document.getElementById("toLogin");
const registerBtn = document.getElementById("registerBtn");
const regUsername = document.getElementById("regUsername");
const regPassword = document.getElementById("regPassword");
const regError = document.getElementById("regError");
const regSuccess = document.getElementById("regSuccess");

// DOM Elements for Modal
const eventModal = document.getElementById("eventModal");
const closeModal = document.querySelector(".close-modal");
const saveEventBtn = document.getElementById("saveEventBtn");
let selectedDayElement = null;
let selectedDayNumber = null;

/* AUTH LOGIC */

// Check if user is already logged in
window.onload = () => {
    if (localStorage.getItem("isLoggedIn") === "true") {
        document.body.classList.remove("logged-out");
    }
    loadDynamicEvents();
    initCalendarClicks();
};

/* CALENDAR INTERACTION */

function initCalendarClicks() {
    const days = document.querySelectorAll(".day");
    days.forEach(day => {
        day.onclick = (e) => {
            // Prevent opening modal if clicking an existing event
            if (e.target.closest(".event")) return;

            selectedDayElement = day;
            selectedDayNumber = day.querySelector(".day-number").textContent;
            eventModal.style.display = "flex";
        };
    });
}

closeModal.onclick = () => {
    eventModal.style.display = "none";
};

window.onclick = (event) => {
    if (event.target == eventModal) {
        eventModal.style.display = "none";
    }
};

saveEventBtn.onclick = () => {
    const title = document.getElementById("eventTitle").value;
    const category = document.getElementById("eventCategory").value;
    const time = document.getElementById("eventTime").value;
    const location = document.getElementById("eventLocation").value;
    const desc = document.getElementById("eventDescription").value;

    if (!title || !time) {
        alert("Пожалуйста, заполните название и время");
        return;
    }

    const eventId = "event_" + Date.now();
    const newEvent = {
        id: eventId,
        day: selectedDayNumber,
        title,
        category,
        time,
        location,
        desc
    };

    saveEvent(newEvent);
    renderEventInCalendar(selectedDayElement, newEvent);
    renderEventInFeed(newEvent);

    // Close and Clear
    eventModal.style.display = "none";
    clearModalFields();
};

function saveEvent(event) {
    const dynamicEvents = JSON.parse(localStorage.getItem("dynamicEvents") || "[]");
    dynamicEvents.push(event);
    localStorage.setItem("dynamicEvents", JSON.stringify(dynamicEvents));
}

function loadDynamicEvents() {
    const dynamicEvents = JSON.parse(localStorage.getItem("dynamicEvents") || "[]");
    const days = document.querySelectorAll(".day");

    dynamicEvents.forEach(event => {
        const dayElem = Array.from(days).find(d => d.querySelector(".day-number").textContent === event.day);
        if (dayElem) {
            renderEventInCalendar(dayElem, event);
            renderEventInFeed(event);
        }
    });
}

function renderEventInCalendar(dayElem, event) {
    const eventDiv = document.createElement("div");
    eventDiv.className = "event";
    eventDiv.onclick = (e) => {
        e.stopPropagation();
        openEvent(event.id);
    };

    const dot = document.createElement("div");
    dot.className = `dot ${event.category}`;
    
    eventDiv.appendChild(dot);
    eventDiv.append(event.title);
    
    dayElem.appendChild(eventDiv);
}

function renderEventInFeed(event) {
    const categoryName = {
        "blue": "Олимпиада",
        "green": "Спорт",
        "yellow": "Другое"
    }[event.category];

    const card = document.createElement("div");
    card.className = "event-card";
    card.id = event.id;
    card.innerHTML = `
        <div class="card-top">
            <h2>${event.title}</h2>
            <div class="category ${event.category}">${categoryName}</div>
        </div>
        <p class="description">${event.desc || "Нет описания."}</p>
        <div class="info-grid">
            <div class="info-box"><span>Дата</span><h4>${event.day} мая 2026</h4></div>
            <div class="info-box"><span>Время</span><h4>${event.time}</h4></div>
            <div class="info-box"><span>Место</span><h4>${event.location || "—"}</h4></div>
            <div class="info-box"><span>Классы</span><h4>Все</h4></div>
        </div>
        <div class="question-section">
            <button class="question-btn" onclick="toggleQuestion(this)">Задать вопрос</button>
            <div class="question-box">
                <textarea placeholder="Введите вопрос..."></textarea>
                <button class="send-btn" onclick="sendQuestion(this)">Отправить</button>
                <p class="success-message">Вопрос отправлен</p>
            </div>
        </div>
    `;
    feedView.appendChild(card);
}

function clearModalFields() {
    document.getElementById("eventTitle").value = "";
    document.getElementById("eventTime").value = "";
    document.getElementById("eventLocation").value = "";
    document.getElementById("eventDescription").value = "";
}

/* SWITCH BETWEEN VIEWS */

// Switch to Register
toRegister.onclick = () => {
    loginCard.style.display = "none";
    registerCard.style.display = "block";
    regSuccess.style.display = "none";
};

// Switch to Login
toLogin.onclick = () => {
    loginCard.style.display = "block";
    registerCard.style.display = "none";
};

// Login Logic
loginBtn.onclick = async () => {
    const user = usernameInput.value;
    const pass = passwordInput.value;

    try {
        // 1. Get predefined users from JSON
        const response = await fetch('users.json');
        const users = await response.json();

        // 2. Get registered users from localStorage
        const localUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
        
        const allUsers = [...users, ...localUsers];

        const foundUser = allUsers.find(u => u.username === user && u.password === pass);

        if (foundUser) {
            loginSuccess();
        } else {
            loginError.style.display = "block";
        }
    } catch (error) {
        console.error("Auth error:", error);
        alert("Ошибка при проверке данных");
    }
};

// Registration Logic
registerBtn.onclick = () => {
    const user = regUsername.value.trim();
    const pass = regPassword.value.trim();

    if (user === "" || pass === "") {
        regError.style.display = "block";
        return;
    }

    const localUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    
    // Check if user already exists
    if (localUsers.some(u => u.username === user)) {
        regError.textContent = "Пользователь уже существует";
        regError.style.display = "block";
        return;
    }

    localUsers.push({ username: user, password: pass });
    localStorage.setItem("registeredUsers", JSON.stringify(localUsers));
    
    regError.style.display = "none";
    regSuccess.style.display = "block";
    
    // Clear inputs
    regUsername.value = "";
    regPassword.value = "";

    setTimeout(() => {
        toLogin.click();
    }, 1500);
};

// Guest Login
guestBtn.onclick = () => {
    loginSuccess();
};

function loginSuccess() {
    localStorage.setItem("isLoggedIn", "true");
    document.body.classList.remove("logged-out");
    loginError.style.display = "none";
    usernameInput.value = "";
    passwordInput.value = "";
}

logoutBtn.onclick = () => {
    localStorage.removeItem("isLoggedIn");
    document.body.classList.add("logged-out");
};

/* SWITCH BETWEEN VIEWS */

calendarBtn.onclick = () => {
    calendarView.style.display = "grid";
    feedView.style.display = "none";
    calendarBtn.classList.add("active-btn");
    feedBtn.classList.remove("active-btn");
};

feedBtn.onclick = () => {
    calendarView.style.display = "none";
    feedView.style.display = "flex";
    feedBtn.classList.add("active-btn");
    calendarBtn.classList.remove("active-btn");
};

/* OPEN EXACT EVENT */

function openEvent(eventId){
    calendarView.style.display = "none";
    feedView.style.display = "flex";
    feedBtn.classList.add("active-btn");
    calendarBtn.classList.remove("active-btn");

    const cards = document.querySelectorAll(".event-card");
    cards.forEach(card => card.classList.remove("highlight"));

    const selectedCard = document.getElementById(eventId);
    selectedCard.classList.add("highlight");
    selectedCard.scrollIntoView({ behavior:"smooth", block:"center" });

    setTimeout(() => {
        selectedCard.classList.remove("highlight");
    }, 3000);
}

/* QUESTIONS */

function toggleQuestion(button){
    const questionBox = button.nextElementSibling;
    questionBox.style.display = (questionBox.style.display === "block") ? "none" : "block";
}

function sendQuestion(button){
    const parent = button.parentElement;
    const textarea = parent.querySelector("textarea");
    const success = parent.querySelector(".success-message");

    if(textarea.value.trim() !== ""){
        success.style.display = "block";
        textarea.value = "";
        setTimeout(() => {
            success.style.display = "none";
        }, 3000);
    }
}