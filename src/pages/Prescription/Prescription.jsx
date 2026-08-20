import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiMic, FiTrash2, FiDownload, FiSend, FiMail, FiMessageSquare, FiPlusCircle } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Input, { Field, Select, Textarea } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { getPatients } from "../../services/patientService";
import { getMedicines } from "../../services/medicineService";
import { createPrescription } from "../../services/prescriptionService";
import { sendSms, sendWhatsApp, sendEmail } from "../../services/communicationService";
import "./Prescription.css";

const emptyMed = () => ({ id: Date.now() + Math.random(), medicineId: "", dosage: "", frequency: "Once daily", duration: "", route: "", quantity: "", instructions: "" });
export default function Prescription() {
  const [patients,setPatients]=useState([]);const[allMeds,setAllMeds]=useState([]);const[patientId,setPatientId]=useState("");const[diagnosis,setDiagnosis]=useState("");const[instructions,setInstructions]=useState("");const[notes,setNotes]=useState("");const[petFood,setPetFood]=useState("");const[medicines,setMedicines]=useState([emptyMed()]);const[visitDate,setVisitDate]=useState(new Date().toISOString().slice(0,10));const[complaint,setComplaint]=useState("");const[vitals,setVitals]=useState({temp:"",pulse:"",resp:""});const[saving,setSaving]=useState(false);const[generatingPdf,setGeneratingPdf]=useState(false);
  const previewRef=useRef(null);
  useEffect(()=>{Promise.all([getPatients(),getMedicines()]).then(([p,m])=>{setPatients(Array.isArray(p)?p:[]);setAllMeds(Array.isArray(m)?m:[]);}).catch(()=>{});},[]);
  const patient=patients.find(p=>String(p.id)===String(patientId));
  const updateMed=(id,key,value)=>setMedicines(ms=>ms.map(m=>m.id===id?{...m,[key]:value}:m));
  const notesWithPetFood=()=>petFood.trim()?`${notes}${notes.trim()?"\n\n":""}Pet food / diet: ${petFood.trim()}`:notes;
  const submit=async()=>{if(!patientId)return toast.error("Select a patient");const items=medicines.filter(m=>m.medicineId).map(m=>({medicineId:Number(m.medicineId),dosage:m.dosage,frequency:m.frequency,duration:m.duration,route:m.route,quantity:m.quantity,instructions:m.instructions}));try{setSaving(true);const rx=await createPrescription({patientId:Number(patientId),prescriptionDate:visitDate,diagnosis,instructions,notes:notesWithPetFood(),doctorName:"Veterinary Doctor",items});toast.success(`Prescription #${rx.id} saved`);return rx;}catch(e){toast.error(e?.response?.data?.message||"Could not save prescription");throw e;}finally{setSaving(false);}};
  const content=()=>`Patient: ${patient?.name||""}\nDiagnosis: ${diagnosis}\nComplaint: ${complaint}\nMedicines:\n${medicines.map(m=>{const med=allMeds.find(x=>String(x.id)===String(m.medicineId));return `${med?.name||""} ${m.dosage} ${m.frequency} ${m.duration}`;}).join("\n")}\nInstructions: ${instructions}\nPet food / diet: ${petFood||"—"}\nNotes: ${notes}`;
  const downloadPdf=async()=>{
    const node=previewRef.current;
    if(!node)return;
    try{
      setGeneratingPdf(true);
      const canvas=await html2canvas(node,{scale:3,useCORS:true,backgroundColor:"#ffffff"});
      const imgData=canvas.toDataURL("image/png");
      const pdf=new jsPDF({unit:"pt",format:"a4"});
      const pageWidth=pdf.internal.pageSize.getWidth();
      const pageHeight=pdf.internal.pageSize.getHeight();
      const imgWidth=pageWidth;
      const imgHeight=(canvas.height*imgWidth)/canvas.width;
      let heightLeft=imgHeight;
      let position=0;
      pdf.addImage(imgData,"PNG",0,position,imgWidth,imgHeight);
      heightLeft-=pageHeight;
      while(heightLeft>0){
        position=heightLeft-imgHeight;
        pdf.addPage();
        pdf.addImage(imgData,"PNG",0,position,imgWidth,imgHeight);
        heightLeft-=pageHeight;
      }
      const fileName=`prescription-${patient?.name?patient.name.replace(/\s+/g,"-").toLowerCase():"zenve"}-${visitDate}.pdf`;
      pdf.save(fileName);
      toast.success("PDF downloaded");
    }catch(e){
      toast.error("Could not generate PDF");
    }finally{
      setGeneratingPdf(false);
    }
  };
  const send=async(type)=>{
    try{
      await submit();
      const message=content();
      let result;
      if(type==="whatsapp"){
        if(!patient?.ownerPhone)return toast.error("This patient has no owner phone number on file");
        result=await sendWhatsApp({phoneNumber:patient.ownerPhone,message,type:"PRESCRIPTION",provider:"MANUAL"});
      }
      if(type==="sms"){
        if(!patient?.ownerPhone)return toast.error("This patient has no owner phone number on file");
        result=await sendSms({phoneNumber:patient.ownerPhone,message,type:"PRESCRIPTION",provider:"MANUAL"});
      }
      if(type==="email"){
        if(!patient?.ownerEmail)return toast.error("This patient has no owner email on file");
        result=await sendEmail({recipient:patient.ownerEmail,subject:"Veterinary prescription",message,type:"PRESCRIPTION",provider:"MANUAL"});
      }
      // Reflect what the backend actually did, instead of assuming delivery:
      // a saved "Pending"/"Not configured" log is not the same as a sent message.
      const status=(result?.status||"").toLowerCase();
      if(status==="sent"){
        toast.success(`${type} sent`);
      }else if(status==="failed"){
        toast.error(result?.errorMessage||`Could not send ${type}`);
      }else{
        toast(result?.errorMessage||`${type} was logged but not sent yet — the ${type} provider isn't configured on the server.`,{icon:"⚠️"});
      }
    }catch(e){
      toast.error(e?.response?.data?.message||`Could not send ${type}`);
    }
  }
  return <div className="rx-layout">
    <div className="panel stack-4">
      <div className="rx-grid-3">
        <Field label="Patient" className="col-span-2"><Select value={patientId} onChange={e=>setPatientId(e.target.value)}><option value="">Select patient</option>{patients.map(p=><option key={p.id} value={p.id}>{p.name} · {p.species} · {p.ownerName||""}</option>)}</Select></Field>
        <Field label="Weight"><Input value={patient?.weight!=null?`${patient.weight} kg`:""} readOnly /></Field>
      </div>
      <div className="rx-mic-box">
        <button onClick={()=>toast("Voice capture needs a speech service connection")} className="rx-mic-btn"><FiMic size={16}/></button>
        <div><p className="rx-mic-title">Voice → Prescription</p><p className="rx-mic-desc">Voice capture is ready for a speech provider; the saved prescription still uses the backend API.</p></div>
      </div>
      <Field label="Date"><Input type="date" value={visitDate} onChange={e=>setVisitDate(e.target.value)}/></Field>
      <Field label="Presenting complaint"><Input value={complaint} onChange={e=>setComplaint(e.target.value)}/></Field>
      <Field label="Diagnosis"><Input value={diagnosis} onChange={e=>setDiagnosis(e.target.value)}/></Field>
      <div>
        <span className="eyebrow">Medicines</span>
        <div className="stack-3" style={{marginTop:12}}>
          {medicines.map(m=><div key={m.id} className="rx-med-row">
            <Select value={m.medicineId} onChange={e=>updateMed(m.id,"medicineId",e.target.value)}><option value="">Medicine</option>{allMeds.map(x=><option key={x.id} value={x.id}>{x.name} {x.strength||""}</option>)}</Select>
            <Input placeholder="Dose" value={m.dosage} onChange={e=>updateMed(m.id,"dosage",e.target.value)}/>
            <Input placeholder="Frequency" value={m.frequency} onChange={e=>updateMed(m.id,"frequency",e.target.value)}/>
            <Input placeholder="Duration" value={m.duration} onChange={e=>updateMed(m.id,"duration",e.target.value)}/>
            <button onClick={()=>setMedicines(ms=>ms.filter(x=>x.id!==m.id))} className="rx-med-remove"><FiTrash2 size={16}/></button>
          </div>)}
          <button onClick={()=>setMedicines(ms=>[...ms,emptyMed()])} className="rx-chip"><FiPlusCircle size={14}/> Add medicine</button>
        </div>
      </div>
      <div className="rx-grid-4">
        <Field label="Temp (°C)"><Input value={vitals.temp} onChange={e=>setVitals({...vitals,temp:e.target.value})}/></Field>
        <Field label="Pulse"><Input value={vitals.pulse} onChange={e=>setVitals({...vitals,pulse:e.target.value})}/></Field>
        <Field label="Resp"><Input value={vitals.resp} onChange={e=>setVitals({...vitals,resp:e.target.value})}/></Field>
        <Field label="Follow-up days"><Input placeholder="10"/></Field>
      </div>
      <Field label="Instructions"><Input value={instructions} onChange={e=>setInstructions(e.target.value)}/></Field>
      <Field label="Pet food / Diet recommendation"><Input placeholder="e.g. Prescription renal diet, twice daily" value={petFood} onChange={e=>setPetFood(e.target.value)}/></Field>
      <Field label="Notes"><Textarea rows={3} value={notes} onChange={e=>setNotes(e.target.value)}/></Field>
      <div className="rx-footer">
        <div className="flex-row" style={{gap:8}}>
          <Button variant="secondary" icon={FiDownload} onClick={downloadPdf} disabled={generatingPdf}>{generatingPdf?"Preparing...":"PDF"}</Button>
          <Button variant="secondary" icon={FaWhatsapp} onClick={()=>send("whatsapp")}>WhatsApp</Button>
          <Button variant="secondary" icon={FiMail} onClick={()=>send("email")}>Email</Button>
          <Button variant="secondary" icon={FiMessageSquare} onClick={()=>send("sms")}>SMS</Button>
        </div>
        <Button icon={FiSend} onClick={submit} disabled={saving}>{saving?"Saving...":"Save prescription"}</Button>
      </div>
    </div>

    <div className="rx-preview-wrap">
      <div className="panel rx-preview" ref={previewRef}>
        <div className="rx-watermark">℞</div>

        <div className="rx-preview-letterhead">
          <div className="rx-preview-brand">
            <div className="rx-preview-mark rx-preview-mark-z">Z</div>
            <div>
              <p className="rx-preview-clinic">Zenve Veterinary Clinic</p>
              <p className="rx-preview-faint">Veterinary Doctor · General &amp; Emergency Care</p>
            </div>
          </div>
          <div className="rx-preview-doctitle">
            <p className="rx-preview-doc-label">Prescription</p>
            <p className="rx-preview-faint">Date: {visitDate}</p>
          </div>
        </div>

        <div className="rx-preview-grid">
          <div><p className="eyebrow">Patient</p><p className="rx-preview-value">{patient?.name||"—"} · {patient?.species||""} · {patient?.breed||""}</p></div>
          <div><p className="eyebrow">Owner</p><p className="rx-preview-value">{patient?.ownerName||"—"}</p></div>
          <div><p className="eyebrow">Weight</p><p className="rx-preview-value">{patient?.weight!=null?`${patient.weight} kg`:"—"}</p></div>
          <div><p className="eyebrow">Date</p><p className="rx-preview-value">{visitDate}</p></div>
        </div>

        <div className="rx-preview-block">
          <p className="eyebrow">Complaint</p>
          <p className="rx-preview-value">{complaint||"—"}</p>
        </div>

        <div className="rx-preview-block">
          <p className="eyebrow">Diagnosis</p>
          <p className="rx-preview-value">{diagnosis||"—"}</p>
        </div>

        <div className="rx-preview-block">
          <p className="eyebrow rx-rx-label"><span className="rx-rx-symbol">℞</span> Medicines</p>
          <div className="rx-preview-meds">
            {medicines.filter(m=>m.medicineId||m.dosage).length===0 && <p className="rx-preview-faint">No medicines added yet</p>}
            {medicines.map((m,i)=>{const med=allMeds.find(x=>String(x.id)===String(m.medicineId));return (
              <div key={m.id} className="rx-preview-med-item">
                <span className="rx-preview-med-index">{i+1}</span>
                <div className="rx-preview-med-text">
                  <p className="cell-title">{med?.name||"—"}</p>
                  <p className="cell-sub">{[m.dosage,m.frequency,m.duration].filter(Boolean).join(" · ")||"—"}</p>
                </div>
              </div>
            );})}
          </div>
        </div>

        <div className="rx-preview-block">
          <p className="eyebrow">Instructions</p>
          <p className="rx-preview-value">{instructions||"—"}</p>
        </div>

        <div className="rx-preview-block">
          <p className="eyebrow">Pet food / Diet</p>
          <p className="rx-preview-value">{petFood||"—"}</p>
        </div>

        <div className="rx-preview-block">
          <p className="eyebrow">Notes</p>
          <p className="rx-preview-value">{notes||"—"}</p>
        </div>

        <div className="rx-preview-signature">
          <div className="rx-preview-sign-line">
            <span>Doctor's Signature</span>
          </div>
          <p className="rx-preview-faint">This is a computer-generated prescription.</p>
        </div>
      </div>
    </div>
  </div>;
}
