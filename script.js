const seed=[
{id:"LF001",name:"Black Wallet",category:"Wallet / Money",status:"Lost",location:"Canteen",date:"2026-09-30",contactName:"Rahul",phone:"9876543210",description:"Black leather wallet with college ID card."},
{id:"LF002",name:"Scientific Calculator",category:"Electronics",status:"Found",location:"CSE Block - Room 204",date:"2026-09-30",contactName:"Ananya",phone:"9876501234",description:"Casio calculator found near the last bench."},
{id:"LF003",name:"Blue Notebook",category:"Books",status:"Lost",location:"Central Library",date:"2026-09-29",contactName:"Kiran",phone:"9876512345",description:"Blue notebook with handwritten DBMS notes."},
{id:"LF004",name:"Earphones",category:"Accessories",status:"Returned",location:"Seminar Hall",date:"2026-09-28",contactName:"Sandeep",phone:"9876523456",description:"White wireless earphones in a small case."}
];
let items=JSON.parse(localStorage.getItem("campusLostFound")||"null")||seed;
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
function save(){localStorage.setItem("campusLostFound",JSON.stringify(items))}
function icon(c){return ({'ID Card':'🪪','Electronics':'📱','Books':'📚','Wallet / Money':'👛','Keys':'🔑','Accessories':'🎧','Other':'📦'})[c]||'📦'}
function show(view){$$(".view").forEach(x=>x.classList.remove("active"));$("#"+view).classList.add("active");$$(".nav-btn").forEach(x=>x.classList.toggle("active",x.dataset.view===view));window.scrollTo(0,0);if(view==="home")renderRecent();if(view==="items")renderItems()}
function renderStats(){$("#lostCount").textContent=items.filter(x=>x.status==="Lost").length;$("#foundCount").textContent=items.filter(x=>x.status==="Found").length;$("#returnedCount").textContent=items.filter(x=>x.status==="Returned").length;$("#totalCount").textContent=items.length}
function card(x){return `<article class="item"><div class="item-top"><span class="item-icon">${icon(x.category)}</span><span class="badge ${x.status.toLowerCase()}">${x.status.toUpperCase()}</span></div><h3>${escapeHtml(x.name)}</h3><div class="meta">📍 ${escapeHtml(x.location)} · 📅 ${x.date}</div><p class="desc">${escapeHtml(x.description)}</p><div class="card-actions"><button class="small-btn main" onclick="details('${x.id}')">View Details</button>${x.status!=="Returned"?`<button class="small-btn" onclick="returned('${x.id}')">✓ Returned</button>`:""}</div></article>`}
function renderRecent(){$("#recentItems").innerHTML=items.slice().reverse().slice(0,6).map(card).join("")||'<div class="empty">No reports yet.</div>';renderStats()}
function renderItems(){const q=$("#search").value.toLowerCase(), f=$("#filter").value;const a=items.filter(x=>(f==="All"||x.status===f)&&[x.name,x.category,x.location,x.description].join(" ").toLowerCase().includes(q));$("#allItems").innerHTML=a.length?a.slice().reverse().map(card).join(""):'<div class="empty">No matching reports found.</div>'}
function details(id){
  const x=items.find(i=>i.id===id);
  $("#modalContent").innerHTML=`
    <p class="eyebrow">${x.status.toUpperCase()} REPORT</p>
    <h2>${icon(x.category)} ${escapeHtml(x.name)}</h2>
    <p><b>Category:</b> ${escapeHtml(x.category)}<br>
    <b>Location:</b> ${escapeHtml(x.location)}<br>
    <b>Date:</b> ${x.date}<br>
    <b>Reporter:</b> ${escapeHtml(x.contactName)}</p>
    <p>${escapeHtml(x.description)}</p>
    <div class="privacy-note">🔒 <b>Privacy protected:</b> The reporter's phone number is never shown publicly. Use the secure request form below.</div>
    ${x.status!=="Returned" ? `
      <button class="primary" onclick="claimForm('${x.id}')">💬 Request / Contact Reporter</button>
      <button class="small-btn" onclick="returned('${x.id}');closeModal()">✓ Mark as Returned</button>
    ` : `<span class="badge returned">ITEM RETURNED</span>`}
  `;
  $("#modal").classList.remove("hidden");
}
function claimForm(id){
  const x=items.find(i=>i.id===id);
  $("#modalContent").innerHTML=`
    <p class="eyebrow">PRIVATE REQUEST</p>
    <h2>Request: ${icon(x.category)} ${escapeHtml(x.name)}</h2>
    <p class="privacy-note">🔒 Your message is sent without exposing the reporter's private phone number.</p>
    <label>Your name<input id="claimName" placeholder="Your name"></label>
    <label style="margin-top:12px">Your contact<input id="claimContact" placeholder="Phone or email for reply"></label>
    <label style="margin-top:12px">Message<textarea id="claimMessage" placeholder="Explain why you think this item is yours..."></textarea></label>
    <div class="form-actions">
      <button class="secondary" onclick="details('${x.id}')">Back</button>
      <button class="primary" onclick="submitClaim('${x.id}')">Send Secure Request</button>
    </div>
  `;
}
function submitClaim(id){
  const name=$("#claimName").value.trim(), contact=$("#claimContact").value.trim(), message=$("#claimMessage").value.trim();
  if(!name||!contact||!message){toast("Please complete all fields");return}
  const claims=JSON.parse(localStorage.getItem("campusClaims")||"[]");
  claims.push({id:"CL"+Date.now().toString().slice(-6),itemId:id,name,contact,message,date:new Date().toISOString()});
  localStorage.setItem("campusClaims",JSON.stringify(claims));
  closeModal();
  toast("Private request sent ✓");
}
function closeModal(){$("#modal").classList.add("hidden")}
function returned(id){const x=items.find(i=>i.id===id);if(x){x.status="Returned";save();toast("Item marked as returned ✓");renderRecent();renderItems()}}
function toast(t){$("#toast").textContent=t;$("#toast").classList.add("show");setTimeout(()=>$("#toast").classList.remove("show"),2200)}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
$$(".nav-btn").forEach(b=>b.onclick=()=>show(b.dataset.view));
$$("[data-go]").forEach(b=>b.onclick=()=>{show(b.dataset.go);if(b.dataset.status){setType(b.dataset.status)}})
$$(".type-btn").forEach(b=>b.onclick=()=>setType(b.dataset.type));
function setType(t){$("#status").value=t;$$(".type-btn").forEach(b=>b.classList.toggle("active",b.dataset.type===t))}
$("#reportForm").addEventListener("submit",e=>{e.preventDefault();const x={id:"LF"+Date.now().toString().slice(-5),name:$("#itemName").value.trim(),category:$("#category").value,status:$("#status").value,location:$("#location").value.trim(),date:$("#date").value,contactName:$("#contactName").value.trim(),phone:$("#phone").value.trim(),description:$("#description").value.trim()};items.push(x);save();e.target.reset();$("#date").value=new Date().toISOString().slice(0,10);setType("Lost");toast("Report submitted successfully ✓");show("items")});
$("#search").addEventListener("input",renderItems);$("#filter").addEventListener("change",renderItems);$("#closeModal").onclick=closeModal;$("#modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
$("#date").value=new Date().toISOString().slice(0,10);renderRecent();
