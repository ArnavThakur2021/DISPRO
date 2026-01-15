/* ===============================
   CONFIG
================================ */
const API_KEY = "56728136823a70c41a267d674f55753d";

/* ===============================
   READ URL PARAMETERS
================================ */
const params = new URLSearchParams(window.location.search);
const lat = params.get("lat");
const lon = params.get("lon");
const rvs = parseFloat(params.get("rvs"));

if (!lat || !lon) {
    document.getElementById("alertText").innerText =
        "Location data not provided";
    throw new Error("Missing latitude or longitude");
}

/* ===============================
   FETCH WEATHER DATA
================================ */
fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
    .then(res => {
        if (!res.ok) throw new Error("Weather API error");
        return res.json();
    })
    .then(data => processWeather(data))
    .catch(err => {
        console.error(err);
        document.getElementById("alertText").innerText =
            "Unable to load weather data";
    });

/* ===============================
   PROCESS WEATHER
================================ */
function processWeather(data) {
    const temp = Math.round(data.main.temp);
    const windSpeed = data.wind.speed;       // m/s
    const weatherMain = data.weather[0].main;
    const pressure = data.main.pressure;

    document.getElementById("temperature").innerText = `${temp}°C`;

    // Priority-based hazard detection
    if (weatherMain === "Thunderstorm" || windSpeed > 15) {
        setCyclone(windSpeed);
    } else if (windSpeed > 8) {
        setWindy(windSpeed);
    } else {
        setSafe();
    }

    // Combine with RVS
    applyRvsImpact();
}

/* ===============================
   UI STATES
================================ */
function setSafe() {
    document.body.style.backgroundImage = "url('images/brightday.jpg')";
    document.getElementById("alertText").innerText =
        "Weather Conditions Are Normal";
    document.getElementById("currentStatus").innerText =
        "Currently: Safe";
    document.getElementById("houseStatus").innerText =
        "No immediate threat detected for your building.";

    setLists(
        ["Stay informed", "Maintain emergency kit"],
        ["Ignore safety advisories"]
    );
}

function setWindy(speed) {
    document.body.style.backgroundImage = "url('images/windy.jpg')";
    document.getElementById("alertText").innerText =
        "Windy Conditions Detected In Your Area";
    document.getElementById("currentStatus").innerText =
        `Currently: Windy (${speed.toFixed(1)} m/s)`;
    document.getElementById("houseStatus").innerText =
        "Your house is safe, but unsecured elements may be at risk.";

    setLists(
        ["Secure loose objects", "Stay indoors if possible", "Charge devices", "Monitor updates"],
        ["Go outside unnecessarily", "Park under trees", "Use umbrellas", "Ignore warnings"]
    );
}

function setCyclone(speed) {
    document.body.style.backgroundImage = "url('images/cyclone2.jpg')";
    document.getElementById("alertText").innerText =
        "Severe Weather Alert";
    document.getElementById("currentStatus").innerText =
        `Currently: Severe Wind (${speed.toFixed(1)} m/s)`;
    document.getElementById("houseStatus").innerText =
        "Structural damage risk possible. Stay alert and prepared.";

    setLists(
        ["Stay indoors", "Move to safer rooms", "Follow official advisories"],
        ["Travel unnecessarily", "Stand near windows", "Ignore evacuation notices"]
    );
}

/* ===============================
   APPLY RVS IMPACT
================================ */
function applyRvsImpact() {
    if (isNaN(rvs)) return;

    let message = "";

    if (rvs < 2.0) {
        message =
            "⚠ Due to low RVS score, this building is highly vulnerable during disasters.";
    } else if (rvs < 3.0) {
        message =
            "⚠ Moderate structural vulnerability detected based on RVS assessment.";
    } else {
        message =
            "✔ Structural vulnerability is low based on RVS assessment.";
    }

    const houseStatus = document.getElementById("houseStatus");
    houseStatus.innerText += " " + message;
}

/* ===============================
   DOs & DON'Ts LIST HANDLER
================================ */
function setLists(dos, donts) {
    const dosList = document.getElementById("dosList");
    const dontsList = document.getElementById("dontsList");

    dosList.innerHTML = "";
    dontsList.innerHTML = "";

    dos.forEach(item => {
        dosList.innerHTML += `<li>• ${item}</li>`;
    });

    donts.forEach(item => {
        dontsList.innerHTML += `<li>• ${item}</li>`;
    });
}
