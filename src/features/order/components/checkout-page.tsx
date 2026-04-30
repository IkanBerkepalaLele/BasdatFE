"use client";

import { useState, useMemo } from "react";
import { 
  CalendarDays, 
  MapPin, 
  Ticket, 
  ChevronRight, 
  Info, 
  CheckCircle2,
  AlertCircle,
  Armchair
} from "lucide-react";
import { eventSeed } from "@/features/event/data/event-seed";
import { venueSeed } from "@/features/venue/data/venue-seed";
import { ticketCategorySeed } from "@/features/ticket-category/data/ticket-category-seed";
import { seatSeed } from "@/features/seat/data/seat-seed";
import { orderSeedData } from "../data/order-seed";

function formatCurrency(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} · ${hh}:${mi}`;
}

export function CheckoutPage({ 
  eventId, 
  customerId, 
  onSuccess 
}: { 
  eventId: string; 
  customerId: string;
  onSuccess: () => void;
}) {
  const event = useMemo(() => eventSeed.events.find(e => e.eventId === eventId), [eventId]);
  const venue = useMemo(() => venueSeed.venues.find(v => v.venueId === event?.venueId), [event]);
  const categories = useMemo(() => ticketCategorySeed.categories.filter(c => c.eventId === eventId), [eventId]);
  const availableSeats = useMemo(() => seatSeed.filter(s => s.venueId === event?.venueId), [event]);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedSeatId, setSelectedSeatId] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCategory = useMemo(() => categories.find(c => c.categoryId === selectedCategoryId), [selectedCategoryId, categories]);
  
  const discount = promoApplied ? 50000 : 0; // Simple fixed discount for demo
  const subtotal = (selectedCategory?.price || 0) * quantity;
  const totalAmount = Math.max(0, subtotal - discount);

  function handleApplyPromo() {
    if (promoCode.trim().toUpperCase() === "TIKTAKTUK") {
      setPromoApplied(true);
    } else {
      alert("Kode promo tidak valid.");
    }
  }

  function handleCheckout() {
    if (!selectedCategoryId) {
      alert("Silakan pilih kategori tiket.");
      return;
    }
    if (quantity < 1 || quantity > 10) {
      alert("Jumlah tiket harus antara 1 dan 10.");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newOrder = {
        orderId: `ord-${Math.random().toString(36).substring(2, 9)}`,
        orderDate: new Date().toISOString(),
        paymentStatus: "Pending" as const,
        totalAmount,
        customerId,
        eventId,
      };

      orderSeedData.unshift(newOrder); // Add to the beginning for "latest first"
      setIsSubmitting(false);
      onSuccess();
    }, 800);
  }

  if (!event) return <div className="p-8 text-center font-bold">Event tidak ditemukan.</div>;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Form Section */}
      <div className="lg:col-span-8 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            <Ticket className="text-blue-600" size={24} />
            Informasi Pesanan
          </h2>
          
          <div className="space-y-6">
            {/* Event Info Card */}
            <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">{event.eventTitle}</h3>
                <div className="mt-2 space-y-1">
                  <p className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <CalendarDays size={14} />
                    {formatDateTime(event.eventDateTime)}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <MapPin size={14} />
                    {venue?.venueName}, {venue?.city}
                  </p>
                </div>
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-extrabold text-slate-700 mb-3">
                Pilih Kategori Tiket <span className="text-red-500">*</span>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {categories.map((cat) => (
                  <button
                    key={cat.categoryId}
                    className={`flex flex-col p-4 rounded-xl border-2 text-left transition ${
                      selectedCategoryId === cat.categoryId
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                        : "border-slate-100 hover:border-slate-200 bg-white"
                    }`}
                    onClick={() => setSelectedCategoryId(cat.categoryId)}
                  >
                    <span className="font-extrabold text-slate-900">{cat.categoryName}</span>
                    <span className="text-sm font-bold text-blue-600 mt-1">{formatCurrency(cat.price)}</span>
                    <span className="text-[11px] font-medium text-slate-400 mt-2">Sisa: {cat.quota} tiket</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-extrabold text-slate-700 mb-3">
                  Jumlah Tiket <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <button 
                    className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 text-xl font-bold hover:bg-slate-50 disabled:opacity-30"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-lg font-extrabold text-slate-900">{quantity}</span>
                  <button 
                    className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 text-xl font-bold hover:bg-slate-50 disabled:opacity-30"
                    onClick={() => setQuantity(prev => Math.min(10, prev + 1))}
                    disabled={quantity >= 10}
                  >
                    +
                  </button>
                </div>
                <p className="mt-2 text-[11px] font-medium text-slate-400">Maksimal 10 tiket per transaksi</p>
              </div>

              {/* Seat Selection (Optional) */}
              {venue?.seatingType === "reserved" && (
                <div>
                  <label className="block text-sm font-extrabold text-slate-700 mb-3">
                    Pilih Kursi (Opsional)
                  </label>
                  <div className="relative">
                    <select
                      className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 appearance-none"
                      value={selectedSeatId}
                      onChange={(e) => setSelectedSeatId(e.target.value)}
                    >
                      <option value="">Pilih Kursi</option>
                      {availableSeats.map(seat => (
                        <option key={seat.seatId} value={seat.seatId}>
                          Section {seat.section} - {seat.rowNumber}{seat.seatNumber}
                        </option>
                      ))}
                    </select>
                    <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" />
                  </div>
                </div>
              )}
            </div>

            {/* Promo Code */}
            <div>
              <label className="block text-sm font-extrabold text-slate-700 mb-3">
                Kode Promo (Opsional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 placeholder:text-slate-300"
                  placeholder="Masukkan kode promo"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={promoApplied}
                />
                <button
                  className="px-6 rounded-lg bg-slate-900 text-white text-sm font-extrabold hover:bg-slate-800 transition disabled:opacity-50"
                  onClick={handleApplyPromo}
                  disabled={!promoCode || promoApplied}
                >
                  {promoApplied ? "Diterapkan" : "Terapkan"}
                </button>
              </div>
              {promoApplied && (
                <p className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  Potongan harga Rp 50.000 berhasil diterapkan!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="lg:col-span-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sticky top-24">
          <h2 className="text-lg font-extrabold text-slate-900 mb-6">Ringkasan Pembayaran</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between text-sm font-semibold text-slate-500">
              <span>Subtotal ({quantity} tiket)</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {promoApplied && (
              <div className="flex justify-between text-sm font-semibold text-emerald-600">
                <span>Diskon Promo</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-semibold text-slate-500">
              <span>Biaya Layanan</span>
              <span className="text-slate-400 font-medium italic">Gratis</span>
            </div>
            
            <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
              <div>
                <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Bayar</span>
                <span className="text-2xl font-black text-slate-900">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 mt-6">
              <Info className="text-blue-600 shrink-0" size={18} />
              <p className="text-[11px] font-semibold text-blue-700 leading-relaxed">
                Dengan menekan tombol di bawah, Anda menyetujui syarat dan ketentuan yang berlaku di TikTakTuk.
              </p>
            </div>

            <button
              className="w-full mt-4 h-12 rounded-xl bg-blue-600 text-white font-extrabold shadow-lg shadow-blue-200 hover:bg-blue-700 transition active:scale-[.98] disabled:opacity-50 disabled:active:scale-100"
              onClick={handleCheckout}
              disabled={!selectedCategoryId || isSubmitting}
            >
              {isSubmitting ? "Memproses..." : "Beli Sekarang"}
            </button>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>Transaksi Aman & Terenkripsi</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>E-tiket langsung dikirim ke email</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
