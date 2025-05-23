let formSeeRaces = document.getElementById("formSeeRaces");
let dataSelected = document.getElementById("dataSelected");

let dataCircuit;
let dataDrivers;
let dataPositions;
let dataIntervals;
let dataLaps;

let lastDate;

document.addEventListener("DOMContentLoaded", function() {
    let firstFetchQuery = `https://api.openf1.org/v1/sessions?circuit_short_name=Interlagos&session_name=Race&year=2024`;
    loadCircuit(firstFetchQuery);
});

formSeeRaces.addEventListener("submit", function(e) {
    e.preventDefault();

    let formData = new FormData(this);
    let data = Object.fromEntries(formData.entries());

    let firstFetchQuery;
    /*if(e.submitter.name === "load-race") {
        firstFetchQuery = `https://api.openf1.org/v1/sessions?circuit_short_name=${data["circuit"]}&session_name=${data["typeOfSession"]}&year=${data["year"]}`;
        loadCircuit(firstFetchQuery);
    } else {
        firstFetchQuery = `https://api.openf1.org/v1/sessions?session_key=latest&session_name=Race`;
        loadCircuit(firstFetchQuery);
    }*/

    firstFetchQuery = `https://api.openf1.org/v1/sessions?circuit_short_name=${data["circuit"]}&session_name=${data["typeOfSession"]}&year=${data["year"]}`;
    loadCircuit(firstFetchQuery);
});

async function loadCircuit(firstFetchQuery) {
    try {
        dataSelected.textContent = "Loading data...";

        const startTime = performance.now();
        
        let response = await fetch(firstFetchQuery);
        dataCircuit = (await response.json())[0];

        if(dataCircuit == undefined) {
            alert("This combination doesn't exist");
            dataSelected.textContent = "Data combination didn't exist";
            return;
        };

        lastDate = dataCircuit["date_start"];

        [dataDrivers, dataPositions, dataIntervals, dataLaps] = await Promise.all([
            fetch(`https://api.openf1.org/v1/drivers?session_key=${dataCircuit["session_key"]}`).then(res => res.json()),
            fetch(`https://api.openf1.org/v1/position?session_key=${dataCircuit["session_key"]}`).then(res => res.json()),
            fetch(`https://api.openf1.org/v1/intervals?session_key=${dataCircuit["session_key"]}`).then(res => res.json()),
            fetch(`https://api.openf1.org/v1/laps?session_key=${dataCircuit["session_key"]}`).then(res => res.json()),
        ]);

        updateTrackAndYearElements(dataCircuit);

        let lastPositions = getFirstPositions(dataPositions).sort(function(a, b) {return a.position - b.position});

        addDriversToTable(dataDrivers, lastPositions);

        const endTime = performance.now();

        console.log(endTime-startTime);

        dataSelected.textContent = "Data has been loaded";

        setInterval(() => {
            updateTable()
        }, 3000);
    } catch(e) {
        console.log(e);
    };
};

function updateTable() {
    let firstPositions = getFirstPositions(dataPositions).sort((a, b) => a.position - b.position);

    dataDrivers.sort((a, b) => {
    const posA = firstPositions.find(p => p.driver_number === a.driver_number)?.position || Infinity;
    const posB = firstPositions.find(p => p.driver_number === b.driver_number)?.position || Infinity;
    return posA - posB;
    });

    let tableBody = document.getElementById("tableBodySeeRaces");
    tableBody.textContent = "";

    dataDrivers.forEach((driver, index) => {
        let trElement = document.createElement("tr");

        trElement.textContent = "";
        trElement.style.backgroundColor = "#" + driver["team_colour"];

        let cells = [
            index+1,
            driver["broadcast_name"].slice(2),
            driver["team_name"],
            "0.000",
            "0.000",
            "00.000",
            "00.000",
            "00.000",
            "0"
        ].map(createCell);
        
        cells.forEach(cell => trElement.appendChild(cell));

        tableBody.appendChild(trElement);
    });
};

function getFirstPositions(dataPositions) {
    let firstPositions = {};
    let removeItems = {};

    dataPositions.forEach((position, index) => {
        let driver = position["driver_number"];
        let currentTime = new Date(position["date"]);

        if(firstPositions[driver] === undefined || new Date(firstPositions[driver]["date"]) > currentTime) {
            removeItems[driver] = index;
            firstPositions[driver] = position;
            return;
        };
    });
    
    Object.values(removeItems).sort((a, b) => b - a).forEach(i => {
        dataPositions.splice(i, 1);
    });

    return Object.values(firstPositions);
};

function updateTrackAndYearElements(dataCircuit) {
    let h2Track = document.getElementById("h2Track");
    let h2Year = document.getElementById("h2Year");

    h2Track.textContent = "Track: " + dataCircuit["circuit_short_name"];
    h2Year.textContent = "Year: " + dataCircuit["year"];
};

function addDriversToTable(dataDrivers, dataPositions) {
    let tableBodySeeRaces = document.getElementById("tableBodySeeRaces");
    let dataDriver;

    tableBodySeeRaces.textContent = "";

    Object.keys(dataPositions).forEach((key, index) => {
        dataDriver = Object.values(dataDrivers).find(driver => driver["driver_number"] === dataPositions[key]["driver_number"]);

        let trElement = document.createElement("tr");

        trElement.style.backgroundColor = "#" + dataDriver["team_colour"];

        let cells = [
            index+1,
            dataDriver["broadcast_name"].slice(2),
            dataDriver["team_name"],
            "0.000",
            "0.000",
            "00.000",
            "00.000",
            "00.000",
            "0"
        ].map(createCell);

        cells.forEach(cell => trElement.appendChild(cell));

        tableBodySeeRaces.appendChild(trElement);
    });
};

function createCell(text) {
    let thElement = document.createElement("th");
    thElement.textContent = text;

    return thElement;
};