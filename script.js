const branches={
 mens:{name:"Cut N Cute Men's Salon",phone:'063640 31450',wa:'916364031450',address:'1567 13th Main Road, 3rd Cross Rd, near Muneshwara Temple, Kodihalli, Bengaluru, Karnataka 560008',profile:'https://business.google.com/n/4611486389384690294/profile?fid=11725769201246885686',map:'https://www.google.com/maps?q=%231567%2013th%20Main%20Road%203rd%20Cross%20Kodihalli%20Bengaluru'},
 studio:{name:'Cut N Cute Studio',phone:'079967 00707',wa:'917996700707',address:'Ground Floor, 2052 & 54, 15th Main Road, 6th Cross Road, HAL 3rd Stage, Kodihalli, Bengaluru, Karnataka 560008',profile:'https://business.google.com/n/11461415766529791077/profile?fid=9945450791612728435',map:'https://www.google.com/maps?q=Ground%20floor%202052%2054%2015th%20main%20road%206th%20Cross%20Road%20HAL%203rd%20Stage%20Kodihalli%20Bengaluru'},
 fresh:{name:'Cut N Fresh',phone:'063996 20744',wa:'916399620744',address:'128, 18th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560008',profile:'https://business.google.com/n/14369101750302756550/profile?fid=18319074039483070473',map:'https://www.google.com/maps?q=128%2018th%20Main%20Road%20HAL%202nd%20Stage%20Indiranagar%20Bengaluru'}
};
const CONFIG={GOOGLE_APPS_SCRIPT_URL:'https://script.google.com/macros/s/AKfycbyqonXLcFAURfp0RSO2C_40yi4YYC4CFdNWyW76lx7jS0Gv0TU8OYSt8YH0yxCke8gp/exec'};
let current='studio';
let calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1);
function openBranch(){document.getElementById('branchModal').classList.add('show')}
function closeModal(id){document.getElementById(id).classList.remove('show');if(id==='bookingModal')document.getElementById('calendarPopover').classList.remove('show')}
function wa(branch,msg='Hi, I would like to book an appointment.'){window.open('https://wa.me/'+branches[branch].wa+'?text='+encodeURIComponent(msg),'_blank')}
function choose(branch){current=branch;closeModal('branchModal');openBooking(branch)}
function openBooking(branch=current){current=branch;document.getElementById('bookingModal').classList.add('show');document.getElementById('bookingTitle').textContent='Book at '+branches[branch].name;document.getElementById('branchSelect').value=branch;setMinDate();calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1);renderCalendar();}
function localDate(){const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().split('T')[0]}
function setMinDate(){document.getElementById('date').min=localDate()}
function toggleCalendar(){document.getElementById('timePopover')?.classList.remove('show');const el=document.getElementById('calendarPopover');el.classList.toggle('show');if(el.classList.contains('show'))renderCalendar()}
function toggleTimePicker(){document.getElementById('calendarPopover')?.classList.remove('show');const el=document.getElementById('timePopover');el.classList.toggle('show');if(el.classList.contains('show'))renderTimePicker()}
function renderTimePicker(){const grid=document.getElementById('timeGrid');if(!grid)return;grid.innerHTML='';const selected=document.getElementById('time').value;for(let mins=8*60;mins<=21*60;mins+=30){const h=Math.floor(mins/60),m=mins%60;const hh=String(h).padStart(2,'0'),mm=String(m).padStart(2,'0');const value=`${hh}:${mm}`;const label=new Date(2000,0,1,h,m).toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});const b=document.createElement('button');b.type='button';b.className='time-option'+(value===selected?' selected':'');b.textContent=label;b.onclick=()=>selectTime(value,label);grid.appendChild(b)}}
function selectTime(value,label){document.getElementById('time').value=value;document.getElementById('timeLabel').textContent=label;document.getElementById('timePopover').classList.remove('show');renderTimePicker()}
function changeMonth(delta){const now=new Date();const min=new Date(now.getFullYear(),now.getMonth(),1);const next=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+delta,1);if(next<min)return;calendarMonth=next;renderCalendar()}
function renderCalendar(){
 const grid=document.getElementById('calendarGrid'); if(!grid)return;
 const y=calendarMonth.getFullYear(),m=calendarMonth.getMonth();
 document.getElementById('calendarMonth').textContent=calendarMonth.toLocaleString('en-IN',{month:'long',year:'numeric'});
 grid.innerHTML='';
 const first=new Date(y,m,1).getDay();
 const days=new Date(y,m+1,0).getDate();
 const today=localDate();
 for(let i=0;i<first;i++){const x=document.createElement('button');x.type='button';x.className='cal-day muted';x.disabled=true;grid.appendChild(x)}
 for(let d=1;d<=days;d++){
   const date=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
   const x=document.createElement('button');x.type='button';x.className='cal-day';x.textContent=d;
   if(date<today){x.classList.add('disabled');x.disabled=true}
   if(date===document.getElementById('date').value)x.classList.add('selected');
   x.onclick=()=>selectDate(date);
   grid.appendChild(x);
 }
}
function selectDate(date){
 document.getElementById('date').value=date;
 const dt=new Date(date+'T00:00:00');
 document.getElementById('dateLabel').textContent=dt.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
 document.getElementById('calendarPopover').classList.remove('show');
 renderCalendar();
}
function saveBooking(data){
 if(!CONFIG.GOOGLE_APPS_SCRIPT_URL)return Promise.resolve({ok:false,notConfigured:true});
 return new Promise(resolve=>{
   const iframe=document.createElement('iframe');iframe.name='booking_submit_'+Date.now();iframe.style.display='none';document.body.appendChild(iframe);
   const form=document.createElement('form');form.method='POST';form.action=CONFIG.GOOGLE_APPS_SCRIPT_URL;form.target=iframe.name;form.style.display='none';
   Object.entries({branch:data.branch,customerName:data.name,mobile:data.phone,service:data.service,appointmentDate:data.date,appointmentTime:data.time}).forEach(([name,value])=>{const input=document.createElement('input');input.type='hidden';input.name=name;input.value=value;form.appendChild(input)});
   document.body.appendChild(form);form.submit();setTimeout(()=>{form.remove();iframe.remove();resolve({ok:true})},1500);
 });
}
async function sendBooking(e){
 e.preventDefault();
 const b=document.getElementById('branchSelect').value,n=document.getElementById('name').value.trim(),p=document.getElementById('phone').value.trim(),s=document.getElementById('service').value,d=document.getElementById('date').value,t=document.getElementById('time').value;
 if(!d){alert('Please select an appointment date from the calendar.');toggleCalendar();return}
 if(!t){alert('Please select an appointment time.');toggleTimePicker();return}
 const data={branch:branches[b].name,name:n,phone:p,service:s,date:d,time:t};
 const button=e.target.querySelector('button[type=submit]');button.disabled=true;button.textContent='Saving booking…';
 const saved=await saveBooking(data);
 const prettyDate=new Date(d+'T00:00:00').toLocaleDateString('en-IN',{weekday:'short',day:'2-digit',month:'short',year:'numeric'});
 const msg=`Hi ${branches[b].name}, I would like to book an appointment.\n\nBooking details:\nName: ${n}\nMobile: ${p}\nService/Package: ${s}\nDate: ${prettyDate}\nTime: ${t}`;
 window.open('https://wa.me/'+branches[b].wa+'?text='+encodeURIComponent(msg),'_blank');
 button.disabled=false;button.textContent='Continue on WhatsApp →';closeModal('bookingModal');
 alert(saved.ok?'Appointment request saved. WhatsApp is now open to confirm your booking.':'WhatsApp is now open.');
}
window.addEventListener('DOMContentLoaded',()=>{setMinDate();renderCalendar();renderTimePicker()});
window.addEventListener('click',e=>{if(e.target.classList.contains('modal'))e.target.classList.remove('show');if(!e.target.closest('.time-picker-wrap'))document.getElementById('timePopover')?.classList.remove('show');if(!e.target.closest('.booking-date-row'))document.getElementById('calendarPopover')?.classList.remove('show')});
