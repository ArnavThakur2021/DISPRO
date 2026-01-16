/* ===============================
   CONFIG & INITIALIZATION
================================ */
const API_KEY = "75a24e92e0508b4b75dff2442372d69a";
const BACKEND = "http://localhost:5000";
let lat, lon, rvs, buildingUse;

/**
 * INITIALIZATION: Load Building Telemetry
 * Fetches specific vulnerability data to personalize alerts.
 */
async function initDISPRO() {
    try {
        const response = await fetch(`${BACKEND}/api/building/my-building`, {
            headers: { "Authorization": localStorage.getItem("token") }
        });
        const b = await response.json();

        if (!b || !b.latitude || !b.longitude) {
            updateAlertStatus("Building telemetry missing. Please complete assessment.");
            return;
        }

        lat = b.latitude;
        lon = b.longitude;
        rvs = parseFloat(b.rvs_score);
        buildingUse = b.building_use;

        fetchWeather();
        // Poll weather every 15 minutes for real-time protection
        setInterval(fetchWeather, 900000); 
    } catch (err) {
        updateAlertStatus("System Offline: Unable to load building telemetry.");
    }
}

/* ===============================
   WEATHER INTEGRATION
================================ */
async function fetchWeather() {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        processWeather(data);
    } catch (err) {
        updateAlertStatus("Sensor Error: Unable to fetch real-time weather data.");
    }
}

/* ===============================
   RISK ANALYSIS ENGINE
================================ */
function processWeather(data) {
    const temp = Math.round(data.main.temp);
    const wind = data.wind.speed; // m/s
    const rain = data.rain ? (data.rain["1h"] || 0) : 0;
    const weatherMain = data.weather[0].main;
    const isNight = isNightTime();

    document.getElementById("temperature").innerText = `${temp}°C`;

    // Hazard Detection Logic
    if (temp > 40) setHeatWave(temp);
    else if (wind > 17) setCyclone(wind);
    else if (rain > 20) setFloodRisk();
    else if (weatherMain === "Thunderstorm") setThunderstorm();
    else if (temp < 5 && rain > 5) setLandslideWarning();
    else setNormalConditions(isNight);

    applyVulnerabilityImpact();
}

/* ===============================
   DYNAMIC UI STATES
================================ */

function setNormalConditions(night) {
    setBG(night ? "night.jpg" : "brightday.jpg", night ? "moon.jpg" : "sun.jpg");
    updateStatus("Normal", "Atmospheric conditions are currently stable.");
    setLists(
        ["Monitor local news", "Check emergency supplies"],
        ["Ignore system updates"]
    );
}

function setHeatWave(temp) {
    setBG("heatwave.jpg", "heat.jpg");
    updateStatus("Heat Wave", `Extreme Temperature detected: ${temp}°C`);
    setLists(
        ["Stay hydrated", "Use cooling centers", "Check on elderly neighbors"],
        ["Outdoor activities", "Leaving children in vehicles"]
    );
}

function setCyclone(speed) {
    const intensity = speed > 32 ? "Severe" : "Moderate";
    setBG("cyclone.jpg", "wind.jpg");
    updateStatus(`${intensity} Cyclone`, `High wind speeds: ${speed} m/s`);
    setLists(
        ["Secure loose objects", "Move to interior rooms", "Switch off utilities"],
        ["Standing near windows", "Driving during peak winds"]
    );
}

function setFloodRisk() {
    setBG("flood.jpg", "rain.jpg");
    updateStatus("Flood Alert", "Heavy precipitation detected; risk of flash flooding.");
    setLists(
        ["Move to higher ground", "Pack essential documents", "Follow evacuation routes"],
        ["Walking through floodwaters", "Driving over submerged roads"]
    );
}

/* ===============================
   VULNERABILITY OVERLAY
================================ */
function applyVulnerabilityImpact() {
    if (isNaN(rvs)) return;

    const el = document.getElementById("houseStatus");
    const isVulnerable = rvs < 2.5;

    // Logic: Personalized alerts based on building-specific telemetry
    if (isVulnerable) {
        el.innerHTML = `<span style="color:#e74c3c">⚠ CRITICAL: Structure is highly vulnerable to local hazards.</span>`;
        // Inject mandatory "Do" for vulnerable structures
        const dos = document.getElementById("dosList");
        dos.innerHTML += `<li style="color:#e74c3c">• IMMEDIATE: Identify nearest public shelter.</li>`;
    } else {
        el.innerHTML = `<span style="color:#2ecc71">✔ SECURE: Structural safety rating is adequate.</span>`;
    }
}

/* ===============================
   UTILITIES
================================ */
function isNightTime() {
    const h = new Date().getHours();
    return h >= 19 || h <= 5;
}

function setBG(bg, icon) {
    document.body.style.backgroundImage = `url('images/${bg}')`;
    document.getElementById("weatherIcon").src = `images/${icon}`;
}

function updateStatus(state, msg) {
    document.getElementById("alertText").innerText = msg;
    document.getElementById("currentStatus").innerText = `Current Status: ${state}`;
}

function updateAlertStatus(msg) {
    document.getElementById("alertText").innerText = msg;
}

function setLists(dos, donts) {
    document.getElementById("dosList").innerHTML = dos.map(d => `<li>• ${d}</li>`).join("");
    document.getElementById("dontsList").innerHTML = donts.map(d => `<li>• ${d}</li>`).join("");
}

// Start DISPRO Core
initDISPRO();