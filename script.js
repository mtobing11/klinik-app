const url = 'https://docs.google.com/spreadsheets/d/';
const ssid = '1fJV7cnNu4Lb_jqKzR15UwZqWE3VbvRoxe7qVDanE9AI';
const query1 = `/export?format=csv`;
const query2 = `&gid=761020186`;
const query3 = `&gid=559171219`;
const query4 = `&gid=117909431`;
const query5 = `&gid=96457177`;

const endpoint1 = `${url}${ssid}${query1}${query2}`;
const endpoint2 = `${url}${ssid}${query1}${query3}`;
const endpoint3 = `${url}${ssid}${query1}${query4}`;
const endpoint4 = `${url}${ssid}${query1}${query5}`;

const nameInput = document.querySelector('#uname');
const phoneInput = document.querySelector('#unumber');
const bookingDateInput = document.querySelector('#tanggal');
const timeVisitInput = document.querySelector('#jam_datang');
const output = document.querySelector('#output');
const button = document.querySelector('#submitBtn');
const timestamp = document.querySelector('#timestamp');
const title = document.querySelector('#title');
const chatWhatsApp = document.querySelector('#chat');
const announcementBox = document.querySelector('#announcement-box') ;
const countDown = document.querySelector('#countdown') ;

let session1Capacity, session2Capacity, session3Capacity, sessionChosenByCustomer;
let chosenDateByCustomer;
let dayOff = [];
let maxDayLimit = 1;
let disabledButton = true;
let todayOpen = true;
let notRegistered = true;
let announcement = false;
let announcementText;
let countdownDestination;
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
            
            // button.disabled = disabledButton;
            // console.log(data);
            if(data[6].value == 'N' || data[6].value == 'n'){
                todayOpen = false;
            } else {
                todayOpen = true;
            }

            if(data[7].value == "y" || data[7].value == 'Y'){
                announcement = true;
                announcementText = data[8].value;
                countdownDestination = data[9].value;
                
                countDownTimer();
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
    
    chosenDateByCustomer = dateString;
    
    dataCountBooking.forEach(field => {
        if(chosenDateByCustomer == field.field1){
            dataInChosenDate = field;
        }
    })
    // console.log("data in chosen date:",dataInChosenDate);
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
    let action;
    form.addEventListener('submit', function(e){
        e.preventDefault();

        button.setAttribute('disabled', 'disabled');
        button.value = 'Harap tunggu...';

        let checkPhone = phoneIndonesianValidator(phoneInput.value);

        if(!checkPhone){
            phoneInput.value = "";
            button.removeAttribute('disabled');
            button.value = 'Submit';
            return alert("Nomor Handphone salah atau Provider tidak dikenal");
        }
        
        const action = e.target.action;
        let currData;
        let newPhone = standardizedPhoneNumber(phoneInput.value)
        // console.log("new phone:", newPhone);
        phoneInput.value = newPhone;

        fetch(endpoint4)
        .then(res => res.text())
        .then(datajson => csv().fromString(datajson))
        .then(data => {
            currData = new FormData(form);
            let days = Math.ceil((new Date(chosenDateByCustomer) - new Date()) / (1000 * 60 * 60 * 24));
            let shift = sessionChosenByCustomer == 'session1' ? 0 : sessionChosenByCustomer == 'session2' ? 1 : 2;
            let exactDays = days * 3 + shift;
            
            let arrPhone = data[exactDays].handphone.split(", ");
            
            for (let i = 0; i < arrPhone.length; i++){
                console.log('cek:', arrPhone[i], newPhone.slice(1))
                if (arrPhone[i] == newPhone.slice(1)){
                    // console.log('double:', arrPhone[i], newPhone)
                            return notRegistered = false
                }
                notRegistered = true
            }
        })
        .then(() => {
            if(notRegistered){
                bookingProcess();
            } else {
                phoneInput.value = "";
                button.removeAttribute('disabled');
                button.value = 'Submit';
                return alert("Maaf Nomer anda sudah terdaftar, silahkan gunakan no HP lain");
            }
        })

        // if(!checkDoublePhone(newPhone)){
        //     phoneInput.value = "";
        //     button.removeAttribute('disabled');
        //     button.value = 'Submit';
        //     return alert("Maaf Nomer anda sudah terdaftar, silahkan gunakan no HP lain");
        // }

        function bookingProcess(){
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
        }
    })
})


// Check Availibility too
function checkAvailibility2(e){
    let sessionCapacity = sessionChosenByCustomer == 'session1' ? session1Capacity : sessionChosenByCustomer == 'session2' ? session2Capacity : session3Capacity;
    let alreadyTaken = sessionChosenByCustomer == 'session1' ? dataInChosenDate.field2 : sessionChosenByCustomer == 'session2' ? dataInChosenDate.field3 : dataInChosenDate.field4;

    // console.log("Kapasitas:", sessionCapacity)
    // console.log(sessionChosenByCustomer, "sudah terisi:", alreadyTaken);
    // console.log("data:", dataInChosenDate);

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

// change title in small screen
if (window.innerWidth < 1024){
    title.innerText = 'Terapi Ketok ' + 'Mr.Kevin';
}

if (window.innerWidth > 768){
    let position = adjustChatPosition()
    // console.log("position", position)
    chat.style.left = `${position}px`;
}

function adjustChatPosition(){
    let widthScreen = window.innerWidth;
    let positionX = (widthScreen / 2) + (500/2) + 20;
    // console.log(positionX);
    return positionX
}



// check Indonesian phone number
function phoneIndonesianValidator(phone){
    let formattedPhoneNumber = standardizedPhoneNumber(phone);

    return testingPhoneNumber(formattedPhoneNumber) && !!cellularProviderInIndonesia(formattedPhoneNumber);
}

function standardizedPhoneNumber(phone){
    let phoneNumber = String(phone).trim();

    if(phoneNumber.startsWith('+62')){
        phoneNumber = '0' + phoneNumber.slice(3);
    } else if (phoneNumber.startsWith('62')){
        phoneNumber = '0' + phoneNumber.slice(2)
    }

    return phoneNumber.replace(/[- .]/g, "");
}

function testingPhoneNumber(phone){
    if(!phone || !/^08[1-9][0-9]{7,10}$/.test(phone)){
        return false
    }
    return true
}

function cellularProviderInIndonesia(phone){
    const prefix = phone.slice(0, 4);
    if (['0831', '0832', '0833', '0838'].includes(prefix)) return 'axis';
    if (['0895', '0896', '0897', '0898', '0899'].includes(prefix)) return 'three';
    if (['0817', '0818', '0819', '0859', '0878', '0877'].includes(prefix)) return 'xl';
    if (['0814', '0815', '0816', '0855', '0856', '0857', '0858'].includes(prefix)) return 'indosat';
    if (['0812', '0813', '0852', '0853', '0821', '0823', '0822', '0851', '0811'].includes(prefix)) return 'telkomsel';
    if (['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888', '0889'].includes(prefix)) return 'smartfren';
    return null;
}

// check apakah HP sudah terdaftar
function checkDoublePhone(phone){
    fetch(endpoint4)
    .then(res => res.text())
    .then(datajson => csv().fromString(datajson))
    .then(data => {
        for (let i = 0; i < data.length; i++){
            // console.log(typeof data[i].handphone)
            let arr = data[i].handphone.split(",");
            
            for (let j = 0; j < arr.length; j++){
                if(arr[j] == phone){
                    console.log(arr[j], phone)
                    return false
                }
            }
        }
        return true
    })
}

// countdown timer

function countDownTimer(){
    const textInfo = document.querySelector(".announcement-text")
    announcementBox.style.display = 'flex';
    button.setAttribute('disabled', 'disabled');
    button.value = 'Tidak beroperasi';

    textInfo.innerText = announcementText;
    // console.log(announcementText, countdownDestination);

    let countDownDate = new Date(countdownDestination).getTime()

    let x = setInterval(function(){
        let now = new Date().getTime();
        let distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        let days = Math.floor(distance / (1000 * 60 * 60 * 24));
        let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"
        countDown.innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

        if (distance <= 0){
            clearInterval(x)
            countDown.innerHTML = "Expired";

            announcementBox.style.display = 'none';
            button.removeAttribute('disabled');
            button.value = 'Submit';
        }
    })
}

function getTodayString(){
    let mm = new Date().getMonth() + 1; // getMonth() is zero-based
    let dd = new Date().getDate();

    return [new Date().getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('-');
}



// // Check Availibility
// function checkAvailibility(e){
//     // take data from database
//     fetch(endpoint2)
//         .then(res => res.text())
//         .then(datajson => {
//             return csv().fromString(datajson)
//         })
//         .then(data => {
//             let sessionCapacity = sessionChosenByCustomer == 'session1' ? session1Capacity : sessionChosenByCustomer ? session2Capacity : session3Capacity;
//             let count = 0;
//             let customerPhone = phoneInput.value; 
//             data.forEach(booking => {
//                 if(booking.tanggal == chosenDateByCustomer && booking.jam_datang == sessionChosenByCustomer){
//                     count++;
//                     if(customerPhone == `0${booking.telpon}`){
//                         e.preventDefault();
//                         timeVisitInput.value = '';
//                         return alert('No Telpon ini sudah terdaftar di tanggal dan jam ini.')
//                     }
//                 }
//             })
//             if(count >= sessionCapacity){
//                 e.preventDefault();
//                 timeVisitInput.value = '';
//                 // console.log(`penuh, sudah terisi: ${count}`);
//                 alert('Jam ini sudah penuh, coba pilih jam lain');

//                 // const div = document.createElement('div');
//                 // div.textContent = 'Sudah Fullbooked, pilih jam atau hari lain';
//                 // div.classList.add('box');
//                 // div.classList.add('danger');
//                 // output.append(div);
//             } else {
//                 disabledButton = false;
//                 button.disabled = disabledButton;
//             }
//         })

// }

// chat event
// chatWhatsApp.addEventListener("click", (e)=>{
//     let number = '6281210473454';
//     let messages = 'Halo Terapi ketok Kevin,';
//     getLinkWhatsApp(number, messages)
// })

// function getLinkWhatsApp(number, message){
//     let messages = message.split(' ').join('%20');

//     return console.log('https://api.whatsapp.com/send?phone=' + number + '&amp;text=' + encodeURIComponent(messages))
// }