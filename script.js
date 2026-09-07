const EVENT_CONFIG = {
  eventDate: {
    year: 2026,
    month: 10,
    day: 10,
  },
  audioSrc: "assets/sounds/Photograph.mp3",
  whatsappNumber: "+52 1 993 153 6580",
  whatsappMessage: "Hola, confirmo mi asistencia a los XV años de Frida Paulina Perez Hernandez el 10 de octubre de 2026. Gracias por la invitación.",
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initReveals() {
  const elements = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -6%" },
  );

  elements.forEach((element) => observer.observe(element));
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

function initAudioPlayer() {
  const audio = document.querySelector("#event-audio");
  const player = document.querySelector("#audio-player");
  const toggle = document.querySelector("#audio-toggle");
  const progress = document.querySelector("#audio-progress");
  const status = document.querySelector("#audio-status");
  const time = document.querySelector("#audio-time");

  if (!EVENT_CONFIG.audioSrc) {
    toggle.disabled = true;
    progress.disabled = true;
    status.textContent = "Audio no disponible";
    return;
  }

  audio.src = EVENT_CONFIG.audioSrc;
  status.textContent = "Lista para reproducir";

  toggle.addEventListener("click", async () => {
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        status.textContent = "No fue posible reproducir el audio";
      }
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", () => {
    player.classList.add("is-playing");
    toggle.setAttribute("aria-label", "Pausar canción");
    status.textContent = "Reproduciendo";
  });

  audio.addEventListener("pause", () => {
    player.classList.remove("is-playing");
    toggle.setAttribute("aria-label", "Reproducir canción");
    status.textContent = audio.ended ? "Canción finalizada" : "En pausa";
  });

  audio.addEventListener("timeupdate", () => {
    const percentage = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    progress.value = String(percentage);
    time.textContent = formatTime(audio.currentTime);
  });

  progress.addEventListener("input", () => {
    if (audio.duration) audio.currentTime = (Number(progress.value) / 100) * audio.duration;
  });
}

function initCountdown() {
  const { year, month, day } = EVENT_CONFIG.eventDate;
  const eventTime = new Date(year, month - 1, day).getTime();
  const message = document.querySelector("#countdown-message");
  const fields = {
    days: document.querySelector('[data-unit="days"]'),
    hours: document.querySelector('[data-unit="hours"]'),
    minutes: document.querySelector('[data-unit="minutes"]'),
    seconds: document.querySelector('[data-unit="seconds"]'),
  };

  const update = () => {
    const remaining = Math.max(0, eventTime - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    const values = {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };

    Object.entries(values).forEach(([unit, value]) => {
      fields[unit].textContent = String(value).padStart(2, "0");
    });

    if (remaining === 0) {
      message.textContent = "Este sueño ya floreció. Gracias por ser parte de él.";
      return false;
    }

    return true;
  };

  if (update()) window.setInterval(update, 1000);
}

function initRsvp() {
  const link = document.querySelector("#rsvp-link");
  const note = document.querySelector("#rsvp-note");
  const number = EVENT_CONFIG.whatsappNumber.replace(/\D/g, "");

  if (number.length >= 10) {
    link.href = `https://wa.me/${number}?text=${encodeURIComponent(EVENT_CONFIG.whatsappMessage)}`;
    link.target = "_blank";
    link.rel = "noreferrer";
    note.hidden = true;
    return;
  }

  link.setAttribute("aria-disabled", "true");
  link.addEventListener("click", (event) => event.preventDefault());
}

initReveals();
initAudioPlayer();
initCountdown();
initRsvp();
