"use client";

import React, { useState } from "react";
import { Calendar, Clock, Star, MessageSquare, Send, CheckCircle, Video, ArrowLeft } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: string;
  avatar: string;
}

interface Message {
  id: string;
  sender: "vet" | "user";
  text: string;
  time: string;
}

export default function VetBooking() {
  const [selectedDoc, setSelectedDoc] = useState<string>("carlos");
  const [selectedDate, setSelectedDate] = useState<string>("hoy");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isBooked, setIsBooked] = useState<boolean>(false);
  
  // Chat simulator state
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const doctors: Doctor[] = [
    {
      id: "carlos",
      name: "Dr. Carlos Mendoza",
      specialty: "Nutrición Canina y Obesidad",
      rating: 4.9,
      reviews: 142,
      experience: "12 años",
      avatar: "👨‍⚕️",
    },
    {
      id: "laura",
      name: "Dra. Laura Ortiz",
      specialty: "Nutrióloga Veterinaria Felina",
      rating: 4.8,
      reviews: 98,
      experience: "8 años",
      avatar: "👩‍⚕️",
    },
  ];

  const dates = [
    { id: "hoy", label: "Hoy", sub: "Jun 5" },
    { id: "manana", label: "Mañana", sub: "Jun 6" },
    { id: "lun", label: "Lun", sub: "Jun 8" },
    { id: "mar", label: "Mar", sub: "Jun 9" },
    { id: "mie", label: "Mié", sub: "Jun 10" },
  ];

  const times = ["10:00 AM", "11:30 AM", "03:00 PM", "04:30 PM"];

  const handleBooking = () => {
    if (!selectedTime) return;
    setIsBooked(true);

    const docName = doctors.find((d) => d.id === selectedDoc)?.name || "Veterinario";

    // Setup initial chat messages
    setChatMessages([
      {
        id: "1",
        sender: "vet",
        text: `¡Hola! Soy el ${docName}. He recibido tu solicitud de asesoría nutricional gratuita incluida con tu dispensador NutriDog.`,
        time: "Hace un momento",
      },
      {
        id: "2",
        sender: "vet",
        text: "Para prepararme mejor, por favor asegúrate de rellenar los datos de tu mascota (peso, BCS y comida) en el perfil de la app. ¿Tiene tu mascota alguna condición de salud previa?",
        time: "Hace un momento",
      },
    ]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setChatMessages((prev) => {
      const userMsg: Message = {
        id: `user-msg-${prev.length}`,
        sender: "user",
        text: inputText,
        time: "Ahora",
      };
      return [...prev, userMsg];
    });

    setInputText("");
    setIsTyping(true);

    // Bot automated reply simulation
    setTimeout(() => {
      setIsTyping(false);
      
      let replyText = "Entendido. Revisaré los datos que ingresaste en la calculadora de porciones. En nuestra videollamada ajustaremos el plan para bajar de peso de forma segura. ¡Nos vemos pronto!";
      
      if (inputText.toLowerCase().includes("hola")) {
        replyText = "¡Hola! Estoy atento a tus comentarios. Por favor cuéntame si tiene alguna alergia alimentaria.";
      } else if (inputText.toLowerCase().includes("enfermo") || inputText.toLowerCase().includes("alergia")) {
        replyText = "Ese es un dato muy importante. Tomaremos nota de esta condición médica para formular el límite de Kcal diarias y recomendar el tipo de alimento adecuado.";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `vet-reply-${prev.length}`,
          sender: "vet",
          text: replyText,
          time: "Ahora",
        },
      ]);
    }, 1500);
  };

  const docInfo = doctors.find((d) => d.id === selectedDoc);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
      {!isBooked ? (
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
            <Video className="w-4.5 h-4.5 text-emerald-600" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              Asesoría Veterinaria Gratuita
            </h3>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Tu dispensador inteligente incluye una sesión de telemedicina sin costo con un MV especialista en nutrición animal.
          </p>

          {/* Doctor Switcher */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Selecciona un Especialista
            </label>
            <div className="grid grid-cols-2 gap-2">
              {doctors.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDoc(d.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedDoc === d.id
                      ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm"
                      : "border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{d.avatar}</span>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {d.name.split(" ")[1]} {d.name.split(" ")[2]}
                      </h4>
                      <p className="text-[9px] text-zinc-400 line-clamp-1">{d.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-100/50 dark:border-zinc-800/40 text-[9px] text-zinc-500">
                    <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                      <Star className="w-2.5 h-2.5 fill-amber-500" /> {d.rating}
                    </span>
                    <span>• exp: {d.experience}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Selecciona Fecha
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {dates.map((dt) => (
                <button
                  key={dt.id}
                  onClick={() => setSelectedDate(dt.id)}
                  className={`flex-1 min-w-[50px] py-2 px-1 rounded-xl border flex flex-col items-center text-center transition-all ${
                    selectedDate === dt.id
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                      : "border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
                  }`}
                >
                  <span className="text-[10px] font-bold">{dt.label}</span>
                  <span className={`text-[8px] ${selectedDate === dt.id ? "text-emerald-100" : "text-zinc-400"}`}>
                    {dt.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Selecciona Horario
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {times.map((tm) => (
                <button
                  key={tm}
                  onClick={() => setSelectedTime(tm)}
                  className={`py-2 px-1 rounded-xl border text-[9px] font-bold text-center transition-all ${
                    selectedTime === tm
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
                      : "border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
                  }`}
                >
                  {tm.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleBooking}
            disabled={!selectedTime}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 active:scale-[0.98]"
          >
            <Calendar className="w-3.5 h-3.5" />
            Reservar Asesoría
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {/* Booking Confirmation Card */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                ¡Consulta Agendada Exitosamente!
              </h4>
              <p className="text-[10px] text-zinc-600 dark:text-zinc-400 mt-1">
                Videollamada con <span className="font-semibold">{docInfo?.name}</span>
              </p>
              <div className="flex gap-3 mt-2 text-[9px] text-zinc-500 font-semibold">
                <span className="flex items-center gap-0.5">
                  <Calendar className="w-2.5 h-2.5" />{" "}
                  {dates.find((d) => d.id === selectedDate)?.label} ({dates.find((d) => d.id === selectedDate)?.sub})
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" /> {selectedTime}
                </span>
              </div>
            </div>
          </div>

          {/* Chat Interface Header */}
          <div className="border-t border-zinc-150 dark:border-zinc-800 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-emerald-500" /> Chat con Nutriólogo
              </span>
              <button
                onClick={() => {
                  setIsBooked(false);
                  setSelectedTime("");
                }}
                className="text-[9px] text-zinc-400 hover:text-emerald-600 font-semibold flex items-center gap-0.5"
              >
                <ArrowLeft className="w-2.5 h-2.5" /> Cambiar Hora
              </button>
            </div>

            {/* Chat message history container */}
            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-900 h-[160px] overflow-y-auto p-3 space-y-2.5 text-[10px] scrollbar-thin">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[80%] ${msg.sender === "user" ? "ml-auto items-end" : "items-start"}`}
                >
                  <div
                    className={`px-3 py-2 rounded-2xl leading-normal ${
                      msg.sender === "user"
                        ? "bg-emerald-600 text-white rounded-tr-none"
                        : "bg-white dark:bg-zinc-800 border border-zinc-150 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-tl-none shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-zinc-400 mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 border border-zinc-150 dark:border-zinc-700 px-3 py-2.5 rounded-2xl rounded-tl-none w-[55px] text-zinc-400">
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              )}
            </div>

            {/* Chat Send Form */}
            <form onSubmit={handleSendMessage} className="flex gap-1.5 mt-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe un mensaje al veterinario..."
                className="flex-1 px-3 py-2 text-[10px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100"
              />
              <button
                type="submit"
                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
