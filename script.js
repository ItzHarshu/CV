const revealItems = document.querySelectorAll(".section, .hero-card, .hero-metrics li, .strength-card, .goals-card");
const tiltItems = document.querySelectorAll(".hero-card, .project-card, .panel, .timeline-item, .strength-card, .goals-card");
const contactForm = document.querySelector("#contact-form");
const formNote = document.querySelector("#form-note");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
  }
);

revealItems.forEach((item, index) => {
  item.classList.add("reveal");
  item.classList.add(`reveal-delay-${index % 4}`);
  revealObserver.observe(item);
});

if (window.matchMedia("(pointer: fine)").matches) {
  tiltItems.forEach((item) => {
    item.classList.add("tilt-card");

    item.addEventListener("mousemove", (event) => {
      const rect = item.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left) / rect.width;
      const offsetY = (event.clientY - rect.top) / rect.height;
      const rotateY = (offsetX - 0.5) * 10;
      const rotateX = (0.5 - offsetY) * 10;

      item.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    item.addEventListener("mouseleave", () => {
      item.style.transform = "";
    });
  });
}

if (contactForm && formNote) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const accessKey = String(formData.get("access_key") || "").trim();

    if (!name || !email || !message) {
      formNote.textContent = "Please fill in your name, email, and message before sending.";
      formNote.dataset.state = "error";
      return;
    }

    if (!accessKey || accessKey === "YOUR_WEB3FORMS_ACCESS_KEY") {
      formNote.textContent = "Add your Web3Forms access key in the form code to enable direct sending.";
      formNote.dataset.state = "error";
      return;
    }

    formNote.textContent = "Sending your message...";
    formNote.dataset.state = "pending";

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    })
      .then(async (response) => {
        const result = await response.json();

        if (response.ok && result.success) {
          formNote.textContent = "Message sent successfully. Thanks for reaching out.";
          formNote.dataset.state = "success";
          contactForm.reset();
          return;
        }

        throw new Error(result.message || "Something went wrong while sending the message.");
      })
      .catch((error) => {
        formNote.textContent = error.message || "Unable to send the message right now.";
        formNote.dataset.state = "error";
      });
  });
}
