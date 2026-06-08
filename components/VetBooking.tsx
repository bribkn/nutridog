"use client";

import React, { useState } from "react";
import { Calendar, Clock, Star, MessageSquare, Send, CheckCircle, Video, ArrowLeft, BookOpen, ChevronRight, X, Sparkles } from "lucide-react";

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

interface NutritionTip {
  id: string;
  tag: string;
  title: string;
  summary: string;
  icon: string;
  content: string;
  vetQuote: string;
}

export default function VetBooking() {
  const [subTab, setSubTab] = useState<"booking" | "tips">("booking");
  const [selectedDoc, setSelectedDoc] = useState<string>("carlos");
  const [selectedDate, setSelectedDate] = useState<string>("hoy");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isBooked, setIsBooked] = useState<boolean>(false);
  
  // Chat simulator state
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Selected Tip Modal state
  const [selectedTip, setSelectedTip] = useState<NutritionTip | null>(null);

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

  const nutritionTips: NutritionTip[] = [
    {
      id: "agua-gatos",
      tag: "Hidratación",
      title: "La importancia del agua en gatos",
      summary: "Los felinos tienen un bajo estímulo de sed natural. Aprende cómo evitar problemas urinarios.",
      icon: "💧",
      content: "Los gatos evolucionaron como animales del desierto y obtienen la mayor parte de su hidratación de sus presas. Al comer croquetas secas (que solo tienen ~10% de agua), suelen estar crónicamente deshidratados si no compensan bebiendo activamente. Esto concentra su orina, predisponiéndolos a cristales urinarios, cálculos e insuficiencia renal crónica.\n\nSe recomienda que un gato consuma aproximadamente de 50 a 60 ml de agua por cada kilo de peso corporal al día. Para motivarlo:\n1. Utiliza fuentes de agua en movimiento (adoran el agua corriente).\n2. Separa su plato de comida del plato de agua (por instinto no beben cerca de donde cazan/comen).\n3. Sirve raciones húmedas (latas o sobres) diariamente combinadas con su alimento seco.",
      vetQuote: "Dra. Laura Ortiz: 'Agregar una cucharada de agua tibia a su porción húmeda diaria puede duplicar su ingesta de líquidos sin alterar su dieta.'"
    },
    {
      id: "obesidad-perros",
      tag: "Control de Peso",
      title: "Controlando la obesidad en perros",
      summary: "La obesidad reduce la expectativa de vida hasta en 2 años. Controla las calorías con precisión.",
      icon: "⚖️",
      content: "La obesidad canina es la patología nutricional más común en clínicas. No solo limita la movilidad y daña las articulaciones (artrosis), sino que también genera un estado inflamatorio crónico que puede detonar problemas cardíacos y diabetes.\n\nEl primer paso es usar la escala de Condición Corporal (BCS) del 1 al 9. Un perro ideal (BCS 5) debe tener cintura visible vista desde arriba y costillas fácilmente palpables sin presionar fuerte.\n\nCon Feedly Pet puedes calcular el MER exacto y programar horarios fijos. Evita alimentar 'a ojo' y no uses tazas medidoras genéricas, ya que pueden variar hasta un 30% en peso real de alimento seco respecto a la báscula digital.",
      vetQuote: "Dr. Carlos Mendoza: 'Es fundamental racionar por gramos exactos y no ceder a la mirada suplicante. Un premio extra de mesa equivale a una hamburguesa para nosotros.'"
    },
    {
      id: "leer-etiquetas",
      tag: "Educación",
      title: "Cómo leer etiquetas de alimentos",
      summary: "Descubre si estás pagando por carne real o por relleno industrial de maíz.",
      icon: "🔍",
      content: "Las etiquetas de alimentos para mascotas están ordenadas por peso de ingrediente antes del cocinado. Busca marcas donde los primeros 2 o 3 ingredientes sean fuentes de proteína animal declarada (ej. 'Carne de pollo deshidratada', 'Salmón fresco') en lugar de subproductos innominados o harinas vegetales de relleno (ej. 'Gluten de maíz', 'Harina de soya').\n\nAnaliza la cantidad de fibra (importante en dietas light) y el porcentaje de grasa. Los alimentos premium suelen tener mayor digestibilidad, lo que significa que tu mascota necesita menos gramos diarios para satisfacer sus requerimientos nutricionales.",
      vetQuote: "Dr. Carlos Mendoza: 'Si el primer ingrediente listado es maíz, trigo o soya, estás comprando una dieta basada en carbohidratos. Los perros y gatos necesitan principalmente proteínas animales.'"
    },
    {
      id: "patologias-dieta",
      tag: "Veterinaria",
      title: "Patologías comunes y su relación con la dieta",
      summary: "Cómo la nutrición terapéutica puede controlar la insuficiencia renal, diabetes y alergias.",
      icon: "🩺",
      content: "Muchas patologías crónicas se manejan principalmente a través de la nutrición clínica:\n- **Insuficiencia Renal**: Requiere dietas con restricción moderada de proteínas pero de altísima calidad, fósforo reducido para proteger el glomérulo, y sodio bajo para evitar hipertensión.\n- **Diabetes**: Necesita carbohidratos complejos de absorción lenta y alta fibra soluble para evitar picos rápidos de glucosa postprandial.\n- **Alergias Alimentarias**: Se manejan con fuentes de proteína novedosas (proteína a la que la mascota nunca haya estado expuesta) o proteínas hidrolizadas (las moléculas se rompen tanto que el sistema inmune no las detecta como alérgenos).",
      vetQuote: "Dra. Laura Ortiz: 'Nunca cambies a una dieta terapéutica renal o metabólica sin antes realizar exámenes sanguíneos de control a tu mascota.'"
    },
    {
      id: "rer-mer-calc",
      tag: "Ciencia",
      title: "¿Qué significan el RER y el MER?",
      summary: "La base científica detrás del motor de cálculo energético de la aplicación.",
      icon: "⚡",
      content: "Nuestra calculadora utiliza fórmulas validadas por la WSAVA (World Small Animal Veterinary Association):\n1. **RER (Resting Energy Requirement)**: Es la energía mínima que el cuerpo necesita para mantener las funciones vitales en reposo (respirar, circulación, digestión). Se calcula como: RER = 70 * (Peso en Kg)^0.75.\n2. **MER (Maintenance Energy Requirement)**: Es la energía total recomendada para su día a día. Se calcula multiplicando el RER por factores de ajuste según especie, estado reproductivo (castrado/entero), nivel de actividad física y condición corporal (BCS).\n\nFeedly Pet calcula esto dinámicamente y lo traduce en la ración exacta en gramos basándose en las calorías de la croqueta que ingreses.",
      vetQuote: "Dr. Carlos Mendoza: 'El cálculo del MER no es estático. Si tu mascota baja de peso o aumenta su actividad en verano, debemos reajustar los parámetros en la app.'"
    }
  ];

  const handleBooking = () => {
    if (!selectedTime) return;
    setIsBooked(true);

    const docName = doctors.find((d) => d.id === selectedDoc)?.name || "Veterinario";

    // Setup initial chat messages
    setChatMessages([
      {
        id: "1",
        sender: "vet",
        text: `¡Hola! Soy el ${docName}. He recibido tu solicitud de asesoría nutricional gratuita incluida con tu dispensador Feedly Pet.`,
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
        replyText = "¡Hola! Estoy atento a tus comentarios. Por favor cuéntame si tiene alguna alergia alimentaria o patología.";
      } else if (inputText.toLowerCase().includes("enfermo") || inputText.toLowerCase().includes("alergia") || inputText.toLowerCase().includes("patologia") || inputText.toLowerCase().includes("renal")) {
        replyText = "Ese es un dato muy importante. Tomaremos nota de esta condición médica para formular el límite de Kcal diarias y recomendar el tipo de alimento adecuado en la videollamada.";
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
    <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-4">
      {/* Subtab Selector */}
      <div className="flex bg-stone-100 dark:bg-stone-850 p-0.5 rounded-xl">
        <button
          onClick={() => setSubTab("booking")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            subTab === "booking"
              ? "bg-white dark:bg-stone-700 text-orange-600 dark:text-stone-50 shadow-sm"
              : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
          }`}
        >
          🩺 Consulta Vet
        </button>
        <button
          onClick={() => setSubTab("tips")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            subTab === "tips"
              ? "bg-white dark:bg-stone-700 text-orange-600 dark:text-stone-50 shadow-sm"
              : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
          }`}
        >
          💡 Tips de Nutrición
        </button>
      </div>

      {subTab === "booking" ? (
        // 1. BOOKING VIEW
        !isBooked ? (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 border-b border-stone-100 dark:border-stone-800 pb-2.5">
              <Video className="w-4.5 h-4.5 text-orange-500" />
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-50">
                Asesoría Veterinaria Gratuita
              </h3>
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Tu dispensador inteligente incluye una sesión de telemedicina sin costo con un MV especialista en nutrición animal.
            </p>

            {/* Doctor Switcher */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                Selecciona un Especialista
              </label>
              <div className="grid grid-cols-2 gap-2">
                {doctors.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDoc(d.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedDoc === d.id
                        ? "border-orange-500 bg-orange-50/20 dark:bg-orange-950/10 shadow-sm"
                        : "border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-850"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{d.avatar}</span>
                      <div>
                        <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                          {d.name.split(" ")[1]} {d.name.split(" ")[2]}
                        </h4>
                        <p className="text-[9px] text-stone-400 line-clamp-1">{d.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-100/50 dark:border-stone-800/40 text-[9px] text-stone-500">
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
              <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                Selecciona Fecha
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {dates.map((dt) => (
                  <button
                    key={dt.id}
                    onClick={() => setSelectedDate(dt.id)}
                    className={`flex-1 min-w-[50px] py-2 px-1 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      selectedDate === dt.id
                        ? "border-orange-500 bg-orange-500 text-white shadow-sm"
                        : "border-stone-100 dark:border-stone-850 text-stone-600 dark:text-stone-400 hover:bg-stone-50"
                    }`}
                  >
                    <span className="text-[10px] font-bold">{dt.label}</span>
                    <span className={`text-[8px] ${selectedDate === dt.id ? "text-orange-100" : "text-stone-400"}`}>
                      {dt.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                Selecciona Horario
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {times.map((tm) => (
                  <button
                    key={tm}
                    onClick={() => setSelectedTime(tm)}
                    className={`py-2 px-1 rounded-xl border text-[9px] font-bold text-center transition-all cursor-pointer ${
                      selectedTime === tm
                        ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400"
                        : "border-stone-100 dark:border-stone-850 text-stone-600 dark:text-stone-400 hover:bg-stone-50"
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
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-white font-medium rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/10 active:scale-[0.98] cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              Reservar Asesoría
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* Booking Confirmation Card */}
            <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/50 rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-orange-850 dark:text-orange-400">
                  ¡Consulta Agendada Exitosamente!
                </h4>
                <p className="text-[10px] text-stone-600 dark:text-stone-400 mt-1">
                  Videollamada con <span className="font-semibold">{docInfo?.name}</span>
                </p>
                <div className="flex gap-3 mt-2 text-[9px] text-stone-500 font-semibold">
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
            <div className="border-t border-stone-150 dark:border-stone-800 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-orange-500" /> Chat con Nutriólogo
                </span>
                <button
                  onClick={() => {
                    setIsBooked(false);
                    setSelectedTime("");
                  }}
                  className="text-[9px] text-stone-450 hover:text-orange-600 dark:text-stone-400 dark:hover:text-orange-400 font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  <ArrowLeft className="w-2.5 h-2.5" /> Cambiar Hora
                </button>
              </div>

              {/* Chat message history container */}
              <div className="bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-100 dark:border-stone-900 h-[160px] overflow-y-auto p-3 space-y-2.5 text-[10px] scrollbar-thin">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${msg.sender === "user" ? "ml-auto items-end" : "items-start"}`}
                  >
                    <div
                      className={`px-3 py-2 rounded-2xl leading-normal ${
                        msg.sender === "user"
                          ? "bg-orange-500 text-white rounded-tr-none"
                          : "bg-white dark:bg-stone-850 border border-stone-150 dark:border-stone-700 text-stone-800 dark:text-stone-200 rounded-tl-none shadow-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[8px] text-stone-400 mt-0.5 px-1">{msg.time}</span>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-1 bg-white dark:bg-stone-850 border border-stone-150 dark:border-stone-700 px-3 py-2.5 rounded-2xl rounded-tl-none w-[55px] text-stone-400">
                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
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
                  className="flex-1 px-3 py-2 text-[10px] bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-stone-900 dark:text-stone-100"
                />
                <button
                  type="submit"
                  className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )
      ) : (
        // 2. NUTRITION TIPS VIEW
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-1.5 border-b border-stone-100 dark:border-stone-800 pb-2.5">
            <BookOpen className="w-4.5 h-4.5 text-orange-500" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-50">
              Guías y Consejos de Nutrición
            </h3>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            Aprende sobre las necesidades dietéticas de tus mascotas con estas fichas informativas escritas por nuestros veterinarios asociados.
          </p>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
            {nutritionTips.map((tip) => (
              <button
                key={tip.id}
                onClick={() => setSelectedTip(tip)}
                className="w-full text-left p-3 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-850 hover:border-orange-500/30 rounded-2xl transition-all flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl bg-white dark:bg-stone-850 p-1.5 rounded-xl border border-stone-100 dark:border-stone-800 shadow-sm shrink-0">
                    {tip.icon}
                  </span>
                  <div>
                    <span className="text-[8px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest bg-orange-50 dark:bg-orange-950/20 px-1.5 py-0.5 rounded-md">
                      {tip.tag}
                    </span>
                    <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 mt-1 line-clamp-1 group-hover:text-orange-500 transition-colors">
                      {tip.title}
                    </h4>
                    <p className="text-[9px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                      {tip.summary}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            ))}
          </div>

          {/* Expanded Tip Modal */}
          {selectedTip && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="w-full max-w-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-3xl p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto scrollbar-thin">
                <button
                  onClick={() => setSelectedTip(null)}
                  className="absolute right-4 top-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 rounded-full bg-stone-100 dark:bg-stone-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-3xl">{selectedTip.icon}</span>
                  <div>
                    <span className="text-[8px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest bg-orange-50 dark:bg-orange-950/20 px-1.5 py-0.5 rounded-md">
                      {selectedTip.tag}
                    </span>
                    <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-50 mt-1 pr-6">
                      {selectedTip.title}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3.5 text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line border-t border-stone-100 dark:border-stone-800 pt-3.5">
                  {selectedTip.content}
                </div>

                <div className="bg-orange-50/50 dark:bg-orange-950/15 border-l-4 border-orange-500 p-3 rounded-r-2xl mt-4 text-[10px] text-orange-900 dark:text-orange-350 italic flex gap-1.5">
                  <Sparkles className="w-4.5 h-4.5 text-orange-500 shrink-0 mt-0.5" />
                  <p>{selectedTip.vetQuote}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
