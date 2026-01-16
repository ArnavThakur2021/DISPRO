/* ===============================
   CONFIG & INITIALIZATION (DEBUG-FRIENDLY)
================================ */
// NOTE: For production, do NOT store secret API keys in client JS.
// Consider using the proxy route included below.
const API_KEY = "75a24e92e0508b4b75dff2442372d69a";
const BACKEND = "http://localhost:5000";
let lat, lon, rvs, buildingUse;

/* ===============================
   UTIL: fetch with timeout
================================ */
async function fetchWithTimeout(resource, options = {}, timeout = 12000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const res = await fetch(resource, { ...options, signal: controller.signal });
        clearTimeout(id);
        return res;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
}

/* ===============================
   UTIL: retry wrapper (exponential backoff)
================================ */
async function retry(fn, attempts = 3, baseDelay = 700) {
    let lastErr;
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        } catch (err) {
            lastErr = err;
            const wait = baseDelay * Math.pow(2, i);
            console.warn(`Retry ${i + 1}/${attempts} failed, waiting ${wait}ms`, err);
            await new Promise(r => setTimeout(r, wait));
        }
    }
    throw lastErr;
}

/* ===============================
   SMALL UI HELPERS
================================ */
function updateAlertStatus(msg) {
    const el = document.getElementById("alertText");
    if (el) el.innerText = msg;
    console.warn("ALERT:", msg);
}
function updateStatus(state, msg) {
    const el = document.getElementById("alertText");
    if (el) el.innerText = msg;
    const cur = document.getElementById("currentStatus");
    if (cur) cur.innerText = `Current Status: ${state}`;
}
function setBG(bg, icon) {
    document.body.style.backgroundImage = `url('images/${bg}')`;
    const wi = document.getElementById("weatherIcon");
    if (wi) wi.src = `images/${icon}`;
}
function setLists(dos, donts) {
    const dosEl = document.getElementById("dosList");
    const dontsEl = document.getElementById("dontsList");
    if (dosEl) dosEl.innerHTML = dos.map(d => `<li>• ${d}</li>`).join("");
    if (dontsEl) dontsEl.innerHTML = donts.map(d => `<li>• ${d}</li>`).join("");
}

/* ===============================
   GEOLOCATION PROMISE
================================ */
function getCurrentPositionPromise(options = {}) {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error("Geolocation not available"));
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
}

/* ===============================
   INIT: load building telemetry or fallback to browser geo
================================ */
async function initDISPRO() {
    try {
        const token = localStorage.getItem("token");
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};

        const res = await fetchWithTimeout(`${BACKEND}/api/building/my-building`, { headers }, 10000);
        if (!res.ok) {
            console.warn("/api/building/my-building returned", res.status, res.statusText);
            updateAlertStatus("Unable to load building telemetry from server — trying browser location.");
            await useBrowserLocationAndStart();
            return;
        }

        const b = await res.json();
        if (!b || !b.latitude || !b.longitude) {
            updateAlertStatus("Building telemetry missing — trying browser location.");
            await useBrowserLocationAndStart();
            return;
        }

        lat = b.latitude;
        lon = b.longitude;
        rvs = parseFloat(b.rvs_score);
        buildingUse = b.building_use;

        updateAlertStatus("Loaded building telemetry. Fetching weather...");
        await fetchWeatherWithRetries();
        setInterval(fetchWeatherWithRetries, 900000); // poll every 15 minutes
    } catch (err) {
        console.error("initDISPRO error:", err);
        updateAlertStatus("System offline or blocked. Trying browser geolocation...");
        await useBrowserLocationAndStart();
    }
}

async function useBrowserLocationAndStart() {
    try {
        const pos = await getCurrentPositionPromise({ timeout: 10000 });
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
        updateAlertStatus("Using browser-provided location for weather.");
        await fetchWeatherWithRetries();
        setInterval(fetchWeatherWithRetries, 900000);
    } catch (geoErr) {
        console.error("Geolocation fallback failed:", geoErr);
        updateAlertStatus("Location unavailable. Please save building details or enable geolocation.");
    }
}

/* ===============================
   WEATHER FETCH + ERROR DIAGNOSTICS
================================ */
async function fetchWeatherOnce() {
    if (!lat || !lon) throw new Error("No location (lat/lon) available for weather fetch.");

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&units=metric&appid=${encodeURIComponent(API_KEY)}`;
    console.log("Fetching weather:", url);

    // Use timeout wrapper to detect hung requests
    const res = await fetchWithTimeout(url, {}, 12000);

    // If network-level non-OK
    if (!res.ok) {
        // try to read JSON/text body for diagnostics
        let bodyText = "";
        try { bodyText = await res.text(); } catch (e) { /* ignore */ }
        const msg = `Weather API HTTP ${res.status} ${res.statusText} - ${bodyText}`;
        const err = new Error(msg);
        err.status = res.status;
        err.body = bodyText;
        throw err;
    }

    // parse JSON
    const data = await res.json();

    // OpenWeather returns non-200 code in body for some errors
    if (data.cod && data.cod !== 200 && data.cod !== "200") {
        const msg = `OpenWeather error: ${data.cod} ${data.message || JSON.stringify(data)}`;
        const err = new Error(msg);
        err.body = data;
        throw err;
    }

    return data;
}

async function fetchWeatherWithRetries() {
    try {
        updateAlertStatus("Fetching real-time weather...");
        const data = await retry(() => fetchWeatherOnce(), 3, 700);
        processWeather(data);
    } catch (err) {
        console.error("Final weather fetch error:", err);
        // Provide specific suggestions to help debugging
        if (err.status === 401 || (err.body && err.body.message && /invalid api key/i.test(err.body.message))) {
            updateAlertStatus("Weather API Error: Invalid API key (401). Replace API_KEY or use backend proxy.");
        } else if (err.status === 429 || (err.body && /limit/i.test(JSON.stringify(err.body)))) {
            updateAlertStatus("Weather API Error: Rate limit exceeded (429). Try again later or use a different key.");
        } else if (err.name === 'AbortError') {
            updateAlertStatus("Weather API Error: Request timed out.");
        } else if (err.message && err.message.includes("No location")) {
            updateAlertStatus("Location missing. Save building details or enable geolocation.");
        } else {
            // Generic message with console log for details
            updateAlertStatus("Unable to fetch weather. See console for details.");
        }
    }
}

/* ===============================
   RISK ANALYSIS & UI (kept as original logic + some guards)
================================ */
function processWeather(data) {
    try {
        if (!data || !data.main) {
            console.error("processWeather got invalid data:", data);
            updateAlertStatus("Received invalid weather data.");
            return;
        }

        const temp = Math.round(data.main.temp);
        const wind = data.wind ? data.wind.speed : 0;
        const rain = data.rain ? (data.rain["1h"] || data.rain["3h"] || 0) : 0;
        const weatherMain = data.weather && data.weather[0] ? data.weather[0].main : "Clear";
        const isNight = isNightTime();

        document.getElementById("temperature").innerText = `${temp}°C`;

        if (temp > 40) setHeatWave(temp);
        else if (wind > 17) setCyclone(wind);
        else if (rain > 20) setFloodRisk();
        else if (weatherMain === "Thunderstorm") setThunderstorm();
        else if (temp < 5 && rain > 5) setLandslideWarning();
        else setNormalConditions(isNight);

        applyVulnerabilityImpact();
    } catch (err) {
        console.error("processWeather error:", err);
        updateAlertStatus("Error processing weather data.");
    }
}

/* ===============================
   UI STATE HELPERS (kept existing)
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
function setThunderstorm() {
    setBG("thunder.jpg", "thunder_icon.jpg");
    updateStatus("Thunderstorm", "Severe thunderstorm conditions detected.");
    setLists(
        ["Stay indoors", "Avoid tall objects", "Unplug sensitive electronics"],
        ["Using wired phones", "Standing under trees"]
    );
}
function setLandslideWarning() {
    setBG("landslide.jpg", "landslide_icon.jpg");
    updateStatus("Landslide Risk", "Persistent heavy rainfall and low temperatures detected.");
    setLists(
        ["Evacuate if advised", "Avoid slopes and foothills"],
        ["Driving near hills", "Ignoring evacuation orders"]
    );
}

/* ===============================
   VULNERABILITY OVERLAY
================================ */
function applyVulnerabilityImpact() {
    if (isNaN(rvs)) return;
    const el = document.getElementById("houseStatus");
    const isVulnerable = rvs < 2.5;
    if (isVulnerable) {
        el.innerHTML = `<span style="color:#e74c3c">⚠ CRITICAL: Structure is highly vulnerable to local hazards.</span>`;
        const dos = document.getElementById("dosList");
        if (dos) dos.innerHTML += `<li style="color:#e74c3c">• IMMEDIATE: Identify nearest public shelter.</li>`;
    } else {
        el.innerHTML = `<span style="color:#2ecc71">✔ SECURE: Structural safety rating is adequate.</span>`;
    }
}

/* ===============================
   UTIL: isNightTime + Start
================================ */
function isNightTime() {
    const h = new Date().getHours();
    return h >= 19 || h <= 5;
}

initDISPRO();