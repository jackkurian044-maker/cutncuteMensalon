const branches={
  mens:{name:"Cut N Cute Men's Salon",phone:'063640 31450',wa:'916364031450',address:'1567 13th Main Road, 3rd Cross Rd, near Muneshwara Temple, Kodihalli, Bengaluru, Karnataka 560008',profile:'https://business.google.com/n/4611486389384690294/profile?fid=11725769201246885686',map:'https://www.google.com/maps?q=%231567%2013th%20Main%20Road%203rd%20Cross%20Kodihalli%20Bengaluru'},
  studio:{name:'Cut N Cute Studio - Unisex Salon',phone:'079967 00707',wa:'917996700707',address:'Ground Floor, 2052 & 54, 15th Main Road, 6th Cross Road, HAL 3rd Stage, Kodihalli, Bengaluru, Karnataka 560008',profile:'https://business.google.com/n/11461415766529791077/profile?fid=9945450791612728435',map:'https://www.google.com/maps?q=Ground%20floor%202052%2054%2015th%20main%20road%206th%20Cross%20Road%20HAL%203rd%20Stage%20Kodihalli%20Bengaluru'},
  fresh:{name:'Cut N Fresh',phone:'063996 20744',wa:'916399620744',address:'128, 18th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560008',profile:'https://business.google.com/n/14369101750302756550/profile?fid=18319074039483070473',map:'https://www.google.com/maps?q=128%2018th%20Main%20Road%20HAL%202nd%20Stage%20Indiranagar%20Bengaluru'}
};

const CONFIG={
  GOOGLE_APPS_SCRIPT_URL:'https://script.google.com/macros/s/AKfycbxP7sDSgKp-6OAE-EeCDzPicmFX4B5PIdzMxB8VuV3h1NzTSV6VGfkZ7CXSxWGYrgE/exec'
};

let current='studio';
let calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1);

function openBranch(){document.getElementById('branchModal').classList.add('show')}
function closeModal(id){
  document.getElementById(id).classList.remove('show');
  if(id==='bookingModal'){
    document.getElementById('calendarPopover')?.classList.remove('show');
    document.getElementById('timePopover')?.classList.remove('show');
  }
}
function wa(branch,msg='Hi, I would like to book an appointment.'){
  window.open('https://wa.me/'+branches[branch].wa+'?text='+encodeURIComponent(msg),'_blank');
}
function choose(branch){
  current=branch;
  closeModal('branchModal');
  openBooking(branch);
}
function openBooking(branch=current){
  current=branch;
  document.getElementById('bookingModal').classList.add('show');
  document.getElementById('bookingTitle').textContent='Book at '+branches[branch].name;
  document.getElementById('branchSelect').value=branch;
  setMinDate();
  calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1);
  renderCalendar();
  renderTimePicker();
}
function localDate(){
  const d=new Date();
  return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().split('T')[0];
}
function setMinDate(){
  const el=document.getElementById('date');
  if(el) el.min=localDate();
}

function toggleCalendar(){
  document.getElementById('timePopover')?.classList.remove('show');
  const el=document.getElementById('calendarPopover');
  el.classList.toggle('show');
  if(el.classList.contains('show')) renderCalendar();
}
function toggleTimePicker(){
  document.getElementById('calendarPopover')?.classList.remove('show');
  const el=document.getElementById('timePopover');
  el.classList.toggle('show');
  if(el.classList.contains('show')) renderTimePicker();
}

function renderTimePicker(){
  const grid=document.getElementById('timeGrid');
  if(!grid)return;
  grid.innerHTML='';

  const selected=document.getElementById('time').value;
  const selectedDate=document.getElementById('date').value;
  const today=localDate();
  const now=new Date();
  const currentMinutes=now.getHours()*60+now.getMinutes();

  // Salon hours: 8:00 AM through 9:00 PM. Last selectable slot is 9:00 PM.
  for(let mins=8*60;mins<=21*60;mins+=30){
    const h=Math.floor(mins/60), m=mins%60;
    const value=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
    const label=new Date(2000,0,1,h,m).toLocaleTimeString('en-IN',{
      hour:'numeric',minute:'2-digit'
    });

    const b=document.createElement('button');
    b.type='button';
    b.className='time-option'+(value===selected?' selected':'');
    b.textContent=label;

    // For today, hide past slots entirely (not merely disable them).
    const isPastToday = selectedDate===today && mins <= currentMinutes;
    if(isPastToday){
      b.remove();
      continue;
    }

    b.onclick=()=>selectTime(value,label);
    grid.appendChild(b);
  }

  if(!grid.children.length){
    grid.innerHTML='<div class="time-empty">No appointment times remain today. Please choose another date.</div>';
  }
}

function selectTime(value,label){
  document.getElementById('time').value=value;
  document.getElementById('timeLabel').textContent=label;
  document.getElementById('timePopover').classList.remove('show');
  renderTimePicker();
}

function changeMonth(delta){
  const now=new Date();
  const min=new Date(now.getFullYear(),now.getMonth(),1);
  const next=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+delta,1);
  if(next<min)return;
  calendarMonth=next;
  renderCalendar();
}

function renderCalendar(){
  const grid=document.getElementById('calendarGrid');
  if(!grid)return;

  const y=calendarMonth.getFullYear(),m=calendarMonth.getMonth();
  document.getElementById('calendarMonth').textContent=
    calendarMonth.toLocaleString('en-IN',{month:'long',year:'numeric'});

  grid.innerHTML='';
  const first=new Date(y,m,1).getDay();
  const days=new Date(y,m+1,0).getDate();
  const today=localDate();

  for(let i=0;i<first;i++){
    const x=document.createElement('button');
    x.type='button';
    x.className='cal-day muted';
    x.disabled=true;
    grid.appendChild(x);
  }

  for(let d=1;d<=days;d++){
    const date=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const x=document.createElement('button');
    x.type='button';
    x.className='cal-day';
    x.textContent=d;

    if(date<today){
      x.classList.add('disabled');
      x.disabled=true;
    }
    if(date===document.getElementById('date').value)x.classList.add('selected');

    x.onclick=()=>selectDate(date);
    grid.appendChild(x);
  }
}

function selectDate(date){
  document.getElementById('date').value=date;
  document.getElementById('time').value='';
  document.getElementById('timeLabel').textContent='Select appointment time';

  const dt=new Date(date+'T00:00:00');
  document.getElementById('dateLabel').textContent=
    dt.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});

  document.getElementById('calendarPopover').classList.remove('show');

  // Immediately rebuild the time picker for the newly selected date.
  renderTimePicker();

  // Open the time picker automatically so the customer sees the slots.
  document.getElementById('timePopover').classList.add('show');
}

function saveBooking(data){
  return new Promise(resolve=>{
    const callbackName='cutNCuteBookingCallback_'+Date.now()+'_'+Math.floor(Math.random()*10000);
    const script=document.createElement('script');
    let finished=false;

    const cleanup=()=>{
      if(script.parentNode)script.parentNode.removeChild(script);
      try{delete window[callbackName]}catch(_){}
    };

    window[callbackName]=function(response){
      finished=true;
      cleanup();
      if(response && response.success){
        resolve({ok:true,bookingId:response.bookingId||''});
      }else{
        resolve({ok:false,error:(response&&response.error)||'Google Sheets rejected the booking.'});
      }
    };

    const params=new URLSearchParams({
      action:'book',
      callback:callbackName,
      branch:data.branch,
      customerName:data.name,
      mobile:data.phone,
      service:data.service,
      appointmentDate:data.date,
      appointmentTime:data.time,
      branchPhone:data.branchPhone,
      branchAddress:data.branchAddress
    });

    script.src=CONFIG.GOOGLE_APPS_SCRIPT_URL+'?'+params.toString();
    script.onerror=()=>{
      if(finished)return;
      finished=true;
      cleanup();
      resolve({ok:false,error:'Could not reach Google Sheets.'});
    };

    document.body.appendChild(script);

    setTimeout(()=>{
      if(finished)return;
      finished=true;
      cleanup();
      resolve({ok:false,error:'No response received from Google Sheets.'});
    },10000);
  });
}

async function sendBooking(e){
  e.preventDefault();

  const b=document.getElementById('branchSelect').value;
  const n=document.getElementById('name').value.trim();
  const p=document.getElementById('phone').value.trim();
  const s=document.getElementById('service').value;
  const d=document.getElementById('date').value;
  const t=document.getElementById('time').value;

  if(!d){
    alert('Please select an appointment date from the calendar.');
    toggleCalendar();
    return;
  }
  if(!t){
    alert('Please select an appointment time.');
    toggleTimePicker();
    return;
  }

  const data={
    branch:branches[b].name,
    name:n,
    phone:p,
    service:s,
    date:d,
    time:t,
    branchPhone:branches[b].phone,
    branchAddress:branches[b].address
  };

  const button=e.target.querySelector('button[type=submit]');
  button.disabled=true;
  button.textContent='Confirming booking…';

  const saved=await saveBooking(data);

  if(!saved.ok){
    button.disabled=false;
    button.textContent='Confirm Booking →';
    alert('Booking was NOT confirmed in Google Sheets.\n\n'+saved.error+'\n\nPlease try again.');
    return;
  }

  const prettyDate=new Date(d+'T00:00:00').toLocaleDateString('en-IN',{
    weekday:'short',day:'2-digit',month:'short',year:'numeric'
  });

  const msg=
    `Hi ${branches[b].name}, I would like to book an appointment.\n\n`+
    `Booking ID: ${saved.bookingId}\n`+
    `Name: ${n}\n`+
    `Mobile: ${p}\n`+
    `Service/Package: ${s}\n`+
    `Date: ${prettyDate}\n`+
    `Time: ${t}`;

  window.open(
    'https://wa.me/'+branches[b].wa+'?text='+encodeURIComponent(msg),
    '_blank'
  );

  button.disabled=false;
  button.textContent='Confirm Booking →';
  closeModal('bookingModal');

  alert('Booking confirmed! Booking ID: '+saved.bookingId);
}

window.addEventListener('DOMContentLoaded',()=>{
  setMinDate();
  renderCalendar();
  renderTimePicker();
});

window.addEventListener('click',e=>{
  if(e.target.classList.contains('modal'))e.target.classList.remove('show');
  if(!e.target.closest('.time-picker-wrap'))
    document.getElementById('timePopover')?.classList.remove('show');
  if(!e.target.closest('.booking-date-row'))
    document.getElementById('calendarPopover')?.classList.remove('show');
});
