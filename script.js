"use strict";

document.documentElement.classList.add("js");

const selectors = {
  navigation: "[data-site-nav]",
  navToggle: "[data-nav-toggle]",
  navPanel: "[data-nav-panel]",
  tripRequest: ".js-trip-request",
  tripInterest: "#trip-interest",
  requestForm: "[data-request-form]",
  submitButton: "[data-submit-button]",
  formStatus: "[data-form-status]",
  reveal: "[data-reveal]",
  backToTop: "[data-back-to-top]",
  dialogOpen: "[data-dialog-open]",
  dialogClose: "[data-dialog-close]",
  currentYear: "[data-current-year]"
};

const navigation = document.querySelector(selectors.navigation);
const navToggle = document.querySelector(selectors.navToggle);
const navPanel = document.querySelector(selectors.navPanel);
const requestForm = document.querySelector(selectors.requestForm);
const submitButton = document.querySelector(selectors.submitButton);
const formStatus = document.querySelector(selectors.formStatus);
const tripInterestInput = document.querySelector(selectors.tripInterest);
const backToTopButton = document.querySelector(selectors.backToTop);

function closeNavigation() {
  if (!navToggle || !navPanel) {
    return;
  }

  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Navigation öffnen");
  navPanel.classList.remove("is-open");
  document.body.classList.remove("nav-open");
}

function openNavigation() {
  if (!navToggle || !navPanel) {
    return;
  }

  navToggle.setAttribute("aria-expanded", "true");
  navToggle.setAttribute("aria-label", "Navigation schließen");
  navPanel.classList.add("is-open");
  document.body.classList.add("nav-open");
}

function toggleNavigation() {
  const isOpen = navToggle?.getAttribute("aria-expanded") === "true";

  if (isOpen) {
    closeNavigation();
  } else {
    openNavigation();
  }
}

navToggle?.addEventListener("click", toggleNavigation);

navPanel?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeNavigation);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavigation();

    document.querySelectorAll("dialog[open]").forEach((dialog) => {
      dialog.close();
    });
  }
});

window.addEventListener("resize", () => {
  if (window.matchMedia("(min-width: 48rem)").matches) {
    closeNavigation();
  }
});

function updateScrollUI() {
  const hasScrolled = window.scrollY > 24;
  const showBackToTop = window.scrollY > 700;

  navigation?.classList.toggle("is-scrolled", hasScrolled);
  backToTopButton?.classList.toggle("is-visible", showBackToTop);
}

window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();

backToTopButton?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

function setTripInterest(value) {
  if (!tripInterestInput) {
    return;
  }

  tripInterestInput.value = value;
  tripInterestInput.dispatchEvent(new Event("input", { bubbles: true }));

  window.setTimeout(() => {
    tripInterestInput.focus({ preventScroll: true });
  }, 500);
}

document.querySelectorAll(selectors.tripRequest).forEach((link) => {
  link.addEventListener("click", () => {
    const tripName = link.dataset.trip?.trim();

    if (tripName) {
      setTripInterest(tripName);
    }

    const parentDialog = link.closest("dialog");

    if (parentDialog?.open) {
      parentDialog.close();
    }
  });
});

const validationRules = {
  "trip-interest": {
    message: "Bitte tragen Sie eine Reise oder ein Wunschziel ein.",
    validate: (field) => field.value.trim().length >= 2
  },
  "full-name": {
    message: "Bitte tragen Sie Ihren Vor- und Nachnamen ein.",
    validate: (field) => field.value.trim().length >= 3
  },
  email: {
    message: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
    validate: (field) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())
  },
  people: {
    message: "Bitte geben Sie mindestens eine Person an.",
    validate: (field) => Number(field.value) >= 1
  },
  privacy: {
    message: "Bitte bestätigen Sie die Datenschutzerklärung.",
    validate: (field) => field.checked
  }
};

function getErrorElement(field) {
  return document.getElementById(`${field.id}-error`);
}

function setFieldError(field, message = "") {
  const errorElement = getErrorElement(field);
  const hasError = Boolean(message);

  field.setAttribute("aria-invalid", String(hasError));

  if (errorElement) {
    errorElement.textContent = message;
  }
}

function validateField(field) {
  const rule = validationRules[field.id];

  if (!rule) {
    return true;
  }

  const isValid = rule.validate(field);
  setFieldError(field, isValid ? "" : rule.message);
  return isValid;
}

Object.keys(validationRules).forEach((id) => {
  const field = document.getElementById(id);

  if (!field) {
    return;
  }

  const eventName = field.type === "checkbox" ? "change" : "blur";

  field.addEventListener(eventName, () => {
    validateField(field);
  });

  field.addEventListener("input", () => {
    if (field.getAttribute("aria-invalid") === "true") {
      validateField(field);
    }
  });
});

function validateForm() {
  const results = Object.keys(validationRules).map((id) => {
    const field = document.getElementById(id);
    return field ? validateField(field) : true;
  });

  const firstInvalidField = Object.keys(validationRules)
    .map((id) => document.getElementById(id))
    .find((field) => field?.getAttribute("aria-invalid") === "true");

  firstInvalidField?.focus();
  return results.every(Boolean);
}

function setSubmittingState(isSubmitting) {
  if (!submitButton) {
    return;
  }

  submitButton.disabled = isSubmitting;
  submitButton.classList.toggle("is-loading", isSubmitting);
  submitButton.textContent = isSubmitting ? "Wird gesendet …" : "Reiseanfrage senden";
}

requestForm?.addEventListener("submit", (event) => {
  const isValid = validateForm();

  if (!isValid) {
    event.preventDefault();

    if (formStatus) {
      formStatus.textContent = "Bitte prüfen Sie die markierten Pflichtfelder.";
      formStatus.className = "form-status is-error";
    }

    return;
  }

  setSubmittingState(true);

  if (formStatus) {
    formStatus.textContent = "Ihre Anfrage wird sicher übermittelt.";
    formStatus.className = "form-status";
  }
});

function openDialog(dialog) {
  if (!dialog || typeof dialog.showModal !== "function") {
    return;
  }

  dialog.showModal();
  document.body.classList.add("dialog-open");
}

function closeDialog(dialog) {
  if (!dialog?.open) {
    return;
  }

  dialog.close();
}

document.querySelectorAll(selectors.dialogOpen).forEach((button) => {
  button.addEventListener("click", () => {
    const dialogId = button.dataset.dialogOpen;
    const dialog = document.getElementById(dialogId);
    openDialog(dialog);
  });
});

document.querySelectorAll(selectors.dialogClose).forEach((button) => {
  button.addEventListener("click", () => {
    closeDialog(button.closest("dialog"));
  });
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closeDialog(dialog);
    }
  });

  dialog.addEventListener("close", () => {
    const anyDialogOpen = Boolean(document.querySelector("dialog[open]"));
    document.body.classList.toggle("dialog-open", anyDialogOpen);
  });
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealElements = document.querySelectorAll(selectors.reveal);

if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.08
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("is-revealed");
  });
}

const sectionLinks = Array.from(navPanel?.querySelectorAll('a[href^="#"]') ?? []);
const observedSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && observedSections.length > 0) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleEntry) {
        return;
      }

      sectionLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${visibleEntry.target.id}`;

        if (isCurrent) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    },
    {
      rootMargin: "-30% 0px -55% 0px",
      threshold: [0.05, 0.25, 0.5]
    }
  );

  observedSections.forEach((section) => {
    sectionObserver.observe(section);
  });
}

document.querySelectorAll(selectors.currentYear).forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});
