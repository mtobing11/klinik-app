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

let session1Capacity, session2Capacity, session3Capacity, sessionChosenByCustomer;
let chosenDateByCustomer;
let dayOff = [];

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
    })

// cek availability
fetch(endpoint2)
    .then(res => res.text())
    .then(datajson => {
        return csv().fromString(datajson)
    })
    .then(data => {
        checkAvailibility(data);
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
            alert("Success");
        })
    })
})

// Check Availibility
function checkAvailibility(data){
    // before chose time to visit, make sure to choose date first

    timeVisitInput.addEventListener('input', function(e){
        if(!chosenDateByCustomer){
            e.preventDefault();
            this.value = '';
            return alert('Harap isi tanggal kunjungan');
        }
        sessionChosenByCustomer = this.value;
        console.log(data);
    
        let sessionCapacity = sessionChosenByCustomer == 'session1' ? session1Capacity : sessionChosenByCustomer ? session2Capacity : session3Capacity;
        let count = 0;
        data.forEach(booking => {
            if(booking.jam_datang == sessionChosenByCustomer){
                count++;
            }
        })
        if(count >= sessionCapacity){
            e.preventDefault();
            this.value = '';
            alert('Sudah Fullbooked')

            // const div = document.createElement('div');
            // div.textContent = 'Sudah Fullbooked, pilih jam atau hari lain';
            // div.classList.add('box');
            // div.classList.add('danger');
            // output.append(div);
        }
    })
}

// Check Availibility 2
function checkAvailibility2(data){
    // before chose time to visit, make sure to choose date first

    // timeVisitInput.addEventListener('input', function(e){
    //     if(!chosenDateByCustomer){
    //         e.preventDefault();
    //         this.value = '';
    //         return alert('Harap isi tanggal kunjungan');
    //     }
    //     sessionChosenByCustomer = this.value;
    //     console.log(data);
    
    //     // let sessionCapacity = sessionChosenByCustomer == 'session1' ? session1Capacity : sessionChosenByCustomer ? session2Capacity : session3Capacity;
    //     let countSes1 = 0;
    //     let countSes2 = 0;
    //     let countSes3 = 0;
    //     data.forEach(booking => {
    //         booking.jam_datang == 'session1' ? countSes1++ : booking.jam_datang == 'session2' ? countSes2++ : booking.jam_datang == 'session3' ? countSes3++ : null
    //     })
    //     if(countSes1 >= session1Capacity){
    //         let optionSes = document.querySelector('#ses1');
    //         optionSes.innerText = "Fullbooked";
    //     }
    // })
}