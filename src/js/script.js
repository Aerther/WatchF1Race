let formSeeRaces = document.getElementById("formSeeRaces");

let dataWork;

formSeeRaces.addEventListener("submit", function(e) {
    e.preventDefault();

    let formData = new FormData(this);
    let data = Object.fromEntries(formData.entries());

    loadRace(data["circuit"], data["typeOfSession"], data["year"]);
    
});

async function loadRace(circuitShortName, sessionName, year) {
    try {
        const startTime = performance.now();
        let response = await fetch(`https://api.openf1.org/v1/sessions?circuit_short_name=${circuitShortName}&session_name=${sessionName}&year=${year}`);
        dataWork = await response.json();
        let response2 = await fetch(`https://api.openf1.org/v1/position?session_key=${dataWork[0]["session_key"]}&driver_number=1`).then(response => response.json());
        let response3 = await fetch(`https://api.openf1.org/v1/laps?session_key=${dataWork[0]["session_key"]}`).then(response => response.json());

        console.log(response3)
        const endTime = performance.now()
        console.log(endTime-startTime);
    } catch(e) {
        console.log(e);
    };
};