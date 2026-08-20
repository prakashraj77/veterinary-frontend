import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input, { Field, Select, Textarea } from "../ui/Input";
import { getPatients } from "../../services/patientService";
import { createAppointment } from "../../services/appointmentService";

const EMPTY = { patientId: "", appointmentDate: new Date().toISOString().slice(0, 10), appointmentTime: "10:00", appointmentType: "In Clinic", reason: "", status: "Confirmed", notes: "", doctorName: "" };

export default function NewVisitModal({ open, onClose, onCreated }) {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  useEffect(() => { if (open) getPatients().then((d) => setPatients(Array.isArray(d) ? d : [])).catch(() => setPatients([])); }, [open]);
  const submit = async () => {
    if (!form.patientId) return toast.error("Select a patient");
    try { setSaving(true); const created = await createAppointment({ ...form, patientId: Number(form.patientId) }); toast.success("Visit created"); onCreated?.(created); setForm(EMPTY); onClose(); }
    catch (e) { toast.error(e?.response?.data?.message || "Could not create visit"); }
    finally { setSaving(false); }
  };
  return <Modal open={open} onClose={saving ? undefined : onClose} title="New visit" subtitle="Create a real appointment in the backend.">
    <div className="form-grid-2">
      <Field label="Patient" className="col-span-2"><Select value={form.patientId} onChange={(e) => update("patientId", e.target.value)}><option value="">Select a patient</option>{patients.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.breed || p.species} · {p.ownerName || ""}</option>)}</Select></Field>
      <Field label="Date"><Input type="date" value={form.appointmentDate} onChange={(e) => update("appointmentDate", e.target.value)} /></Field>
      <Field label="Time"><Input type="time" value={form.appointmentTime} onChange={(e) => update("appointmentTime", e.target.value)} /></Field>
      <Field label="Visit type"><Select value={form.appointmentType} onChange={(e) => update("appointmentType", e.target.value)}><option>In Clinic</option><option>Video</option><option>Home Visit</option><option>Emergency</option></Select></Field>
      <Field label="Status"><Select value={form.status} onChange={(e) => update("status", e.target.value)}><option>Confirmed</option><option>Waiting</option><option>In Consultation</option><option>Completed</option><option>Cancelled</option></Select></Field>
      <Field label="Reason" className="col-span-2"><Input value={form.reason} onChange={(e) => update("reason", e.target.value)} /></Field>
      <Field label="Doctor"><Input value={form.doctorName} onChange={(e) => update("doctorName", e.target.value)} placeholder="Doctor name" /></Field>
      <Field label="Notes"><Textarea rows={2} value={form.notes} onChange={(e) => update("notes", e.target.value)} /></Field>
    </div>
    <div className="modal-actions"><Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button><Button onClick={submit} disabled={saving}>{saving ? "Saving..." : "Create visit"}</Button></div>
  </Modal>;
}
