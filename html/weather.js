

const params = new URLSearchParams(window.location.search);
let lat = params.get("lat");
let lon = params.get("lon");
let rvs = parseFloat(params.get("rvs"));
let geo=params.get("geo");
const USER_ID = "demoUser"; 

if (!lat || !lon) {
    loadBuildingFromBackend();
    
}else {
    fetchWeather();
}

function loadBuildingFromBackend() {
    fetch(`http://localhost:5000/api/building/${USER_ID}`)
        .then(res => res.json())
        .then(data => {
            if (!data || !data.lat || !data.lon) {
                document.getElementById("alertText").innerHTML =
                    "❌ <b>No saved building data found.</b>";
                return;
            }

            lat = data.lat;
            lon = data.lon;
            rvs = data.rvsScore;
            geo = data.geo;

            fetchWeather();
        })
        .catch(() => {
            document.getElementById("alertText").innerHTML =
                "❌ <b>Failed to load saved building data.</b>";
        });
}

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
    fetch(`http://localhost:5000/api/weather?lat=${lat}&lon=${lon}`)

        .then(res => res.json())
        .then(processWeather)
        .catch(() => {
            document.getElementById("alertText").innerText =
                "⚠️ Unable to load weather data. Please try again later.";
        });
}


/* ===============================
   PROCESS WEATHER
================================ */
function processWeather(data) {
    const weatherData = data.weather;
    const geoRisk = data.geoRisk || {};
    rvs = data.rvs;

    const temp = Math.round(weatherData.main.temp);
    const wind = weatherData.wind.speed;
    const rain = weatherData.rain ? (weatherData.rain["1h"] || 0) : 0;
    const pressure = weatherData.main.pressure;
    const condition = weatherData.weather[0].main;
    const night = isNightTime();

    document.getElementById("temperature").innerText = `${temp}°C`;

    let alertLevel = 0;

    // Structural vulnerability
    if (rvs < 2.5) alertLevel += 0.8;

    // Geographical risks FROM BACKEND
    alertLevel += geoRisk.earthquake || 0;
    alertLevel += geoRisk.flood || 0;
    alertLevel += geoRisk.landslide || 0;
    alertLevel += geoRisk.wildfire || 0;
    alertLevel += geoRisk.hurricane || 0;

    // Weather amplification
    if (condition === "Thunderstorm") alertLevel += 0.6;
    if (wind > 15) alertLevel += 0.5;
    if (rain > 20) alertLevel += 0.6;

    // Alert tier
    if (alertLevel >= 2.0) {
        setHighAlert();
    } else if (alertLevel >= 1.0) {
        setModerateAlert();
    } else {
        setSafe();
    }

    // Visual state
    if (condition === "Thunderstorm") setThunderstorm();
    else if (wind > 19) setCyclone(wind);
    else if (rain > 20 && pressure < 1000) setFlood();
    else if (rain > 10) setRain();
    else if (wind > 12) setWindy(wind);
    else setClear(night);

    applyRvsGeo();
}


/* ===============================
   UI STATES
================================ */
function setClear(night) {
    document.body.style.backgroundImage =
        night ? "url('../images/night.jpg')" : "url('../images/brightday.jpg')";
    document.getElementById("weatherIcon").src =
        night ? "../images/moon.jpg" : "../images/sun.jpg";

    document.getElementById("alertText").innerText =
        "✅ Weather Conditions Are Normal";
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
    setBG("../windy.jpg", "../wind.jpg");
    setStatus("🌬 Windy", `Windy (${speed.toFixed(1)} m/s)`);
    setLists(
    ["Secure loose objects","Stay indoors"],
    ["Park under trees"]
    );
}

function setRain() {
    setBG("../rainy.jpg", "../rain.jpg");
    setStatus("🌧 Heavy Rain", "Heavy rainfall detected");
    setLists(
["Avoid low areas","Stay indoors"],
["Drive through water"]
);
}

function setFlood() {
    setBG("../floody.jpg", "../flood.jpg");
    setStatus("🌊 Flood Risk", "Flood alert in your area");
    setLists(
["Move to higher ground","Turn off electricity"],
["Walk or drive through floodwater"]
);
}

function setThunderstorm() {
    setBG("../stormy.jpg", "../storm.jpg");
    setStatus("⛈ Thunderstorm", "Lightning and strong winds possible");
}

function setCyclone(speed) {
    setBG("../cyclone2.jpg", "../cyclone.jpg");
    setStatus("🌀 Cyclone", `Severe winds (${speed.toFixed(1)} m/s)`);
    setLists(
["Follow official advisories","Move to safe shelter"],
["Travel unnecessarily"]
);
}

function setBG(bg, icon) {
    document.body.style.backgroundImage = `url('../images/${bg}')`;
    document.getElementById("weatherIcon").src = `../images/${icon}`;
}

function setStatus(state, msg) {
    document.getElementById("alertText").innerText = msg;
    document.getElementById("currentStatus").innerText =
        `Currently: ${state}`;
}

/* ===============================
   RVS IMPACT
================================ */
function applyRvsGeo() {
    let msg="";
    if(rvs<2.5){
        msg+="⚠ Structurally vulnerable. \n";
    }
    else{
        msg += " ✔ Structural vulnerability is low.";
    } 
    msg += "📍 Risk assessment includes seismic, flood, and landslide factors.";
    document.getElementById("houseStatus").innerText=msg;
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

function setHighAlert() {
    document.getElementById("alertText").innerHTML =
        "🚨 <b>HIGH MULTI-HAZARD RISK</b>";
}

function setModerateAlert() {
    document.getElementById("alertText").innerHTML =
        "⚠️ <b>MODERATE DISASTER RISK</b>";
}
