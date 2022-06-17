const url = 'https://docs.google.com/spreadsheets/d/';
const ssid = '1fJV7cnNu4Lb_jqKzR15UwZqWE3VbvRoxe7qVDanE9AI';
const query1 = `/export?format=csv`;
const query2 = `&gid=761020186`;
const query3 = `&gid=559171219`;

const endpoint1 = `${url}${ssid}${query1}${query2}`;
const endpoint2 = `${url}${ssid}${query1}${query3}`;

const nameInput = document.querySelector('#uname');
const phoneInput = document.querySelector('#unumber');
const bookingDateInput = document.querySelector('#tanggal');
const timeVisitInput = document.querySelector('#jam_datang');
const output = document.querySelector('#output');
const button = document.querySelector('#submitBtn');

let session1Capacity, session2Capacity, session3Capacity, sessionChosenByCustomer;
let chosenDateByCustomer;
let dayOff = [];
let disabledButton = true;

// memasukkan parameter
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
        button.disabled = disabledButton;
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
        return lert("Sabtu-Minggu kami tutup");
    }

    // disable holiday
    if(dayOff.includes(chosenDateUTC)){
        e.preventDefault();
        this.value = '';
        return alert(`Tanggal ${dayOff} kami libur`);
    }
    chosenDateByCustomer = dateString;
})

// chose booking time, and then check availability
timeVisitInput.addEventListener('input', function(e){
    // before chose time to visit, make sure to choose date first
    if(!chosenDateByCustomer){
        e.preventDefault();
        this.value = '';
        return alert('Harap isi tanggal kunjungan');
    }
    sessionChosenByCustomer = this.value;
    disabledButton = true;
    button.disabled = disabledButton;
    checkAvailibility(e);
})

// submit and intercept event so the user isn't redirected to webapp
window.addEventListener("load", function(){
    const form = document.getElementById('booking-form');
    form.addEventListener('submit', function(e){
        e.preventDefault();
        const currData = new FormData(form);
        const action = e.target.action;
        fetch(action, {
            method: 'POST',
            body: currData
        })
        .then(()=>{
            alert("Booking sudah berhasil");
            nameInput.value = "";
            phoneInput.value = "";
            bookingDateInput.value = "";
            timeVisitInput.value = "";
        })
    })
})

// Check Availibility
function checkAvailibility(e){
    // take data from database
    fetch(endpoint2)
        .then(res => res.text())
        .then(datajson => {
            return csv().fromString(datajson)
        })
        .then(data => {
            let sessionCapacity = sessionChosenByCustomer == 'session1' ? session1Capacity : sessionChosenByCustomer ? session2Capacity : session3Capacity;
            let count = 0;
            let customerPhone = phoneInput.value; 
            data.forEach(booking => {
                if(booking.tanggal == chosenDateByCustomer && booking.jam_datang == sessionChosenByCustomer){
                    count++;
                    if(customerPhone == `0${booking.telpon}`){
                        e.preventDefault();
                        timeVisitInput.value = '';
                        return alert('No Telpon ini sudah terdaftar di tanggal dan jam ini.')
                    }
                }
            })
            if(count >= sessionCapacity){
                e.preventDefault();
                timeVisitInput.value = '';
                // console.log(`penuh, sudah terisi: ${count}`);
                alert('Jam ini sudah penuh, coba pilih jam lain');

                // const div = document.createElement('div');
                // div.textContent = 'Sudah Fullbooked, pilih jam atau hari lain';
                // div.classList.add('box');
                // div.classList.add('danger');
                // output.append(div);
            } else {
                // console.log(`tidak penuh, baru ada: ${count}`);
                disabledButton = false;
                button.disabled = disabledButton;
            }
        })

}