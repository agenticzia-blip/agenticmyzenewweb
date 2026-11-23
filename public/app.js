// AgenticMyze frontend: menu, FAQ, tabs, forms, payment wizard, admin
(function(){
function toast(msg){var t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show')},3500)}
window.showToast=toast;
// Mobile menu
var toggle=document.getElementById('menuToggle'),nav=document.getElementById('mainNav');
if(toggle&&nav){toggle.addEventListener('click',function(){var open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',open?'true':'false')})}
// Active nav
var path=location.pathname.replace(/\/$/,'')||'/';
document.querySelectorAll('.main-nav a').forEach(function(a){if(a.getAttribute('href')===path)a.classList.add('active')});
// FAQ accordion
document.querySelectorAll('.faq-item').forEach(function(item){
  var q=item.querySelector('.faq-q');if(!q)return;
  q.addEventListener('click',function(){var open=item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(function(o){o.classList.remove('open');o.querySelector('.faq-q').setAttribute('aria-expanded','false')});
    if(!open){item.classList.add('open');q.setAttribute('aria-expanded','true')}});
});
// Roadmap tabs
document.querySelectorAll('.tab-btn').forEach(function(btn){
  btn.addEventListener('click',function(){
    document.querySelectorAll('.tab-btn').forEach(function(b){b.classList.remove('active')});btn.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(function(p){p.classList.remove('active')});
    var panel=document.getElementById('tab-'+btn.dataset.tab);if(panel)panel.classList.add('active');
  });
});
// Copy buttons (delegated)
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-copy]');if(!b)return;
  var val=b.getAttribute('data-copy');
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(val).then(function(){toast('Copied: '+val)}).catch(function(){toast(val)})}
  else{toast(val)}
});
function postJSON(url,data,msgEl){
  return fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
    .then(function(r){return r.json().then(function(j){return{status:r.status,body:j}})}).catch(function(){return{status:0,body:{error:'Network error. Please try again.'}}});
}
// Contact form
var cf=document.getElementById('contactForm');
if(cf){cf.addEventListener('submit',function(e){e.preventDefault();
  var m=document.getElementById('contactMsg');m.textContent='Sending…';m.className='form-msg';
  var d={name:cf.name.value.trim(),whatsapp:cf.whatsapp.value.trim(),email:cf.email.value.trim(),message:cf.message.value.trim(),plan:cf.plan.value};
  postJSON('/api/contact',d).then(function(res){
    if(res.status===200&&res.body.ok){m.textContent='Thank you! Your message was received. We will reply within 24 hours.';m.className='form-msg ok';cf.reset()}
    else{m.textContent=res.body.error||'Something went wrong. Please WhatsApp us on 03078462895.';m.className='form-msg error'}
  });
})}
// Payment wizard
var wizard=document.getElementById('wizard');
if(wizard){
  var params=new URLSearchParams(location.search);var planId=params.get('plan');
  var plans={starter:{name:'Quick-Scale',price:'PKR 10,000'},professional:{name:'Growth Catalyst',price:'PKR 30,000'},elite:{name:'Scale',price:'PKR 60,000'},enterprise:{name:'Enterprise',price:'PKR 200,000'}};
  var accounts={
    jazzcash:{label:'JazzCash',rows:[['Account Title','UPDATE — Replace with real JazzCash account title'],['JazzCash Number','UPDATE — Replace with real JazzCash number']]},
    easypaisa:{label:'Easypaisa',rows:[['Account Title','UPDATE — Replace with real Easypaisa account title'],['Easypaisa Number','UPDATE — Replace with real Easypaisa number']]},
    bank:{label:'Bank Transfer',rows:[['Bank','UPDATE — Replace with real bank name'],['Account Title','UPDATE — Replace with real account title'],['Account Number / IBAN','UPDATE — Replace with real account number / IBAN']]}
  };
  var noPlan=document.getElementById('noPlan');
  if(!planId||!plans[planId]){noPlan.hidden=false;wizard.hidden=true}
  else{
    wizard.hidden=false;noPlan.hidden=true;
    var p=plans[planId];
    document.getElementById('planSummary').innerHTML='<p class="eyebrow">Selected package</p><h2 style="margin:.2em 0">'+p.name+' — '+p.price+'</h2><p class="muted">One-time payment · Enrollment is confirmed after payment verification.</p>';
    var form=document.getElementById('enrollForm');
    function showStep(n){document.querySelectorAll('.wizard-step').forEach(function(s){s.classList.toggle('active',s.dataset.step===String(n))});
      document.querySelectorAll('.step').forEach(function(s){s.classList.toggle('active',s.dataset.step===String(n))});}
    function renderPay(method){var box=document.getElementById('payDetails');var a=accounts[method];if(!a){box.innerHTML='';return}
      box.innerHTML='<p><strong>'+a.label+' — UPDATE IN config.js / .env — replace with real account details before going live</strong></p>'+
        a.rows.map(function(r){return '<div class="pay-row"><span><strong>'+r[0]+':</strong> '+r[1]+'</span><button type="button" class="copy-btn" data-copy="'+r[1]+'">Copy</button></div>'}).join('')+
        '<p class="muted">Amount to send: <strong>'+p.price+'</strong></p>';}
    document.querySelectorAll('[data-next]').forEach(function(btn){btn.addEventListener('click',function(){
      var next=btn.dataset.next;
      if(next==='2'){if(form.name.value.trim().length<2){toast('Please enter your full name.');return}
        if(form.whatsapp.value.trim().length<10){toast('Please enter a valid WhatsApp number.');return}}
      if(next==='3'){var m=form.querySelector('input[name="paymentMethod"]:checked');if(!m){toast('Please choose a payment method.');return}renderPay(m.value)}
      showStep(next);window.scrollTo({top:0,behavior:'smooth'});
    })});
    form.querySelectorAll('input[name="paymentMethod"]').forEach(function(r){r.addEventListener('change',function(){renderPay(r.value)})});
    form.addEventListener('submit',function(e){e.preventDefault();
      var m=document.getElementById('enrollMsg');m.textContent='Submitting…';m.className='form-msg';
      var method=(form.querySelector('input[name="paymentMethod"]:checked')||{}).value;
      var d={name:form.name.value.trim(),whatsapp:form.whatsapp.value.trim(),plan:planId,paymentMethod:method,transactionRef:form.transactionRef.value.trim()};
      postJSON('/api/enrollments',d).then(function(res){
        if(res.status===200&&res.body.ok){
          form.style.display='none';document.querySelector('.steps').style.display='none';
          var box=document.getElementById('enrollSuccess');box.hidden=false;
          box.innerHTML='<h2>Enrollment Submitted ✓</h2><p>Thank you, <strong>'+res.body.enrollment.name+'</strong>! Your reference ID is:</p><p style="font-size:1.6rem;font-weight:800;color:#2a82c4">'+res.body.enrollment.reference+'</p><p>Package: <strong>'+p.name+' — '+p.price+'</strong> · Method: '+method+'</p><p>We will verify your payment and confirm on WhatsApp. Please also send your payment screenshot on WhatsApp to <a href="https://wa.me/923078462895" target="_blank" rel="noopener">03078462895</a> with your reference ID.</p><p><a class="btn btn-primary" href="/">Back to Home</a></p>';
          toast('Enrollment submitted: '+res.body.enrollment.reference);
        } else {m.textContent=res.body.error||'Submission failed. Please try again or WhatsApp us.';m.className='form-msg error'}
      });
    });
  }
}
// Admin dashboard
var adminForm=document.getElementById('adminLogin');
if(adminForm){
  var tokenInput=document.getElementById('adminToken');
  function loadAdmin(){
    var token=tokenInput.value.trim();var m=document.getElementById('adminMsg');
    if(!token){m.textContent='Enter your admin token.';m.className='form-msg error';return}
    m.textContent='Loading…';m.className='form-msg';
    var H={'x-admin-token':token};
    Promise.all([fetch('/api/admin/enrollments',{headers:H}),fetch('/api/admin/leads',{headers:H}),fetch('/api/admin/contacts',{headers:H})])
    .then(function(rs){return Promise.all(rs.map(function(r){return r.json().then(function(j){return{status:r.status,body:j}})}))})
    .then(function(out){
      if(out.some(function(o){return o.status===401})){m.textContent='Invalid admin token.';m.className='form-msg error';return}
      m.textContent='';document.getElementById('adminData').hidden=false;
      document.getElementById('csvLink').href='/api/admin/export.csv';
      var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
      var fmt=function(d){return d?new Date(d).toLocaleString():'—'};
      var statusBtns=function(type,id){return ['new','contacted','enrolled','paid','verified'].map(function(s){return '<button class="status-btn" data-type="'+type+'" data-id="'+id+'" data-status="'+s+'">'+s+'</button>'}).join(' ')};
      document.querySelector('#enrollTable tbody').innerHTML=out[0].body.enrollments.map(function(e){return '<tr><td>'+esc(e.reference)+'</td><td>'+esc(e.name)+'</td><td>'+esc(e.whatsapp)+'</td><td>'+esc(e.plan)+'</td><td>'+esc(e.paymentMethod)+'</td><td>'+esc(e.transactionRef)+'</td><td>'+esc(e.status)+'</td><td>'+fmt(e.createdAt)+'</td><td>'+statusBtns('enrollments',e.id)+'</td></tr>'}).join('')||'<tr><td colspan="9">No enrollments yet.</td></tr>';
      document.querySelector('#leadTable tbody').innerHTML=out[1].body.leads.map(function(e){return '<tr><td>'+esc(e.name)+'</td><td>'+esc(e.whatsapp)+'</td><td>'+esc(e.plan||e.interest||'')+'</td><td>'+esc(e.source||'')+'</td><td>'+esc(e.status)+'</td><td>'+fmt(e.createdAt)+'</td><td>'+statusBtns('leads',e.id)+'</td></tr>'}).join('')||'<tr><td colspan="7">No leads yet.</td></tr>';
      document.querySelector('#contactTable tbody').innerHTML=out[2].body.contacts.map(function(e){return '<tr><td>'+esc(e.name)+'</td><td>'+esc(e.whatsapp)+'</td><td>'+esc(e.email||'')+'</td><td>'+esc(e.plan||'')+'</td><td>'+esc(e.message)+'</td><td>'+esc(e.status)+'</td><td>'+fmt(e.createdAt)+'</td><td>'+statusBtns('contacts',e.id)+'</td></tr>'}).join('')||'<tr><td colspan="8">No messages yet.</td></tr>';
    }).catch(function(){m.textContent='Could not load dashboard. Check the server is running.';m.className='form-msg error'});
  }
  adminForm.addEventListener('submit',function(e){e.preventDefault();loadAdmin()});
  var rb=document.getElementById('refreshBtn');if(rb)rb.addEventListener('click',loadAdmin);
  document.addEventListener('click',function(e){
    var b=e.target.closest('.status-btn');if(!b)return;
    var token=tokenInput.value.trim();
    fetch('/api/admin/status',{method:'POST',headers:{'Content-Type':'application/json','x-admin-token':token},body:JSON.stringify({type:b.dataset.type,id:b.dataset.id,status:b.dataset.status})})
    .then(function(r){return r.json()}).then(function(j){if(j.ok){toast('Status updated to '+b.dataset.status);loadAdmin()}else{toast(j.error||'Update failed')}});
  });
  document.getElementById('csvLink').addEventListener('click',function(e){
    var t=tokenInput.value.trim();
    if(t){e.preventDefault();fetch('/api/admin/export.csv',{headers:{'x-admin-token':t}}).then(function(r){if(r.status!==200){toast('CSV export needs a valid admin token.');return}return r.blob().then(function(b){var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='enrollments.csv';a.click()})})}
  });
}
})();
