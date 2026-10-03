import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Search,
  Star,
  Clock,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  QrCode,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import MedicalDisclaimer from '../components/MedicalDisclaimer';
import QRCodeModal from '../components/QRCodeModal';

export default function DoctorDiscoveryPage({ onNavigate }) {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [loading, setLoading] = useState(true);

  // Booking Flow State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState('in_person');
  const [reason, setReason] = useState('Routine consultation & checkup');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (specialty !== 'All') params.append('specialization', specialty);
      params.append('sort_by', sortBy);

      const list = await api.getDoctors(params.toString());
      setDoctors(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [specialty, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  // Fetch slots whenever doctor or date changes
  useEffect(() => {
    if (selectedDoctor && bookingDate) {
      api.getDoctorSlots(selectedDoctor.id, bookingDate)
        .then((slots) => {
          setAvailableSlots(slots);
          const firstAvailable = slots.find(s => !s.is_booked);
          setSelectedTime(firstAvailable ? firstAvailable.time : '');
        })
        .catch(() => setAvailableSlots([]));
    }
  }, [selectedDoctor, bookingDate]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedTime) {
      setBookingError('Please choose an available time slot.');
      return;
    }
    setBookingError('');
    setBookingLoading(true);

    try {
      const resp = await api.bookAppointment({
        doctor_id: selectedDoctor.id,
        appointment_date: bookingDate,
        appointment_time: selectedTime,
        consultation_type: consultationType,
        reason: reason
      });
      setConfirmedAppointment(resp);
      setSelectedDoctor(null);
    } catch (err) {
      setBookingError(err.message || 'Booking conflict or error. Please pick another slot.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <MedicalDisclaimer />

      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Discover Healthcare Specialists
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified clinical doctors with transparent qualifications, schedules, and instant QR booking.
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          <div className="sm:col-span-5 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by doctor name or hospital..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="All">All Specializations</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Dermatology">Dermatology</option>
              <option value="General Medicine">General Medicine</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="rating">Sort: Highest Rating</option>
              <option value="experience">Sort: Most Experienced</option>
              <option value="fee">Sort: Consultation Fee</option>
            </select>
          </div>

        </form>
      </div>

      {/* DOCTOR CARDS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-black text-sm dark:bg-emerald-950 dark:text-emerald-300">
                      {doc.name.replace('Dr. ', '')[0]}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{doc.name}</span>
                        {doc.is_verified && (
                          <ShieldCheck className="h-4 w-4 text-emerald-500" title="Verified Specialist" />
                        )}
                      </div>
                      <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {doc.specialization}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span>{doc.rating}</span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {doc.bio || `${doc.experience_years} years experience in clinical care.`}
                </p>

                <div className="mt-4 space-y-1 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{doc.hospital_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{doc.experience_years} Years Experience</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                    <span>${doc.consultation_fee} per consultation</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  onClick={() => setSelectedDoctor(doc)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Book Consultation Slot</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* BOOKING MODAL */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-slide-up">
            
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Schedule Consultation with {selectedDoctor.name}
                </h3>
                <span className="text-xs text-emerald-600 font-semibold">{selectedDoctor.specialization} • ${selectedDoctor.consultation_fee}</span>
              </div>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {bookingError && (
              <div className="mt-3 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-600 font-semibold dark:bg-rose-950/40 dark:text-rose-400">
                {bookingError}
              </div>
            )}

            <form onSubmit={handleBook} className="mt-4 space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Appointment Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Consultation Type</label>
                  <select
                    value={consultationType}
                    onChange={(e) => setConsultationType(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="in_person">In-Person Clinic Visit</option>
                    <option value="video">Virtual Video Consultation</option>
                    <option value="chat">Follow-up Clinical Chat</option>
                  </select>
                </div>
              </div>

              {/* Time Slots (Checks Double-Booking) */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Available Time Slot
                </label>
                <div className="mt-2 grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
                  {availableSlots.length === 0 ? (
                    <div className="col-span-4 py-4 text-center text-xs text-slate-400">
                      Loading available slots for {bookingDate}...
                    </div>
                  ) : (
                    availableSlots.map((slot, i) => (
                      <button
                        key={i}
                        type="button"
                        disabled={slot.is_booked}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`rounded-xl py-2 text-xs font-bold transition ${
                          slot.is_booked
                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed line-through dark:bg-slate-800 dark:text-slate-600'
                            : selectedTime === slot.time
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'border border-slate-200 bg-white text-slate-700 hover:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Grayed-out crossed slots are already reserved by other patients (Double-booking prevention active).
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reason for Consultation</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Follow-up regarding blood pressure & palpitations"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="w-1/2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading || !selectedTime}
                  className="w-1/2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-50 transition"
                >
                  {bookingLoading ? 'Reserving Slot...' : 'Confirm Appointment'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* CONFIRMATION QR MODAL */}
      <QRCodeModal
        isOpen={!!confirmedAppointment}
        onClose={() => setConfirmedAppointment(null)}
        appointment={confirmedAppointment}
      />

    </div>
  );
}
