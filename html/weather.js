/* ===============================
   CONFIG
================================ */
const API_KEY = "56728136823a70c41a267d674f55753d";
const BACKEND = "https://YOUR_RENDER_BACKEND_URL"; // CHANGE THIS

let lat, lon, rvs;

/* ===============================
   LOAD BUILDING DATA FIRST
================================ */
fetch(`${BACKEND}/api/building/my-building`, {
    headers: {
        "Authorization": localStorage.getItem("token")
    }
})
.then(res => res.json())
.then(b => {
    if (!b || !b.latitude || !b.longitude) {
        document.getElementById("alertText").innerText =
            "Building data not found. Please fill building details.";
        return;
    }

    lat = b.latitude;
    lon = b.longitude;
    rvs = b.rvsScore;

    fetchWeather();
})
.catch(() => {
    document.getElementById("alertText").innerText =
        "Unable to load building data";
});

/* ===============================
   DAY / NIGHT CHECK
================================ */
function isNightTime() {
    const h = new Date().getHours();
    return h >= 19 || h <= 4;
}

/* ===============================
   FETCH WEATHER
================================ */
function fetchWeather() {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
        .then(res => res.json())
        .then(processWeather)
        .catch(() => {
            document.getElementById("alertText").innerText =
                "Unable to load weather data";
        });
}

/* ===============================
   PROCESS WEATHER
================================ */
function processWeather(data) {
    const temp = Math.round(data.main.temp);
    const wind = data.wind.speed;
    const rain = data.rain ? (data.rain["1h"] || 0) : 0;
    const pressure = data.main.pressure;
    const weather = data.weather[0].main;
    const night = isNightTime();

    document.getElementById("temperature").innerText = `${temp}°C`;

    if (weather === "Thunderstorm") setThunderstorm();
    else if (wind > 17) setCyclone(wind);
    else if (rain > 20 && pressure < 1000) setFlood();
    else if (rain > 10) setRain();
    else if (wind > 8) setWindy(wind);
    else setClear(night);

    applyRvsImpact();
}

/* ===============================
   UI STATES
================================ */
function setClear(night) {
    document.body.style.backgroundImage =
        night ? "url('images/night.jpg')" : "url('images/brightday.jpg')";
    document.getElementById("weatherIcon").src =
        night ? "images/moon.jpg" : "images/sun.jpg";

    document.getElementById("alertText").innerText =
        "Weather Conditions Are Normal";
    document.getElementById("currentStatus").innerText =
        night ? "Currently: Clear Night" : "Currently: Clear";
    document.getElementById("houseStatus").innerText =
        "No immediate threat detected for your building.";

    setLists(
        ["Stay informed", "Maintain emergency kit"],
        ["Ignore safety advisories"]
    );
}

function setWindy(speed) {
    setBG("windy.jpg", "wind.jpg");
    setStatus("Windy", `Windy (${speed.toFixed(1)} m/s)`);
}

function setRain() {
    setBG("rainy.jpg", "rain.jpg");
    setStatus("Heavy Rain", "Heavy rainfall detected");
}

function setFlood() {
    setBG("floody.jpg", "flood.jpg");
    setStatus("Flood Risk", "Flood alert in your area");
}

function setThunderstorm() {
    setBG("stormy.jpg", "storm.jpg");
    setStatus("Thunderstorm", "Lightning and strong winds possible");
}

function setCyclone(speed) {
    setBG("cyclone2.jpg", "cyclone.jpg");
    setStatus("Cyclone", `Severe winds (${speed.toFixed(1)} m/s)`);
}

function setBG(bg, icon) {
    document.body.style.backgroundImage = `url('images/${bg}')`;
    document.getElementById("weatherIcon").src = `images/${icon}`;
}

function setStatus(state, msg) {
    document.getElementById("alertText").innerText = msg;
    document.getElementById("currentStatus").innerText =
        `Currently: ${state}`;
}

/* ===============================
   RVS IMPACT
================================ */
function applyRvsImpact() {
    if (isNaN(rvs)) return;

    const el = document.getElementById("houseStatus");
    el.innerText += rvs < 2.5
        ? " ⚠ This building is structurally vulnerable."
        : " ✔ Structural vulnerability is low.";
}

/* ===============================
   LIST HANDLER
================================ */
function setLists(dos, donts) {
    document.getElementById("dosList").innerHTML =
        dos.map(d => `<li>• ${d}</li>`).join("");
    document.getElementById("dontsList").innerHTML =
        donts.map(d => `<li>• ${d}</li>`).join("");
}
