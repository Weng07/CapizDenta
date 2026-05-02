/* ════════════════════════════════════════════════════════
   CAPIZDENTA — js/main.js
   ────────────────────────────────────────────────────────
   TABLE OF CONTENTS
   1.  EMAILJS CONFIGURATION
   2.  BOOKING SETTINGS (day limit, storage key)
   3.  NAVBAR — scroll shadow effect
   4.  MOBILE MENU — hamburger toggle
   5.  HELPERS — scrollToSection, closeMobile
   6.  TODAY'S HOURS — highlight current day row
   7.  DATE FIELD — set minimum to today
   8.  SLOTS COUNTER — read/write daily booking count
   9.  FAQ ACCORDION — open/close questions
   10. FORM VALIDATION — check required fields
   11. EMAIL NOTIFICATION — send via EmailJS
   12. SMS NOTIFICATION — premium placeholder (not active)
   13. BOOKING SUBMISSION — main submit handler
   14. FORM RESET — clear all fields after submit
   15. TOAST NOTIFICATION — brief success message
   16. BACK-TO-TOP BUTTON
   17. SCROLL REVEAL ANIMATION
════════════════════════════════════════════════════════ */


/* ────────────────────────────────────────────────────────
   1. EMAILJS CONFIGURATION
   ──────────────────────────────────────────────────────
   EmailJS lets you send emails directly from the browser
   without a backend server. Free tier = 200 emails/month.

   HOW TO SET UP:
     Step 1: Sign up at https://www.emailjs.com
     Step 2: Add an Email Service (Gmail, Yahoo, Outlook)
             → Copy the Service ID (e.g. "service_abc123")
     Step 3: Create an Email Template
             Use these variables in your template:
               {{patient_name}}    — patient's full name
               {{patient_phone}}   — patient's phone number
               {{patient_email}}   — patient's email
               {{appointment_date}} — selected date
               {{appointment_time}} — selected time
               {{service_type}}    — service requested
               {{notes}}           — additional notes
             → Copy the Template ID (e.g. "template_xyz789")
     Step 4: Go to Account > API Keys
             → Copy your Public Key
     Step 5: Replace the three placeholder values below.

   CLINIC NOTIFICATION:
     Create a second template for the clinic's own email.
     Set the "To Email" in that template to:
       dental.talks@yahoo.com
     Replace EMAILJS_CLINIC_TEMPLATE_ID below.
────────────────────────────────────────────────────────── */
const EMAILJS_PUBLIC_KEY      = 'YOUR_EMAILJS_PUBLIC_KEY';    // ← Replace this
const EMAILJS_SERVICE_ID      = 'YOUR_SERVICE_ID';             // ← Replace this
const EMAILJS_PATIENT_TEMPLATE = 'YOUR_PATIENT_TEMPLATE_ID';  // ← Patient confirmation
const EMAILJS_CLINIC_TEMPLATE  = 'YOUR_CLINIC_TEMPLATE_ID';   // ← Clinic notification

// Initialize EmailJS with your public key
// This runs once when the page loads.
// If the key is still a placeholder, EmailJS calls will
// fail silently — the booking still submits normally.
if (EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}


/* ────────────────────────────────────────────────────────
   2. BOOKING SETTINGS
   ──────────────────────────────────────────────────────
   MAX_BOOKINGS_PER_DAY: Maximum online bookings allowed
   per calendar date. When this number is reached, the
   submit button is disabled and a "fully booked" message
   is shown. Walk-in availability is separate.

   STORAGE_KEY_PREFIX: localStorage key prefix used to
   store the booking count per date. Format:
     "capizdenta_bookings_2025-06-15" = 12
   Data is stored in the visitor's browser — it resets
   if they clear browser storage. For a shared server-side
   counter, you would need a backend API (future upgrade).

   TO CHANGE THE DAILY LIMIT: edit MAX_BOOKINGS_PER_DAY.
────────────────────────────────────────────────────────── */
const MAX_BOOKINGS_PER_DAY  = 50;
const STORAGE_KEY_PREFIX    = 'capizdenta_bookings_';


/* ────────────────────────────────────────────────────────
   3. NAVBAR — SCROLL SHADOW EFFECT
   ──────────────────────────────────────────────────────
   Listens for window scroll events.
   When user scrolls more than 40px, adds .scrolled class
   to the <nav> element.
   CSS applies a box-shadow when .scrolled is present.
   Also controls the back-to-top button visibility (section 16).
────────────────────────────────────────────────────────── */
window.addEventListener('scroll', () => {
  // Navbar shadow
  document.getElementById('navbar')
    .classList.toggle('scrolled', window.scrollY > 40);

  // Back-to-top visibility (also handled here for performance —
  // one scroll listener instead of two)
  document.getElementById('btt')
    .classList.toggle('show', window.scrollY > 400);
});


/* ────────────────────────────────────────────────────────
   4. MOBILE MENU — HAMBURGER TOGGLE
   ──────────────────────────────────────────────────────
   Clicking the hamburger button toggles the .open class
   on the #mobileMenu div.
   CSS shows the menu as a dropdown when .open is present.
────────────────────────────────────────────────────────── */
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.toggle('open');
});


/* ────────────────────────────────────────────────────────
   5. HELPERS
   ──────────────────────────────────────────────────────
   closeMobile() — called by each mobile menu <a> link
   after the user taps it, so the menu collapses.

   scrollToSection(selector) — smooth scrolls to any
   CSS selector on the page. Used by the nav CTA button.
────────────────────────────────────────────────────────── */
function closeMobile() {
  document.getElementById('mobileMenu').classList.remove('open');
}

function scrollToSection(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}


/* ────────────────────────────────────────────────────────
   6. TODAY'S HOURS — HIGHLIGHT CURRENT DAY ROW
   ──────────────────────────────────────────────────────
   Maps JavaScript's getDay() values to the <tr> row IDs
   defined in the hours table in index.html.
   getDay() returns: 0=Sun, 1=Mon, 2=Tue, 3=Wed, ...
   Tuesday (2) is closed — no row to highlight.
   Adds .today-row CSS class to the matching <tr>.
────────────────────────────────────────────────────────── */
const DAY_ROW_MAP = {
  0: 'row-sun',   // Sunday
  1: 'row-mon',   // Monday
  // 2 = Tuesday (closed — no row ID)
  3: 'row-wed',   // Wednesday
  4: 'row-thu',   // Thursday
  5: 'row-fri',   // Friday
  6: 'row-sat'    // Saturday
};

const todayDayIndex = new Date().getDay();
const todayRowId    = DAY_ROW_MAP[todayDayIndex];

if (todayRowId) {
  const todayRow = document.getElementById(todayRowId);
  if (todayRow) todayRow.classList.add('today-row');
}


/* ────────────────────────────────────────────────────────
   7. DATE FIELD — SET MINIMUM DATE
   ──────────────────────────────────────────────────────
   Prevents users from selecting past dates in the
   appointment date picker. Sets the min attribute to
   today's date in YYYY-MM-DD format.
────────────────────────────────────────────────────────── */
const dateInput = document.getElementById('f-date');
if (dateInput) {
  // toISOString() returns "2025-06-15T..." — we take only the date part
  dateInput.min = new Date().toISOString().split('T')[0];
}


/* ────────────────────────────────────────────────────────
   8. SLOTS COUNTER — DAILY BOOKING LIMIT SYSTEM
   ──────────────────────────────────────────────────────
   getBookingsForDate(dateStr)
     Reads how many bookings exist for a given date
     from localStorage. Key format: "capizdenta_bookings_2025-06-15"
     Returns a number (0 if no bookings yet).

   incrementBookingsForDate(dateStr)
     Adds 1 to the booking count for the given date
     and saves it back to localStorage.

   updateSlotsDisplay()
     Called by the date field's onchange event.
     Reads the current count, calculates remaining slots,
     and updates the #slotsBanner element with:
       - Green-ish: plenty of slots
       - Orange (.slots-low): 5 or fewer remaining
       - Red (.slots-full): 0 remaining, disables submit
     Also enables/disables the submit button.
────────────────────────────────────────────────────────── */

/** Returns the current booking count for a date string (YYYY-MM-DD) */
function getBookingsForDate(dateStr) {
  const key   = STORAGE_KEY_PREFIX + dateStr;
  const value = localStorage.getItem(key);
  return value ? parseInt(value, 10) : 0;
}

/** Increments the booking count for a date by 1 */
function incrementBookingsForDate(dateStr) {
  const key     = STORAGE_KEY_PREFIX + dateStr;
  const current = getBookingsForDate(dateStr);
  localStorage.setItem(key, current + 1);
}

/** Updates the slots banner UI based on selected date */
function updateSlotsDisplay() {
  const dateStr   = document.getElementById('f-date').value;
  const banner    = document.getElementById('slotsBanner');
  const slotsText = document.getElementById('slotsText');
  const submitBtn = document.getElementById('submitBtn');

  // No date selected yet
  if (!dateStr) {
    banner.className    = 'slots-banner';
    slotsText.textContent = '📅 Select a date to see available slots';
    submitBtn.disabled  = false;
    return;
  }

  const booked    = getBookingsForDate(dateStr);
  const remaining = MAX_BOOKINGS_PER_DAY - booked;

  if (remaining <= 0) {
    // Fully booked for this date
    banner.className      = 'slots-banner slots-full';
    slotsText.textContent = `🚫 Fully booked for this date. Please choose another day.`;
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Date Fully Booked';
  } else if (remaining <= 5) {
    // Low availability warning
    banner.className      = 'slots-banner slots-low';
    slotsText.textContent = `⚠️ Only ${remaining} slot${remaining === 1 ? '' : 's'} remaining for this date!`;
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Submit Appointment Request';
  } else {
    // Good availability
    banner.className      = 'slots-banner';
    slotsText.textContent = `✅ ${remaining} of ${MAX_BOOKINGS_PER_DAY} slots available on this date`;
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Submit Appointment Request';
  }
}


/* ────────────────────────────────────────────────────────
   9. FAQ ACCORDION
   ──────────────────────────────────────────────────────
   Called by each FAQ question button's onclick.
   Only one FAQ answer can be open at a time.
   Clicking an open item closes it (toggle behavior).
   CSS controls the max-height transition for smooth
   open/close animation (.faq-a.open in styles.css).
────────────────────────────────────────────────────────── */
function toggleFaq(btn) {
  const answer      = btn.nextElementSibling;
  const isOpen      = answer.classList.contains('open');

  // Close all open FAQ items first
  document.querySelectorAll('.faq-a.open').forEach(a  => a.classList.remove('open'));
  document.querySelectorAll('.faq-q.open').forEach(b  => b.classList.remove('open'));

  // If the clicked item was not already open, open it now
  if (!isOpen) {
    answer.classList.add('open');
    btn.classList.add('open');
  }
}


/* ────────────────────────────────────────────────────────
   10. FORM VALIDATION
   ──────────────────────────────────────────────────────
   validateBookingForm()
   Checks that all required fields have values before
   allowing the form to submit. Returns true if valid.
   Shows a native browser alert listing what's missing.
   Required fields: name, phone, date, service.
   Email is optional (but needed for email confirmation).
────────────────────────────────────────────────────────── */
function validateBookingForm() {
  const name    = document.getElementById('f-name').value.trim();
  const phone   = document.getElementById('f-phone').value.trim();
  const date    = document.getElementById('f-date').value;
  const service = document.getElementById('f-service').value;

  const missing = [];
  if (!name)    missing.push('Full Name');
  if (!phone)   missing.push('Contact Number');
  if (!date)    missing.push('Preferred Date');
  if (!service) missing.push('Service Needed');

  if (missing.length > 0) {
    alert('Please fill in the following required fields:\n• ' + missing.join('\n• '));
    return false;
  }
  return true;
}


/* ────────────────────────────────────────────────────────
   11. EMAIL NOTIFICATION — EMAILJS
   ──────────────────────────────────────────────────────
   sendEmailConfirmation(formData)
   Called during booking submission if:
     • The patient checked "Email Confirmation"
     • The patient provided an email address
     • EmailJS has been configured (not placeholder keys)

   Sends two emails:
     1. Patient confirmation (EMAILJS_PATIENT_TEMPLATE)
     2. Clinic notification (EMAILJS_CLINIC_TEMPLATE)

   formData is a plain object with these keys:
     patient_name, patient_phone, patient_email,
     appointment_date, appointment_time,
     service_type, notes

   EmailJS is async — we don't block the UI waiting
   for it. The form success message shows immediately,
   and emails are sent in the background.
────────────────────────────────────────────────────────── */
async function sendEmailConfirmation(formData) {
  // Skip if EmailJS is not configured yet
  if (EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') {
    console.log('EmailJS not configured. Skipping email send.');
    console.log('Booking data that would have been emailed:', formData);
    return;
  }

  try {
    // 1. Send confirmation email to the patient
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_PATIENT_TEMPLATE,
      formData
    );
    console.log('Patient confirmation email sent successfully.');

    // 2. Send notification email to the clinic
    // The clinic template should have "To Email" set to
    // dental.talks@yahoo.com in the EmailJS dashboard
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_CLINIC_TEMPLATE,
      formData
    );
    console.log('Clinic notification email sent successfully.');

  } catch (error) {
    // Email failed — log the error but don't block the user
    // The booking is still recorded locally
    console.error('EmailJS error:', error);
  }
}


/* ────────────────────────────────────────────────────────
   12. SMS NOTIFICATION — PREMIUM (NOT ACTIVE)
   ──────────────────────────────────────────────────────
   sendSmsConfirmation(formData)
   This function is a placeholder for future SMS support.
   Currently does nothing — SMS is a premium feature.

   TO ACTIVATE IN THE FUTURE:
     Recommended PH SMS providers:
       • Semaphore (https://semaphore.co) — PH-based
       • Vonage (https://www.vonage.com)
       • Twilio (https://www.twilio.com)

     Steps:
       1. Sign up for an SMS provider
       2. Get your API key
       3. Replace the console.log below with an
          API call to your chosen SMS provider
       4. Store the API key safely (use a backend
          endpoint or environment variable — never
          expose secret keys in front-end code)
       5. In index.html, remove .premium-locked from
          .sms-notify and re-enable the checkbox
       6. In css/styles.css, remove .premium-locked styles

   Example Semaphore API call (requires a backend proxy):
     fetch('https://api.semaphore.co/api/v4/messages', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         apikey: 'YOUR_SEMAPHORE_API_KEY',
         number: formData.patient_phone,
         message: `CAPIZDENTA: Your appointment on
           ${formData.appointment_date} at
           ${formData.appointment_time} for
           ${formData.service_type} has been received.
           We'll confirm shortly. Call 0954-405-5391.`,
         sendername: 'CAPIZDENTA'
       })
     });
────────────────────────────────────────────────────────── */
async function sendSmsConfirmation(formData) {
  // PREMIUM FEATURE — not active in this plan
  // Remove this log and add API call when upgrading
  console.log('SMS notification: premium feature not yet active.', formData);
}


/* ────────────────────────────────────────────────────────
   13. BOOKING SUBMISSION — MAIN HANDLER
   ──────────────────────────────────────────────────────
   submitBooking()
   Called by the form's "Submit Appointment Request" button.
   Runs through these steps:
     1. Validate required fields
     2. Check daily slot limit hasn't been exceeded
     3. Increment the booking counter for the selected date
     4. Collect all form field values
     5. Send email confirmation if opted in (async)
     6. Send SMS if opted in (async, currently no-op)
     7. Show success message in the form
     8. Show toast notification
     9. Reset form fields
────────────────────────────────────────────────────────── */
async function submitBooking() {
  // Step 1: Validate required fields
  if (!validateBookingForm()) return;

  // Step 2: Double-check slot availability
  // (updateSlotsDisplay already disables the button,
  // but this is a safety check in case of race conditions)
  const selectedDate = document.getElementById('f-date').value;
  const booked       = getBookingsForDate(selectedDate);

  if (booked >= MAX_BOOKINGS_PER_DAY) {
    alert(`Sorry, ${selectedDate} is fully booked (${MAX_BOOKINGS_PER_DAY} appointments). Please select a different date.`);
    return;
  }

  // Step 3: Increment the booking counter in localStorage
  incrementBookingsForDate(selectedDate);

  // Step 4: Collect all form values into one object
  const formData = {
    patient_name:     document.getElementById('f-name').value.trim(),
    patient_phone:    document.getElementById('f-phone').value.trim(),
    patient_email:    document.getElementById('f-email').value.trim(),
    appointment_date: selectedDate,
    appointment_time: document.getElementById('f-time').value || 'Not specified',
    service_type:     document.getElementById('f-service').value,
    notes:            document.getElementById('f-notes').value.trim() || 'None',
    // Clinic info for the template (useful in the clinic notification email)
    clinic_name:      'CAPIZDENTA',
    clinic_phone:     '0954-405-5391',
    clinic_email:     'dental.talks@yahoo.com'
  };

  // Step 5: Send email confirmation (if opted in and email provided)
  const emailOptIn    = document.getElementById('notify-email').checked;
  const hasEmail      = formData.patient_email.length > 0;

  if (emailOptIn && hasEmail) {
    // sendEmailConfirmation is async but we don't await here
    // so the UI updates immediately without waiting for the email
    sendEmailConfirmation(formData);
  }

  // Step 6: Send SMS (premium placeholder — currently does nothing)
  const smsCheckbox = document.getElementById('notify-sms');
  const smsOptIn    = smsCheckbox && !smsCheckbox.disabled && smsCheckbox.checked;

  if (smsOptIn) {
    sendSmsConfirmation(formData);
  }

  // Step 7: Show success message inside the form
  // Hide the submit button and show the green success block
  const submitBtn  = document.getElementById('submitBtn');
  const successDiv = document.getElementById('formSuccess');

  submitBtn.style.display  = 'none';
  successDiv.style.display = 'block';

  // Step 8: Show the floating toast notification
  showToast();

  // Step 9: Reset form fields after a short delay
  // (delay so user can see what they submitted before it clears)
  setTimeout(() => {
    clearForm();
    // Restore submit button for the next booking
    submitBtn.style.display  = '';
    submitBtn.textContent    = 'Submit Appointment Request';
    submitBtn.disabled       = false;
    successDiv.style.display = 'none';
    // Update slots display for the new (now empty) date field
    updateSlotsDisplay();
  }, 5000); // 5-second delay before resetting
}


/* ────────────────────────────────────────────────────────
   14. FORM RESET
   ──────────────────────────────────────────────────────
   clearForm()
   Resets all booking form fields to their empty/default
   state. Called 5 seconds after a successful submission.
   Field IDs must match the HTML.
────────────────────────────────────────────────────────── */
function clearForm() {
  // Text and email inputs
  ['f-name', 'f-phone', 'f-email', 'f-notes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  // Selects (date, time, service)
  ['f-date', 'f-time', 'f-service'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  // Reset email checkbox to checked (default state)
  const emailCheck = document.getElementById('notify-email');
  if (emailCheck) emailCheck.checked = true;
}


/* ────────────────────────────────────────────────────────
   15. TOAST NOTIFICATION
   ──────────────────────────────────────────────────────
   showToast()
   Shows the #toast element by adding .show class.
   CSS transitions it up from the bottom of the screen.
   Auto-removes .show after 4 seconds (fades back out).
   Toast text is set directly in the HTML (index.html).
────────────────────────────────────────────────────────── */
function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}


/* ────────────────────────────────────────────────────────
   16. BACK-TO-TOP BUTTON
   ──────────────────────────────────────────────────────
   The #btt button is shown/hidden by the scroll listener
   in section 3 above (appears after scrolling 400px).
   Clicking it smooth-scrolls back to the top of the page.
────────────────────────────────────────────────────────── */
document.getElementById('btt').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ────────────────────────────────────────────────────────
   17. SCROLL REVEAL ANIMATION
   ──────────────────────────────────────────────────────
   Uses IntersectionObserver to watch all elements with
   the .reveal class. When they scroll into view (12%
   of their height is visible), the .visible class is added.
   CSS transitions opacity and translateY on .reveal.visible.
   This creates the "fade up into view" effect on each section.

   threshold: 0.12 means the animation triggers when 12%
   of the element is visible. Lower = triggers earlier,
   higher = waits until more is visible.
────────────────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.12
});

// Observe every element with .reveal class on the page
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
