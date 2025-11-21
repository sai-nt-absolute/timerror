// Global variables
let totalTime = 0;
let remainingTime = 0;
let intervalId = null;
let breakIntervalId = null;
let isRunning = false;
let breakStartTime = 0;
let breakDuration = 0;
let isBreakTracking = false;
let breakHistory = [];
let totalBreakTime = 0;
let breakStartTimestamp = null;
let breakEndTimestamp = null;

// Update current time every second in 12-hour format
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');

    document.getElementById('currentTime').textContent =
        `Current Time: ${formattedHours}:${minutes}:${seconds} ${ampm}`;
}

// Initialize clock
updateClock();
setInterval(updateClock, 1000);

function setTimer() {
    const hours = parseInt(document.getElementById('hoursInput').value) || 0;
    const minutes = parseInt(document.getElementById('minutesInput').value) || 0;
    const seconds = parseInt(document.getElementById('secondsInput').value) || 0;

    if (hours === 0 && minutes === 0 && seconds === 0) {
        alert('Please enter a valid time');
        return;
    }

    totalTime = hours * 3600 + minutes * 60 + seconds;
    remainingTime = totalTime;
    isRunning = false;
    breakStartTime = 0;
    breakDuration = 0;
    isBreakTracking = false;
    totalBreakTime = 0;
    breakHistory = [];

    if (intervalId) clearInterval(intervalId);
    if (breakIntervalId) clearInterval(breakIntervalId);

    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('resetBtn').disabled = false;

    updateDisplay();
    updateStatus('Timer ready');
}

function startTimer() {
    if (totalTime === 0) {
        alert('Please set the timer first');
        return;
    }
    if (isRunning) return;

    isRunning = true;

    if (isBreakTracking) {
        const endTime = Date.now();
        breakDuration = Math.floor((endTime - breakStartTime) / 1000);
        breakEndTimestamp = new Date(); // Save end timestamp

        if (breakDuration > 0) {
            breakHistory.push({
                duration: breakDuration,
                start: breakStartTimestamp,
                end: breakEndTimestamp
            });
            totalBreakTime += breakDuration;
        }

        isBreakTracking = false;
        breakStartTime = 0;
        breakDuration = 0;
        breakStartTimestamp = null;
        breakEndTimestamp = null;

        if (breakIntervalId) clearInterval(breakIntervalId);
    }

    startTime = Date.now() - (totalTime - remainingTime) * 1000;

    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;

    intervalId = setInterval(updateTimer, 1000);
    updateStatus('Timer running...');
}

function pauseTimer() {
    if (!isRunning) return;

    isRunning = false;
    clearInterval(intervalId);

    breakStartTime = Date.now();
    breakStartTimestamp = new Date(); // Save start timestamp
    isBreakTracking = true;

    breakIntervalId = setInterval(updateBreakTime, 1000);

    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('startBtn').disabled = false;

    updateStatus('Break tracking started...');
}

function updateBreakTime() {
    if (isBreakTracking) {
        breakDuration = Math.floor((Date.now() - breakStartTime) / 1000);
        updateDisplay();
    }
}

function resetTimer() {
    pauseTimer();
    remainingTime = totalTime;
    breakHistory = [];
    totalBreakTime = 0;
    breakStartTime = 0;
    breakDuration = 0;
    isBreakTracking = false;
    breakStartTimestamp = null;
    breakEndTimestamp = null;

    if (intervalId) clearInterval(intervalId);
    if (breakIntervalId) clearInterval(breakIntervalId);

    updateDisplay();
    updateStatus('Timer reset');
    updateBreakHistory();
}

function updateTimer() {
    if (remainingTime > 0) {
        remainingTime--;
        updateDisplay();
    } else {
        pauseTimer();
        updateStatus('Timer completed!');
        alert('Timer completed!');
    }
}

function updateDisplay() {
    const elapsedSeconds = totalTime - remainingTime;
    const elapsedHours = Math.floor(elapsedSeconds / 3600);
    const elapsedMinutes = Math.floor((elapsedSeconds % 3600) / 60);
    const elapsedSecondsOnly = elapsedSeconds % 60;

    const remainingHours = Math.floor(remainingTime / 3600);
    const remainingMinutes = Math.floor((remainingTime % 3600) / 60);
    const remainingSeconds = remainingTime % 60;

    let currentBreakTime = totalBreakTime;
    if (isBreakTracking) currentBreakTime += breakDuration;

    const breakHours = Math.floor(currentBreakTime / 3600);
    const breakMinutes = Math.floor((currentBreakTime % 3600) / 60);
    const breakSeconds = currentBreakTime % 60;

    document.getElementById('elapsedTime').textContent =
        `${elapsedHours}h ${elapsedMinutes}m ${elapsedSecondsOnly}s`;
    document.getElementById('remainingTime').textContent =
        `${remainingHours}h ${remainingMinutes}m ${remainingSeconds}s`;
    document.getElementById('breakTime').textContent =
        `Break Time: ${breakHours}h ${breakMinutes}m ${breakSeconds}s`;

    if (totalTime > 0) {
        const progress = ((totalTime - remainingTime) / totalTime) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
    }

    updateBreakHistory();
}

function updateBreakHistory() {
    const historyContainer = document.getElementById('breakHistoryList');
    historyContainer.innerHTML = '';

    breakHistory.forEach((breakItem, index) => {
        const hours = Math.floor(breakItem.duration / 3600);
        const minutes = Math.floor((breakItem.duration % 3600) / 60);
        const seconds = breakItem.duration % 60;

        // Format timestamps
        const startTimeStr = breakItem.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const endTimeStr = breakItem.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const div = document.createElement('div');
        div.className = 'break-item';
        div.textContent = `Break ${index + 1}: ${startTimeStr} -- ${endTimeStr} | ${hours}h ${minutes}m ${seconds}s`;
        historyContainer.appendChild(div);
    });
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// Default input values
// document.getElementById('hoursInput').value = 0;
// document.getElementById('minutesInput').value = 1;
// document.getElementById('secondsInput').value = 0;
