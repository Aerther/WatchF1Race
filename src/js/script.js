let formSeeRaces = document.getElementById("formSeeRaces");

let dataCircuit;
let dataDrivers;
let dataQuali;

document.addEventListener("DOMContentLoaded", function() {
    let firstFetchQuery = `https://api.openf1.org/v1/sessions?circuit_short_name=Interlagos&session_name=Race&year=2024`;
    loadCircuit(firstFetchQuery);
});

formSeeRaces.addEventListener("submit", function(e) {
    e.preventDefault();

    let formData = new FormData(this);
    let data = Object.fromEntries(formData.entries());

    let firstFetchQuery;
    if(e.submitter.name === "load-race") {
        firstFetchQuery = `https://api.openf1.org/v1/sessions?circuit_short_name=${data["circuit"]}&session_name=${data["typeOfSession"]}&year=${data["year"]}`;
        loadCircuit(firstFetchQuery);
    } else {
        firstFetchQuery = `https://api.openf1.org/v1/sessions?session_key=latest&session_name=Race`;
        loadCircuit(firstFetchQuery);
    }
});

async function loadCircuit(firstFetchQuery) {
    try {
        const startTime = performance.now();
        
        let response = await fetch(firstFetchQuery);
        dataCircuit = (await response.json())[0];

        let response2 = await fetch(`https://api.openf1.org/v1/drivers?session_key=${dataCircuit["session_key"]}`);
        dataDrivers = await response2.json();

        let response3 = await fetch(`https://api.openf1.org/v1/position?session_key=${dataCircuit["session_key"]}`);
        dataQuali = await response3.json();

        updateTrackAndYearElements(dataCircuit);

        let lastPositions = getFirstPositions(dataQuali).sort(function(a, b) {return a.position - b.position});

        addDriversToTable(dataDrivers, lastPositions);

        const endTime = performance.now();

        console.log(endTime-startTime)
    } catch(e) {
        console.log(e);
    };
};

function getFirstPositions(dataQuali) {
    let latestPositions = dataQuali.reduce((acc, cur) => {
        let driver = cur["driver_number"];
        let currentTime = new Date(cur["date"]);

        if(!acc[driver] || new Date(acc[driver].date) > currentTime) {
            acc[driver] = cur;
        };

        return acc;
    }, {});

    return Object.values(latestPositions);
};

function updateTrackAndYearElements(dataCircuit) {
    let h2Track = document.getElementById("h2Track");
    let h2Year = document.getElementById("h2Year");

    h2Track.textContent = "Track: " + dataCircuit["circuit_short_name"];
    h2Year.textContent = "Year: " + dataCircuit["year"];
};

function addDriversToTable(dataDrivers, dataQuali) {
    let tableBodySeeRaces = document.getElementById("tableBodySeeRaces");
    let dataDriver;

    tableBodySeeRaces.textContent = "";

    Object.keys(dataQuali).forEach((key, index) => {
        dataDriver = Object.values(dataDrivers).find(driver => driver["driver_number"] === dataQuali[key]["driver_number"]);

        let trElement = document.createElement("tr");

        let thPosition = document.createElement("th");
        thPosition.textContent = index+1;

        let thName = document.createElement("th");
        thName.textContent = dataDriver["broadcast_name"].slice(2);

        let thTeamName = document.createElement("th");
        thTeamName.textContent = dataDriver["team_name"];

        let thGapToFront = document.createElement("th");
        thGapToFront.textContent = "0.000";

        let thGapToFirst = document.createElement("th");
        thGapToFirst.textContent = "0.000";

        let thSector1 = document.createElement("th");
        thSector1.textContent = "00.000";

        let thSector2 = document.createElement("th");
        thSector2.textContent = "00.000";

        let thSector3 = document.createElement("th");
        thSector3.textContent = "00.000";

        trElement.appendChild(thPosition);
        trElement.appendChild(thName);
        trElement.appendChild(thTeamName);
        trElement.appendChild(thGapToFront);
        trElement.appendChild(thGapToFirst);
        trElement.appendChild(thSector1);
        trElement.appendChild(thSector2);
        trElement.appendChild(thSector3);

        tableBodySeeRaces.appendChild(trElement);
    });
};