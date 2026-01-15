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
    throw new Error("Missing coordinates");
}

/* ===============================
   TIME CHECK (DAY / NIGHT)
================================ */
const hour = new Date().getHours();
const isNight = (hour >= 19 || hour <= 4);

/* ===============================
   FETCH WEATHER
================================ */
fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
    .then(res => res.json())
    .then(data => processWeather(data))
    .catch(() => {
        document.getElementById("alertText").innerText =
            "Unable to load weather data";
    });

/* ===============================
   PROCESS WEATHER
================================ */
function processWeather(data) {
    const temp = Math.round(data.main.temp);
    const wind = data.wind.speed;
    const rain = data.rain ? data.rain["1h"] || 0 : 0;
    const pressure = data.main.pressure;
    const weather = data.weather[0].main;

    document.getElementById("temperature").innerText = `${temp}°C`;

    /* PRIORITY-BASED HAZARD LOGIC */
    if (weather === "Thunderstorm") {
        setThunderstorm();
    }
    else if (wind > 17) {
        setCyclone(wind);
    }
    else if (rain > 20 && pressure < 1000) {
        setFlood();
    }
    else if (rain > 10) {
        setRain();
    }
    else if (wind > 8) {
        setWindy(wind);
    }
    else {
        setClear();
    }

    applyRvsImpact();
}

/* ===============================
   UI STATES
================================ */
function setClear() {
    document.body.style.backgroundImage =
        isNight ? "url('../images/night.jpg')" : "url('../images/brightday.jpg')";

    document.getElementById("weatherIcon").src =
        isNight ? "../images/moon.jpg" : "../images/sun.jpg";

    document.getElementById("alertText").innerText =
        "Weather Conditions Are Normal";

    document.getElementById("currentStatus").innerText =
        isNight ? "Currently: Clear Night" : "Currently: Clear";

    document.getElementById("houseStatus").innerText =
        "No immediate threat detected for your building.";

    setLists(
        ["Stay informed", "Maintain emergency kit"],
        ["Ignore safety advisories"]
    );
}

function setWindy(speed) {
    document.body.style.backgroundImage = "url('../images/windy.jpg')";
    document.getElementById("weatherIcon").src = "../images/wind.jpg";

    document.getElementById("alertText").innerText =
        "Windy Conditions Detected";

    document.getElementById("currentStatus").innerText =
        `Currently: Windy (${speed.toFixed(1)} m/s)`;

    document.getElementById("houseStatus").innerText =
        "Loose objects and lightweight structures may be at risk.";

    setLists(
        ["Secure loose objects", "Stay indoors", "Monitor updates"],
        ["Park under trees", "Ignore warnings"]
    );
}

function setRain() {
    document.body.style.backgroundImage = "url('../images/rainy.jpg')";
    document.getElementById("weatherIcon").src = "../images/rain.jpg";

    document.getElementById("alertText").innerText =
        "Heavy Rainfall Detected";

    document.getElementById("currentStatus").innerText =
        "Currently: Heavy Rain";

    document.getElementById("houseStatus").innerText =
        "Water logging and slippery surfaces possible.";

    setLists(
        ["Stay indoors", "Avoid low areas"],
        ["Drive through flooded roads"]
    );
}

function setFlood() {
    document.body.style.backgroundImage = "url('../images/floody.jpg')";
    document.getElementById("weatherIcon").src = "../images/flood.jpg";

    document.getElementById("alertText").innerText =
        "Flood Alert";

    document.getElementById("currentStatus").innerText =
        "Currently: Flood Risk";

    document.getElementById("houseStatus").innerText =
        "Building at risk due to flooding.";

    setLists(
        ["Move to higher ground", "Turn off electricity"],
        ["Walk or drive through water"]
    );
}

function setThunderstorm() {
    document.body.style.backgroundImage = "url('../images/stormy.jpg')";
    document.getElementById("weatherIcon").src = "../images/storm.jpg";

    document.getElementById("alertText").innerText =
        "Thunderstorm Alert";

    document.getElementById("currentStatus").innerText =
        "Currently: Thunderstorm";

    document.getElementById("houseStatus").innerText =
        "Lightning and strong winds possible.";

    setLists(
        ["Stay indoors", "Unplug electronics"],
        ["Use open fields"]
    );
}

function setCyclone(speed) {
    document.body.style.backgroundImage = "url('../images/cyclone2.jpg')";
    document.getElementById("weatherIcon").src = "../images/cyclone.jpg";

    document.getElementById("alertText").innerText =
        "Severe Cyclone Alert";

    document.getElementById("currentStatus").innerText =
        `Currently: Cyclone (${speed.toFixed(1)} m/s)`;

    document.getElementById("houseStatus").innerText =
        "High risk of structural damage.";

    setLists(
        ["Stay indoors", "Follow evacuation orders"],
        ["Travel unnecessarily"]
    );
}

/* ===============================
   RVS IMPACT
================================ */
function applyRvsImpact() {
    if (isNaN(rvs)) return;

    let msg = rvs < 2.5
        ? "⚠ This building is structurally vulnerable."
        : "✔ Structural vulnerability is low.";

    document.getElementById("houseStatus").innerText += " " + msg;
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

