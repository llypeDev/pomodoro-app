import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js";

let timerDisplay = document.getElementById('timer');
let startPauseBtn = document.getElementById('start-pause-btn');
let pomodoroBtn = document.getElementById('pomodoro-btn');
let shortBreakBtn = document.getElementById('short-break-btn');
let longBreakBtn = document.getElementById('long-break-btn');

let workTime = 25 * 60;
let shortBreakTime = 5 * 60;
let longBreakTime = 15 * 60;
let timeRemaining;
let isRunning = false;
let timerInterval;
let currentMode;

// Debounce function to limit the frequency of `localStorage` writes
function debounce(func, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

// Debounced save function (1 second delay)
const debouncedSaveTimerState = debounce(saveTimerState, 1000);

// Load saved timer state
function loadTimerState() {
    const savedTime = localStorage.getItem('timeRemaining');
    const savedMode = localStorage.getItem('currentMode');
    const savedRunningState = localStorage.getItem('isRunning');

    if (savedTime) {
        timeRemaining = parseInt(savedTime, 10);
        currentMode = savedMode || 'work';
        isRunning = savedRunningState === 'true';
        updateTimerDisplay(timeRemaining);
        if (isRunning) {
            startTimer();
            startPauseBtn.textContent = 'PAUSAR';
        }
    } else {
        resetTimer(workTime, 'work');
    }
}

// Save timer state
function saveTimerState() {
    localStorage.setItem('timeRemaining', timeRemaining);
    localStorage.setItem('currentMode', currentMode);
    localStorage.setItem('isRunning', isRunning);
}

// Update the display with the formatted time
function updateTimerDisplay(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay(timeRemaining);
        debouncedSaveTimerState(); // Use the debounced function for saving

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            switchMode(); // Automatically switch modes
        }
    }, 1000);
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(timerInterval);
        startPauseBtn.textContent = 'INICIAR';
    } else {
        startTimer();
        startPauseBtn.textContent = 'PAUSAR';
    }
    isRunning = !isRunning;
    debouncedSaveTimerState(); // Save state after toggling
}

function resetTimer(newTime, mode) {
    clearInterval(timerInterval);
    timeRemaining = newTime;
    currentMode = mode;
    updateTimerDisplay(timeRemaining);
    startPauseBtn.textContent = 'INICIAR';
    isRunning = false;
    debouncedSaveTimerState();
}

function switchMode() {
    if (currentMode === 'work') {
        resetTimer(shortBreakTime, 'shortBreak');
    } else if (currentMode === 'shortBreak') {
        resetTimer(workTime, 'work');
    } else if (currentMode === 'longBreak') {
        resetTimer(workTime, 'work');
    }
}

startPauseBtn.addEventListener('click', toggleTimer);
pomodoroBtn.addEventListener('click', () => resetTimer(workTime, 'work'));
shortBreakBtn.addEventListener('click', () => resetTimer(shortBreakTime, 'shortBreak'));
longBreakBtn.addEventListener('click', () => resetTimer(longBreakTime, 'longBreak'));

loadTimerState();  // Load initial timer state

// Tasks logic with persistence in localStorage
let taskForm = document.getElementById('task-form');
let taskInput = document.getElementById('task-input');
let taskList = document.getElementById('task-list');

// Load saved tasks
function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    savedTasks.forEach(task => createTaskElement(task));
}

// Save tasks
function saveTasks() {
    const tasks = Array.from(taskList.children).map(li => li.firstChild.textContent);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Create task element
function createTaskElement(taskText) {
    let li = document.createElement('li');
    li.textContent = taskText;

    let deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Remover';
    deleteBtn.classList.add('delete-btn');
    
    deleteBtn.addEventListener('click', function () {
        taskList.removeChild(li);
        saveTasks(); // Save tasks after removal
    });

    li.appendChild(deleteBtn);
    taskList.appendChild(li);
}

taskForm.addEventListener('submit', function (event) {
    event.preventDefault();

    let taskText = taskInput.value.trim();
    if (taskText === '') return;

    createTaskElement(taskText);
    saveTasks(); // Save tasks after addition
    taskInput.value = '';
});

loadTasks();  // Load initial tasks

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBj91QBL82u_kjjws-IlToJSeD4gM5eqr0",
    authDomain: "pomodoro-app-74d3d.firebaseapp.com",
    projectId: "pomodoro-app-74d3d",
    storageBucket: "pomodoro-app-74d3d.appspot.com",
    messagingSenderId: "5137538908",
    appId: "1:5137538908:web:205d04b6d8d47c5ba12b99",
    measurementId: "G-1PF4DW5YQN"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();

let loginBtn = document.getElementById('login-btn');
let userPhoto = document.getElementById('user-photo');
let userNameDisplay = document.getElementById('user-name');
let userInfo = document.getElementById('user-info');

// Função para exibir as informações do usuário
function showUserInfo(user) {
    loginBtn.style.display = 'none'; // Esconde o botão de login
    userPhoto.src = user.photoURL; // Define a foto do usuário
    userNameDisplay.textContent = user.displayName; // Define o nome do usuário
    userInfo.style.display = 'flex'; // Exibe o contêiner de informações
}

// Detectar estado de login ao carregar a página
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuário está logado, exibe suas informações
        showUserInfo(user);
    } else {
        // Usuário não está logado, exibe o botão de login
        loginBtn.style.display = 'block';
        userInfo.style.display = 'none';
    }
});

loginBtn.addEventListener('click', () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            showUserInfo(user);
        })
        .catch((error) => {
            console.error('Erro durante o login:', error);
        });
});

// Função para criar blocos de nota estilo Notion
let addBlockBtn = document.getElementById('add-block-btn');
let notionContent = document.getElementById('notion-content');

addBlockBtn.addEventListener('click', () => {
    let newBlock = document.createElement('div');
    newBlock.classList.add('notion-block');

    let input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', 'Escreva sua nota...');

    newBlock.appendChild(input);
    notionContent.appendChild(newBlock);
});

