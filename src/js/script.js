let formSeeRaces = document.getElementById("formSeeRaces");

let dataCircuit;
let dataDrivers;
let dataQuali;

document.addEventListener("DOMContentLoaded", function() {
    loadCircuit("Interlagos", "Race", 2024);
});

formSeeRaces.addEventListener("submit", function(e) {
    e.preventDefault();

    let formData = new FormData(this);
    let data = Object.fromEntries(formData.entries());

    loadCircuit(data["circuit"], data["typeOfSession"], data["year"]);
    
});

async function loadCircuit(circuitShortName, sessionName, year) {
    try {
        const startTime = performance.now();
        
        let response = await fetch(`https://api.openf1.org/v1/sessions?circuit_short_name=${circuitShortName}&session_name=${sessionName}&year=${year}`);
        dataCircuit = await response.json();

        let response2 = await fetch(`https://api.openf1.org/v1/drivers?session_key=${dataCircuit[0]["session_key"]}`);
        dataDrivers = await response2.json();

        let date = new Date(dataCircuit[0]["date_start"]);

        let response4 = await fetch(`https://api.openf1.org/v1/sessions?circuit_short_name=${circuitShortName}&session_name=Qualifying&date_start=${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()-1}`);
        let quali = await response4.json();

        let response3 = await fetch(`https://api.openf1.org/v1/position?session_key=${quali[0]["session_key"]}`);
        dataQuali = await response3.json();

        let lastPositions = getLastPositions(dataQuali).sort(function(a, b) {return a.position - b.position});

        addDriversToTable(dataDrivers, lastPositions);

        const endTime = performance.now();

        console.log(endTime-startTime)
    } catch(e) {
        console.log(e);
    };
};

function getLastPositions(dataQuali) {
    let latestPositions = dataQuali.reduce((acc, cur) => {
        let driver = cur["driver_number"];
        let currentTime = new Date(cur["date"]);

        if(!acc[driver] || new Date(acc[driver].date) < currentTime) {
            acc[driver] = cur;
        };

        return acc;
    }, {});

    return Object.values(latestPositions);
};

function addDriversToTable(dataDrivers, dataQuali) {
    let tableBodySeeRaces = document.getElementById("tableBodySeeRaces");
    let dataDriver;

    tableBodySeeRaces.textContent = "";

    Object.keys(dataQuali).forEach((key, index) => {
        dataDriver = Object.values(dataDrivers).find(driver => driver["driver_number"] === dataQuali[key]["driver_number"]);

        let trElement = document.createElement("tr");

        let thPosition = document.createElement("th");
        thPosition.textContent = dataDriver["driver_number"];

        let thName = document.createElement("th");
        thName.textContent = dataDriver["broadcast_name"];

        let thGapToFirst = document.createElement("th");
        thGapToFirst.textContent = "0";

        trElement.appendChild(thPosition);
        trElement.appendChild(thName);
        trElement.appendChild(thGapToFirst);

        tableBodySeeRaces.appendChild(trElement);
    });

    //console.log(dataDrivers);
};