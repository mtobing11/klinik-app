const url = 'https://docs.google.com/spreadsheets/d/';
const ssid = '1fJV7cnNu4Lb_jqKzR15UwZqWE3VbvRoxe7qVDanE9AI';
const query1 = `/export?format=csv`;
const query2 = `&gid=761020186`;
const query3 = `&gid=559171219`;

const endpoint1 = `${url}${ssid}${query1}${query2}`;
const endpoint2 = `${url}${ssid}${query1}${query3}`;

const bookingDateInput = document.querySelector('#tanggal');
const timeVisitInput = document.querySelector('#jam_datang');
const output = document.querySelector('#output');

let session1Capacity, session2Capacity, session3Capacity, sessionChosenCapacity;
let chosenDateByCustomer;
let dayOff = [];

fetch(endpoint1)
    .then(res => res.text())
    .then(datajson => {
        return csv().fromString(datajson)
    })
    .then(data => {
        let limitBookingDate = Number(data[0].isi);
        dayOff.push(Number(data[1].isi));
        session1Capacity = Number(data[3].isi);
        session2Capacity = Number(data[4].isi);
        session3Capacity = Number(data[5].isi);

        setLimitBookingDate(limitBookingDate);
    })

// Prototype Date for limit booking date
Date.prototype.addDays = function(days){
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date
}
// limit max booking date
function setLimitBookingDate(limit){
    let today = new Date();
    let maxDay = new Date();

    maxDay = maxDay.addDays(limit);
    bookingDateInput.min = today.toISOString().substring(0, 10);
    bookingDateInput.max = maxDay.toISOString().substring(0, 10);
}

// disabled offDate
bookingDateInput.addEventListener('input', function(e){
    let dateString = this.value;
    let indexChosenDay = new Date(dateString).getUTCDay();
    let chosenDateUTC = new Date(dateString).getUTCDate();
    
    // disable weekend
    if([6,0].includes(indexChosenDay)){
        e.preventDefault();
        this.value = '';
        alert("Sabtu-Minggu kami tutup");
    }

    // disable holiday
    if(dayOff.includes(chosenDateUTC)){
        e.preventDefault();
        this.value = '';
        alert(`Tanggal ${dayOff} kami libur`);
    }
    chosenDateByCustomer = dateString;

})