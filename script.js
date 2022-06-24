const url = 'https://docs.google.com/spreadsheets/d/';
const ssid = '1fJV7cnNu4Lb_jqKzR15UwZqWE3VbvRoxe7qVDanE9AI';
const query1 = `/export?format=csv`;
const query2 = `&gid=761020186`;
const query3 = `&gid=559171219`;
const query4 = `&gid=117909431`;

const endpoint1 = `${url}${ssid}${query1}${query2}`;
const endpoint2 = `${url}${ssid}${query1}${query3}`;
const endpoint3 = `${url}${ssid}${query1}${query4}`;

const nameInput = document.querySelector('#uname');
const phoneInput = document.querySelector('#unumber');
const bookingDateInput = document.querySelector('#tanggal');
const timeVisitInput = document.querySelector('#jam_datang');
const output = document.querySelector('#output');
const button = document.querySelector('#submitBtn');
const timestamp = document.querySelector('#timestamp');

let session1Capacity, session2Capacity, session3Capacity, sessionChosenByCustomer;
let chosenDateByCustomer;
let dayOff = [];
let maxDayLimit = 1;
let disabledButton = true;
let todayOpen = true;
let dataCountBooking;
let dataInChosenDate;

// memasukkan parameter
function parameterInput(){
    fetch(endpoint1)
        .then(res => res.text())
        .then(datajson => {
            return csv().fromString(datajson)
        })
        .then(data => {
            maxDayLimit = Number(data[0].value);
            dayOff.push(data[1].value);
            session1Capacity = Number(data[3].value);
            session2Capacity = Number(data[4].value);
            session3Capacity = Number(data[5].value);
            // console.log(data);
            // button.disabled = disabledButton;

            if(data[6].value == 'N' || data[6].value == 'n'){
                todayOpen = false;
            } else {
                todayOpen = true;
            }
        })
        .then(() =>{
            setLimitBookingDate(maxDayLimit);
        })
}

function getAlreadyBookedData(){

    fetch(endpoint3)
    .then(res => res.text())
    .then(datajson => csv().fromString(datajson))
    .then(data => {
        dataCountBooking = data;
        console.log(dataCountBooking);
    })
}

parameterInput();
getAlreadyBookedData();

// Prototype Date for limit booking date
Date.prototype.addDays = function(days){
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date
}
// limit max booking date
function setLimitBookingDate(limit){
    let today = new Date();
    let maxDay = today.addDays(limit);

    settingCalendar(maxDay);
}

// chosen date by customer
bookingDateInput.addEventListener('input', function(e){
    timeVisitInput.value = "";
    let dateString = this.value;
    // let chosenDateUTC = new Date(dateString).getUTCDate();

    // // disable holiday
    // if(dayOff.includes(chosenDateUTC)){
    //     e.preventDefault();
    //     this.value = '';
    //     return alert(`Tanggal ${dayOff} kami libur`);
    // }
    chosenDateByCustomer = dateString;
    
    dataCountBooking.forEach(field => {
        if(chosenDateByCustomer == field.field1){
            dataInChosenDate = field;
        }
    })
    console.log("data in chosen date:",dataInChosenDate);
})

// chose booking time, and then check availability
timeVisitInput.addEventListener('input', function(e){
    // before chose time to visit, make sure to choose date first
    if(!chosenDateByCustomer || !dataInChosenDate){
        e.preventDefault();
        this.value = '';
        return alert('Harap isi tanggal kunjungan');
    }
    timestamp.value = new Date();
    sessionChosenByCustomer = this.value;
    // disabledButton = true;
    // button.disabled = disabledButton;

    checkAvailibility2(e);
})

// submit and intercept event so the user isn't redirected to webapp
window.addEventListener("load", function(){
    const form = document.getElementById('booking-form');
    form.addEventListener('submit', function(e){
        e.preventDefault();

        button.setAttribute('disabled', 'disabled');
        button.value = 'Harap tunggu...';

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
            // disabledButton = false;
            chosenDateByCustomer = "";
            DataCountBooking = "";
            dataInChosenDate = "";

            // button.disabled = disabledButton;
        })
        .then(()=>{
            button.removeAttribute('disabled');
            button.value = 'Submit';
        })
    })
})

// Check Availibility too
function checkAvailibility2(e){
    let sessionCapacity = sessionChosenByCustomer == 'session1' ? session1Capacity : sessionChosenByCustomer == 'session2' ? session2Capacity : session3Capacity;
    let alreadyTaken = sessionChosenByCustomer == 'session1' ? dataInChosenDate.field2 : sessionChosenByCustomer == 'session2' ? dataInChosenDate.field3 : dataInChosenDate.field4;

    console.log("Kapasitas:", sessionCapacity)
    console.log(sessionChosenByCustomer, "sudah terisi:", alreadyTaken);
    console.log("data:", dataInChosenDate);

    if (alreadyTaken >= sessionCapacity){
        e.preventDefault();
        timeVisitInput.value = '';
        return alert('Jam ini sudah penuh, coba pilih jam lain');
    }
}

function settingCalendar(max){
    let maxDay = max.toISOString().substring(0, 10);
    let holiday = [];

    dayOff.forEach(day=>{
        let newFormatDate = formatDate(day)
        holiday.push(newFormatDate);
    })

    // change format from mm/dd/yyyy to yyyy/mm/dd
    function formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;

        return [year, month, day].join('-');
    }

    // flatpickr for date input
    calendarConfig = {
        enableTime: false,
        altInput: true,
        altFormat: "F j, Y",
        dateFormat: "Y-m-d",
        minDate: "today",
        maxDate: maxDay,
        "disable": [
            function(date) {
                // return true to disable
                return (date.getDay() === 0 || date.getDay() === 1 || date.getDay() === 6);
            }, 
            holiday[0],
            function(date) {
                if(!todayOpen){
                    let newDay = new Date()
                    return date.getDay() === newDay.getDay();
                }
            }
        ]
    }
    flatpickr("input[type=date]", calendarConfig)
}


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
                disabledButton = false;
                button.disabled = disabledButton;
            }
        })

}