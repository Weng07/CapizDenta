/* =========================================================
   CAPIZDENTA MAIN JS
   Firebase Firestore Global Booking Version
   - 2 bookings per date/time slot
   - Customer EmailJS confirmation
   - Business EmailJS notification
========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  doc,
  collection,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* =========================================================
   FIREBASE CONFIG
   Get this from:
   Firebase Console > Project Settings > General > Your apps > SDK setup and configuration
========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyCGMsSdhBoRYDLwi6k3TneCB11815K1Bv0",
    authDomain: "capizdenta.firebaseapp.com",
    projectId: "capizdenta",
    storageBucket: "capizdenta.firebasestorage.app",
    messagingSenderId: "220293560611",
    appId: "1:220293560611:web:b74571feb2305acb437496",
    measurementId: "G-NKW8L70F54"
  };

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

/* =========================================================
   EMAILJS CONFIG
========================================================= */

const EMAILJS_PUBLIC_KEY = "OJgNHaJtiMdEJ4yTq";
const EMAILJS_SERVICE_ID = "service_rzq22xn";
const EMAILJS_CUSTOMER_TEMPLATE_ID = "customer_template1";
const EMAILJS_BUSINESS_TEMPLATE_ID = "template_g7tglpp";

const BUSINESS_EMAIL = "dental.talks@yahoo.com";

/* =========================================================
   BOOKING SETTINGS
========================================================= */

const MAX_BOOKINGS_PER_SLOT = 2;

/* =========================================================
   INIT
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  if (typeof emailjs !== "undefined") {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  setupNavbar();
  setupMobileMenu();
  setupRevealAnimations();
  setupBackToTop();
  highlightToday();
  updateSlotsDisplay();

  const dateInput = document.getElementById("f-date");
  const timeInput = document.getElementById("f-time");

  if (dateInput) dateInput.addEventListener("change", updateSlotsDisplay);
  if (timeInput) timeInput.addEventListener("change", updateSlotsDisplay);
});

/* =========================================================
   NAVBAR
========================================================= */

function setupNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  window.addEventListener("scroll", function () {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  });
}

/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobileMenu() {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener("click", function () {
    hamburger.classList.toggle("open");
    mobileMenu.classList.toggle("open");
  });
}

window.closeMobile = function () {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  if (hamburger) hamburger.classList.remove("open");
  if (mobileMenu) mobileMenu.classList.remove("open");
};

/* =========================================================
   SMOOTH SCROLL
========================================================= */

window.scrollToSection = function (selector) {
  const section = document.querySelector(selector);
  if (!section) return;

  section.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
};

/* =========================================================
   REVEAL ANIMATION
========================================================= */

function setupRevealAnimations() {
  const items = document.querySelectorAll(".reveal");

  if (!items.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach(function (item) {
    observer.observe(item);
  });
}

/* =========================================================
   TODAY HIGHLIGHT
========================================================= */

function highlightToday() {
  const day = new Date().getDay();

  const rows = {
    0: "row-sun",
    1: "row-mon",
    3: "row-wed",
    4: "row-thu",
    5: "row-fri",
    6: "row-sat"
  };

  const row = document.getElementById(rows[day]);
  if (row) row.classList.add("today-row");
}

/* =========================================================
   FIRESTORE SLOT HELPERS
========================================================= */

function makeSlotId(date, time) {
  return `${date}_${time}`.replaceAll("/", "-").replaceAll(":", "-").replaceAll(" ", "_");
}

function getSlotRef(date, time) {
  return doc(db, "bookingSlots", makeSlotId(date, time));
}

function getBookingsCollectionRef() {
  return collection(db, "bookings");
}

/* =========================================================
   SLOT DISPLAY
   Reads global Firestore slot count.
========================================================= */

async function updateSlotsDisplay() {
  const dateInput = document.getElementById("f-date");
  const timeInput = document.getElementById("f-time");
  const slotsText = document.getElementById("slotsText");
  const slotsBanner = document.getElementById("slotsBanner");

  if (!dateInput || !timeInput || !slotsText || !slotsBanner) return;

  const date = dateInput.value;
  const time = timeInput.value;

  slotsBanner.classList.remove("low", "full");

  if (!date || !time) {
    slotsText.textContent = "📅 Select a date and time to see available slots";
    return;
  }

  slotsText.textContent = "Checking available slots...";

  try {
    const slotRef = getSlotRef(date, time);

    const remaining = await runTransaction(db, async function (transaction) {
      const slotSnap = await transaction.get(slotRef);

      const currentCount = slotSnap.exists() ? slotSnap.data().count || 0 : 0;
      return MAX_BOOKINGS_PER_SLOT - currentCount;
    });

    if (remaining <= 0) {
      slotsText.textContent = "This time slot is fully booked.";
      slotsBanner.classList.add("full");
    } else if (remaining === 1) {
      slotsText.textContent = "1 slot available for this time.";
      slotsBanner.classList.add("low");
    } else {
      slotsText.textContent = `${remaining} slots available for this time.`;
    }
  } catch (error) {
    console.error("Slot check failed:", error);
    slotsText.textContent = "Unable to check slots right now.";
  }
}

window.updateSlotsDisplay = updateSlotsDisplay;

/* =========================================================
   SUBMIT BOOKING
   Uses Firestore transaction:
   - Check slot count
   - If less than 2, reserve slot
   - Save booking details
========================================================= */

window.submitBooking = async function () {
  const submitBtn = document.getElementById("submitBtn");

  const formData = {
    name: getValue("f-name"),
    phone: getValue("f-phone"),
    email: getValue("f-email"),
    date: getValue("f-date"),
    time: getValue("f-time"),
    service: getValue("f-service"),
    notes: getValue("f-notes")
  };

  const error = validateBooking(formData);

  if (error) {
    showToast(error);
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
  }

  try {
    await reserveSlotAndSaveBooking(formData);

    await sendCustomerEmail(formData);
    await sendBusinessEmail(formData);

    clearForm();
    showSuccess();
    await updateSlotsDisplay();

    showToast("Appointment submitted. Please check your email.");
  } catch (error) {
    console.error("Submission failed:", error);

    if (error.message === "SLOT_FULL") {
      showToast("This time slot is already full. Please choose another time.");
      await updateSlotsDisplay();
    } else {
      showToast("Submission failed. Please try again or contact the clinic.");
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Appointment Request";
    }
  }
};

/* =========================================================
   FIRESTORE TRANSACTION
========================================================= */

async function reserveSlotAndSaveBooking(data) {
  const slotRef = getSlotRef(data.date, data.time);
  const bookingsRef = doc(getBookingsCollectionRef());

  await runTransaction(db, async function (transaction) {
    const slotSnap = await transaction.get(slotRef);

    const currentCount = slotSnap.exists() ? slotSnap.data().count || 0 : 0;

    if (currentCount >= MAX_BOOKINGS_PER_SLOT) {
      throw new Error("SLOT_FULL");
    }

    transaction.set(
      slotRef,
      {
        date: data.date,
        time: data.time,
        count: currentCount + 1,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    transaction.set(bookingsRef, {
      name: data.name,
      phone: data.phone,
      email: data.email,
      date: data.date,
      time: data.time,
      service: data.service,
      notes: data.notes || "None",
      status: "pending_confirmation",
      createdAt: serverTimestamp()
    });
  });
}

/* =========================================================
   EMAILJS FUNCTIONS
========================================================= */

function sendCustomerEmail(data) {
  if (typeof emailjs === "undefined") {
    return Promise.reject(new Error("EmailJS is not loaded."));
  }

  return emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_CUSTOMER_TEMPLATE_ID,
    {
      to_email: data.email,
      name: data.name,
      phone: data.phone,
      email: data.email,
      date: data.date,
      time: data.time,
      service: data.service,
      notes: data.notes || "None"
    }
  );
}

function sendBusinessEmail(data) {
  if (typeof emailjs === "undefined") {
    return Promise.reject(new Error("EmailJS is not loaded."));
  }

  return emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_BUSINESS_TEMPLATE_ID,
    {
      business_email: BUSINESS_EMAIL,
      name: data.name,
      phone: data.phone,
      email: data.email,
      date: data.date,
      time: data.time,
      service: data.service,
      notes: data.notes || "None"
    }
  );
}

/* =========================================================
   FORM HELPERS
========================================================= */

function getValue(id) {
  const field = document.getElementById(id);
  return field ? field.value.trim() : "";
}

function validateBooking(data) {
  if (!data.name) return "Please enter your full name.";
  if (!data.phone) return "Please enter your contact number.";
  if (!data.email) return "Please enter your email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "Please enter a valid email address.";
  if (!data.date) return "Please choose your preferred date.";
  if (!data.time) return "Please choose your preferred time.";
  if (!data.service) return "Please choose a service.";
  return "";
}

function clearForm() {
  ["f-name", "f-phone", "f-email", "f-date", "f-time", "f-service", "f-notes"].forEach(function (id) {
    const field = document.getElementById(id);
    if (field) field.value = "";
  });
}

/* =========================================================
   UI FEEDBACK
========================================================= */

function showSuccess() {
  const success = document.getElementById("formSuccess");
  const btn = document.getElementById("submitBtn");

  if (btn) {
    btn.disabled = false;
    btn.textContent = "Submit Appointment Request";
  }

  if (success) {
    success.style.display = "block";
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) {
    alert(message);
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(function () {
    toast.classList.remove("show");
  }, 4000);
}

/* =========================================================
   BACK TO TOP
========================================================= */

function setupBackToTop() {
  const btn = document.getElementById("btt");
  if (!btn) return;

  window.addEventListener("scroll", function () {
    btn.classList.toggle("show", window.scrollY > 400);
  });

  btn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

/* =========================================================
   FAQ
========================================================= */

window.toggleFaq = function (button) {
  const item = button.closest(".faq-item");

  document.querySelectorAll(".faq-item").forEach(function (faq) {
    if (faq !== item) faq.classList.remove("open");
  });

  if (item) item.classList.toggle("open");
};