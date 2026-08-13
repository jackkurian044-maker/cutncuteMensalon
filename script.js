const branches={
 mens:{name:"Cut N Cute Men's Salon",phone:'063640 31450',wa:'916364031450',address:'1567 13th Main Road, 3rd Cross Rd, near Muneshwara Temple, Kodihalli, Bengaluru, Karnataka 560008',profile:'https://business.google.com/n/4611486389384690294/profile?fid=11725769201246885686',map:'https://www.google.com/maps?q=%231567%2013th%20Main%20Road%203rd%20Cross%20Kodihalli%20Bengaluru'},
 studio:{name:'Cut N Cute Studio',phone:'079967 00707',wa:'917996700707',address:'Ground Floor, 2052 & 54, 15th Main Road, 6th Cross Road, HAL 3rd Stage, Kodihalli, Bengaluru, Karnataka 560008',profile:'https://business.google.com/n/11461415766529791077/profile?fid=9945450791612728435',map:'https://www.google.com/maps?q=Ground%20floor%202052%2054%2015th%20main%20road%206th%20Cross%20Road%20HAL%203rd%20Stage%20Kodihalli%20Bengaluru'},
 fresh:{name:'Cut N Fresh',phone:'063996 20744',wa:'916399620744',address:'128, 18th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560008',profile:'https://business.google.com/n/14369101750302756550/profile?fid=18319074039483070473',map:'https://www.google.com/maps?q=128%2018th%20Main%20Road%20HAL%202nd%20Stage%20Indiranagar%20Bengaluru'}
};

const CONFIG={GOOGLE_APPS_SCRIPT_URL:'https://script.google.com/macros/s/AKfycbxP7sDSgKp-6OAE-EeCDzPicmFX4B5PIdzMxB8VuV3h1NzTSV6VGfkZ7CXSxWGYrgE/exec'};
let current='studio';
function openBranch(){document.getElementById('branchModal').classList.add('show')}
function closeModal(id){document.getElementById(id).classList.remove('show')}
function wa(branch,msg='Hi, I would like to book an appointment.'){window.open('https://wa.me/'+branches[branch].wa+'?text='+encodeURIComponent(msg),'_blank')}
function choose(branch){current=branch;closeModal('branchModal');openBooking(branch)}
function openBooking(branch=current){current=branch;document.getElementById('bookingModal').classList.add('show');document.getElementById('bookingTitle').textContent='Book at '+branches[branch].name;document.getElementById('branchSelect').value=branch;setMinDate();}
function todayLocal(){
 const d=new Date();
 return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().split('T')[0];
}
function setMinDate(){
 const date=document.getElementById('date');
 date.min=todayLocal();
 if(!date.value || date.value<date.min) date.value=date.min;
 populateTimeSlots();
}
function populateTimeSlots(){
 const date=document.getElementById('date');
 const select=document.getElementById('time');
 if(!date || !select) return;
 const selected=select.value;
 select.innerHTML='<option value="">Select appointment time</option>';
 const now=new Date();
 const selectedDate=date.value;
 const isToday=selectedDate===todayLocal();
 for(let minutes=8*60; minutes<=21*60; minutes+=30){
   if(isToday){
     const currentMinutes=now.getHours()*60+now.getMinutes();
     if(minutes<=currentMinutes) continue;
   }
   const h=Math.floor(minutes/60), m=minutes%60;
   const label=(h===0?12:h>12?h-12:h)+(m===0?':00':':30')+(h<12?' AM':' PM');
   const opt=document.createElement('option');
   opt.value=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
   opt.textContent=label;
   select.appendChild(opt);
 }
 if(selected && [...select.options].some(o=>o.value===selected)) select.value=selected;
}
function saveBooking(data){
 if(!CONFIG.GOOGLE_APPS_SCRIPT_URL)return Promise.resolve({ok:false,notConfigured:true});
 return new Promise(resolve=>{
   const callback='cncBookingCallback_'+Date.now();
   const script=document.createElement('script');
   const params=new URLSearchParams({
     callback,
     action:'booking',
     branch:data.branch,
     customerName:data.name,
     mobile:data.phone,
     service:data.service,
     appointmentDate:data.date,
     appointmentTime:data.time
   });
   const cleanup=()=>{try{delete window[callback]}catch(e){} script.remove();};
   let settled=false;
   window[callback]=(result)=>{settled=true; cleanup(); resolve(result&&result.success?{ok:true,bookingId:result.bookingId}:{ok:false,error:(result&&result.error)||'Google Sheets rejected the booking.'});};
   script.onerror=()=>{if(!settled){settled=true;cleanup();resolve({ok:false,error:'Could not reach Google Sheets.'});}};
   script.src=CONFIG.GOOGLE_APPS_SCRIPT_URL+'?'+params.toString();
   document.body.appendChild(script);
   setTimeout(()=>{if(!settled){settled=true;cleanup();resolve({ok:false,error:'No response received from Google Sheets. Please verify the Apps Script deployment.'});}},10000);
 });
}
async function sendBooking(e){
 e.preventDefault();
 const b=document.getElementById('branchSelect').value,n=document.getElementById('name').value.trim(),p=document.getElementById('phone').value.trim(),s=document.getElementById('service').value,d=document.getElementById('date').value,t=document.getElementById('time').value;
 if(!t){alert('Please select an appointment time.');return;}
 if(d===todayLocal()){
   const [hh,mm]=t.split(':').map(Number), now=new Date();
   if(hh*60+mm<=now.getHours()*60+now.getMinutes()){alert('Please select a future appointment time.');populateTimeSlots();return;}
 }
 const data={branch:branches[b].name,name:n,phone:p,service:s,date:d,time:t};
 const button=e.target.querySelector('button[type=submit]');button.disabled=true;button.textContent='Saving booking…';
 const saved=await saveBooking(data);
 if(!saved.ok){button.disabled=false;button.textContent='Continue on WhatsApp →';alert(saved.error||'Booking could not be saved to Google Sheets. WhatsApp has not been opened.');return;}
 const msg=`Hi ${branches[b].name}, I would like to book an appointment.\n\nBooking ID: ${saved.bookingId}\nName: ${n}\nMobile: ${p}\nService/Package: ${s}\nDate: ${d}\nTime: ${t}`;
 window.open('https://wa.me/'+branches[b].wa+'?text='+encodeURIComponent(msg),'_blank');
 button.disabled=false;button.textContent='Continue on WhatsApp →';closeModal('bookingModal');alert('Appointment saved successfully. Booking ID: '+saved.bookingId+'\nWhatsApp is now open to confirm your appointment.');
}
window.addEventListener('DOMContentLoaded',()=>{setMinDate(); document.getElementById('date').addEventListener('change',()=>{document.getElementById('time').value=''; populateTimeSlots();}); setInterval(populateTimeSlots,30000);});
window.addEventListener('click',e=>{if(e.target.classList.contains('modal'))e.target.classList.remove('show')});
