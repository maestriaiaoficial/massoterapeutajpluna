const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

function closeMenu(restoreFocus = false) {
  if (!menuToggle || !mainNav) return;

  mainNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
  menuToggle.textContent = "☰";

  if (restoreFocus) menuToggle.focus();
}

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    menuToggle.textContent = isOpen ? "×" : "☰";
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mainNav.classList.contains("is-open")) {
      closeMenu(true);
    }
  });
}

const floatingBookingLink = document.querySelector(".floating-whatsapp");
const floatingOverlapTargets = document.querySelectorAll(".feedback-proof-link, .feedback-google-link, .gallery-item, .faq-list summary, .faq-list details p");
let floatingOverlapObserver = null;
const overlappingFloatingTargets = new Set();

function setFloatingBookingOverlap(isOverlapping) {
  if (!floatingBookingLink) return;

  floatingBookingLink.classList.toggle("is-overlapping", isOverlapping);

  if (isOverlapping) {
    floatingBookingLink.setAttribute("aria-hidden", "true");
    floatingBookingLink.setAttribute("tabindex", "-1");
    if (document.activeElement === floatingBookingLink) floatingBookingLink.blur();
  } else {
    floatingBookingLink.removeAttribute("aria-hidden");
    floatingBookingLink.removeAttribute("tabindex");
  }
}

function observeFloatingActionOverlaps() {
  floatingOverlapObserver?.disconnect();
  overlappingFloatingTargets.clear();
  setFloatingBookingOverlap(false);

  if (
    !floatingBookingLink ||
    !floatingOverlapTargets.length ||
    !("IntersectionObserver" in window)
  ) return;

  const floatingRect = floatingBookingLink.getBoundingClientRect();
  const overlapGuard = 4;
  const rootMargins = [
    Math.max(0, floatingRect.top - overlapGuard),
    Math.max(0, window.innerWidth - floatingRect.right - overlapGuard),
    Math.max(0, window.innerHeight - floatingRect.bottom - overlapGuard),
    Math.max(0, floatingRect.left - overlapGuard)
  ].map((inset) => `${-inset}px`).join(" ");

  floatingOverlapObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const overlaps = entry.isIntersecting && entry.intersectionRect.width > 0 && entry.intersectionRect.height > 0;
      if (overlaps) overlappingFloatingTargets.add(entry.target);
      else overlappingFloatingTargets.delete(entry.target);
    });

    setFloatingBookingOverlap(overlappingFloatingTargets.size > 0);
  }, { rootMargin: rootMargins, threshold: 0 });

  floatingOverlapTargets.forEach((target) => floatingOverlapObserver.observe(target));
}

if (floatingBookingLink && floatingOverlapTargets.length && "IntersectionObserver" in window) {
  observeFloatingActionOverlaps();
  window.addEventListener("resize", observeFloatingActionOverlaps, { passive: true });
}

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const backToTopLink = document.querySelector(".footer-bottom a[href='#inicio']");
const pageEndSentinel = document.querySelector(".page-end-sentinel");
if (backToTopLink && pageEndSentinel && "IntersectionObserver" in window) {
  const pageEndObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const isAtPageEnd = entry.isIntersecting;
      backToTopLink.classList.toggle("is-visible", isAtPageEnd);
      backToTopLink.setAttribute("aria-hidden", String(!isAtPageEnd));
      if (isAtPageEnd) backToTopLink.removeAttribute("tabindex");
      else backToTopLink.setAttribute("tabindex", "-1");
    });
  }, { threshold: 0 });

  pageEndObserver.observe(pageEndSentinel);
}

const WHATSAPP_BOOKING_URL = "https://wa.me/5521979565902";

const bookingForm = document.getElementById("booking-form");
if (bookingForm) {
  const clientNameInput = bookingForm.querySelector("#client-name");
  const clientServiceInput = bookingForm.querySelector("#client-service");
  const clientMessageInput = bookingForm.querySelector("#client-message");

  clientNameInput?.addEventListener("input", () => {
    if (clientNameInput.value.trim()) clientNameInput.setCustomValidity("");
  });

  clientServiceInput?.addEventListener("change", () => {
    if (clientServiceInput.value.trim()) clientServiceInput.setCustomValidity("");
  });

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!clientNameInput || !clientServiceInput) return;

    const name = clientNameInput.value.trim();
    const service = clientServiceInput.value.trim();
    const additionalMessage = clientMessageInput?.value.trim() ?? "";

    clientNameInput.setCustomValidity(name ? "" : "Informe seu nome.");
    clientServiceInput.setCustomValidity(service ? "" : "Selecione um serviço.");

    if (!bookingForm.reportValidity()) {
      clientNameInput.setCustomValidity("");
      clientServiceInput.setCustomValidity("");
      return;
    }

    const messageLines = [
      "Olá! Gostaria de agendar um atendimento.",
      "",
      `Nome: ${name}`,
      `Serviço: ${service}`
    ];

    if (additionalMessage) messageLines.push(`Mensagem: ${additionalMessage}`);

    const whatsappUrl = `${WHATSAPP_BOOKING_URL}?text=${encodeURIComponent(messageLines.join("\n"))}`;
    let whatsappWindow = null;

    try {
      whatsappWindow = window.open(whatsappUrl, "_blank");
    } catch {
      // The same-tab navigation below is the fallback if opening a new tab fails.
    }

    if (whatsappWindow) {
      try {
        whatsappWindow.opener = null;
      } catch {
        // Cross-origin window restrictions can prevent changing opener.
      }
      return;
    }

    window.location.assign(whatsappUrl);
  });
}

const galleryDialog = document.querySelector(".gallery-lightbox");
const galleryDialogImage = galleryDialog?.querySelector(".lightbox-image");
const galleryDialogCaption = galleryDialog?.querySelector("#lightbox-caption");
const galleryCloseButton = galleryDialog?.querySelector(".lightbox-close");
let galleryTrigger = null;

if (galleryDialog && galleryDialogImage && galleryDialogCaption && galleryCloseButton) {
  document.querySelectorAll("[data-lightbox]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (typeof galleryDialog.showModal !== "function") return;

      event.preventDefault();
      galleryTrigger = link;
      galleryDialogImage.src = link.href;
      galleryDialogImage.alt = link.querySelector("img")?.alt ?? "";
      galleryDialogCaption.textContent = link.dataset.caption ?? "";
      galleryDialog.showModal();
      galleryCloseButton.focus();
    });
  });

  galleryCloseButton.addEventListener("click", () => galleryDialog.close());
  galleryDialog.addEventListener("click", (event) => {
    if (event.target === galleryDialog) galleryDialog.close();
  });
  galleryDialog.addEventListener("close", () => {
    galleryDialogImage.removeAttribute("src");
    galleryTrigger?.focus();
    galleryTrigger = null;
  });
}

function prepareRevealTargets(selector, type, { delay = 0, stagger = false } = {}) {
  document.querySelectorAll(selector).forEach((element, index) => {
    if (element.closest("[data-reveal]")) return;

    element.dataset.reveal = type;
    const itemDelay = stagger ? Math.min(index * 90, 360) : delay;
    if (itemDelay) element.style.setProperty("--reveal-delay", `${itemDelay}ms`);
  });
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
if (!prefersReducedMotion.matches && "IntersectionObserver" in window) {
  [
    ".trust-strip > div",
    ".service-card",
    ".feedback-proof-link",
    ".gallery-item",
    ".about-points > span",
    ".audience-grid > div",
    ".faq-list details",
    ".booking-content form"
  ].forEach((selector) => prepareRevealTargets(selector, "card", { stagger: true }));

  prepareRevealTargets(
    ".hero h1, .section-heading h2, .about-copy h2, .visual-break h2, .faq-intro h2, .booking-content h2",
    "title"
  );
  prepareRevealTargets(
    ".hero-copy, .section-heading > p, .about-copy > p:not(.eyebrow), .visual-break-content > p:not(.eyebrow), .faq-intro > p:not(.eyebrow), .faq-list details > p, .booking-content > p:not(.eyebrow)",
    "text",
    { delay: 130 }
  );
  prepareRevealTargets(
    ".hero-actions > *, .hero-note, .hero-index, .feedback-google-cta, .about-copy .button, .visual-break-content .button, .disclaimer",
    "detail",
    { delay: 90 }
  );
  prepareRevealTargets(
    ".hero .eyebrow, .section-heading .eyebrow, .about-copy .eyebrow, .visual-break-content .eyebrow, .faq-intro .eyebrow, .booking-content .eyebrow, .trust-symbol, .service-number, .service-icon, .about-points b, .audience-grid > div > span",
    "detail",
    { delay: 45 }
  );
  prepareRevealTargets(".about-photo-wrap, .visual-break > img, .booking-image", "image");

  document.documentElement.classList.add("motion-ready");

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

  document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));
}

if ("IntersectionObserver" in window) {
  const sections = Array.from(document.querySelectorAll("main > section[id]"));
  const navLinks = Array.from(document.querySelectorAll('.main-nav a[href^="#"]'));

  if (sections.length) {
    const visibleSections = new Map();
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleSections.set(entry.target, entry.intersectionRatio);
        else visibleSections.delete(entry.target);
      });

      const currentSection = Array.from(visibleSections.entries())
        .sort((first, second) => second[1] - first[1])[0]?.[0] ?? null;

      sections.forEach((section) => section.classList.toggle("is-current", section === currentSection));
      navLinks.forEach((link) => {
        if (currentSection && link.getAttribute("href") === `#${currentSection.id}`) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }, { rootMargin: "-24% 0px -60% 0px", threshold: 0 });

    sections.forEach((section) => sectionObserver.observe(section));
  }
}
