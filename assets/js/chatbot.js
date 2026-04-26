(function () {
  const toggleBtn   = document.getElementById("chat-toggle");
  const panel       = document.getElementById("chat-panel");
  const messagesEl  = document.getElementById("chat-messages");
  const inputEl     = document.getElementById("chat-input");
  const sendBtn     = document.getElementById("chat-send");

  /* ---------------------------------------------------------------
     Q & A knowledge base
     - "keywords": any of these words/phrases in the user's message
       will trigger this reply (case-insensitive).
     - "reply": what the bot answers.
     Add/edit entries freely.
  --------------------------------------------------------------- */
  const qa = [
    {
      keywords: ["hi", "hello", "hey", "hola"],
      reply: "Hello ! 👋 How can I help you today?"
    },
    {
      keywords: ["price", "pricing", "cost", "how much"],
      reply: "Our pricing starts at $9/month. Visit our pricing page for full details."
    },
    {
      keywords: ["hours", "open", "timing", "time"],
      reply: "We're available Monday–Friday, 9 AM to 6 PM."
    },
    {
      keywords: ["contact", "email", "phone", "support"],
      reply: "You can reach us at Elinker@example.com or call +1 555-123-4567."
    },
    {
      keywords: ["location", "address", "where"],
      reply: "We're based in SriLankan serve customers 🌍"
    },
    {
      keywords: ["shipping", "delivery"],
      reply: "Standard shipping takes 3–5 business days. Express options are available at checkout."
    },
    {
      keywords: ["refund", "return", "cancel"],
      reply: "We offer a 30-day money-back guarantee. Email support@example.com to start a return."
    },
    {
      keywords: ["payment", "pay", "card", "upi"],
      reply: "We accept all major credit/debit cards, UPI, and PayPal."
    },
    {
      keywords: ["thanks", "thank you", "thx"],
      reply: "You're welcome! 😊 Anything else I can help with?"
    },
    {
      keywords: ["bye", "goodbye", "see you"],
      reply: "Goodbye! Have a great day. 👋"
    },
    {
      keywords: ["help", "support", "assist"],
      reply: "Sure! Tell me what you need help with — pricing, orders, returns, or something else?"
    },
    {
      keywords: ["name", "website Name", "you name"],
      reply: "This Website Name Elinker "
    }
  ];

  const fallbackReply =
    "I'm not sure about that yet. Try asking about pricing, hours, shipping, refunds, or contact info.";

  function getBotReply(userText) {
    const text = userText.toLowerCase();
    for (const item of qa) {
      if (item.keywords.some((kw) => text.includes(kw))) {
        return item.reply;
      }
    }
    return fallbackReply;
  }

  /* ---------------- UI logic ---------------- */

  // Initial bot greeting
  addMessage("Hi I am Elinkert! 👋 Ask me about pricing, hours, shipping, or contact info.", "bot");

  function updateSendDisabled() {
    sendBtn.disabled = inputEl.value.trim().length === 0;
  }
  updateSendDisabled();

  toggleBtn.addEventListener("click", () => {
    const isOpen = !panel.hasAttribute("hidden");
    if (isOpen) {
      panel.setAttribute("hidden", "");
      toggleBtn.classList.remove("open");
      toggleBtn.setAttribute("aria-label", "Open chat");
    } else {
      panel.removeAttribute("hidden");
      toggleBtn.classList.add("open");
      toggleBtn.setAttribute("aria-label", "Close chat");
      scrollToBottom();
      inputEl.focus();
    }
  });

  inputEl.addEventListener("input", updateSendDisabled);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
  sendBtn.addEventListener("click", sendMessage);

  function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;
    addMessage(text, "user");
    inputEl.value = "";
    updateSendDisabled();

    setTimeout(() => {
      addMessage(getBotReply(text), "bot");
    }, 600);
  }

  function addMessage(text, sender) {
    const wrap = document.createElement("div");
    wrap.className = "message " + sender;
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;
    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    scrollToBottom();
  }

  function scrollToBottom() {
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: "smooth" });
  }
})();
