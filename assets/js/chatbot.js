(function () {
  const toggleBtn = document.getElementById("chat-toggle");
  const panel = document.getElementById("chat-panel");
  const messagesEl = document.getElementById("chat-messages");
  const inputEl = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send");

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
      reply: "Hello ! How can I help you today?"
    },
    {
      keywords: ["post pricing", "pricing", "cost", "how much", "price", "how do i contact the employer", "can i chat with the employer", "will i get their phone number"],
      reply: "Apply for the post and contact the client to ask for more details"
    },
    {
      keywords: ["hours", "open", "timing", "time"],
      reply: "We're available you freetimes"
    },
    {
      keywords: ["contact", "email", "phone", "support", "phone"],
      reply: "click the Contact Us and submit me  ."
    },
    {
      keywords: ["login", "regiter", "how to register", "job ekk one"],
      reply: "click the login button > signup > give the details correctly and choose what about you & submit"
    },
    {
      keywords: ["when", "location"],
      reply: "We're based in SriLankan all province serve customers 🌍"
    },
    {
      keywords: ["refund", "return", "cancel"],
      reply: "We offer a 30-day money-back guarantee. Email support@Elinker.com to start a return."
    },
    {
      keywords: ["payment", "pay", "card", "upi"],
      reply: "We accept all major cbank transfer,cash on location ."
    },
    {
      keywords: ["understand", "thanks", "thank you", "thx"],
      reply: "You're welcome! 😊 Anything else I can help with?"
    },
    {
      keywords: ["bye", "goodbye", "see you"],
      reply: "Goodbye! Have a great day. 👋"
    },
    {
      keywords: ["help", "support", "assist"],
      reply: "Sure! Tell me what you need help with how to - find jobs, login/regiter, contact info, or website using issues or something else?"
    },
    {
      keywords: ["name", "website Name", "you name"],
      reply: "This Website Name Elinker "
    },
    {
      keywords: ["apply", "apply job", "how to apply job"],
      reply: "Post a job > give job form details > click submite & check you post > Find work"
    },
    {
      keywords: ["urgent job available", "pictures", "numbers", "more"],
      reply: "No...Sorry any other something else"
    },
    {
      keywords: ["I don't no use this website", "how to use", "what is this", "what about", "use"],
      reply: "They do Find your like more parttime jobs or if you need workers for your work, Post job & contacts us now go & click the login button and sigup"
    },
    {
      keywords: [, "what about", "use"],
      reply: "They do Find your like more parttime jobs or if you need workers for your work, Post job & contacts us now go & click the login button and sigup"
    }
  ];

  const fallbackReply =
    " Sorry Ask me about how to find jobs, login/register, contact info, or website using issues/ other somthig else..../ කණගාටුයි, වෙනත් දෙයක් භාවිතා කරමින් රැකියා සොයා ගන්නේ කෙසේද, පුරනය වන්නේ කෙසේද/ලියාපදිංචි වන්නේ කෙසේද, සම්බන්ධතා තොරතුරු හෝ වෙබ් අඩවිය ගැන මගෙන් අසන්න.... / மன்னிக்கவும், வேலைகளைக் கண்டுபிடிப்பது எப்படி, உள்நுழைவது/பதிவு செய்வது, தொடர்புத் தகவல், அல்லது இணையதளத்தைப் பயன்படுத்துவதில் உள்ள சிக்கல்கள்/வேறு ஏதேனும் விஷயங்கள் பற்றி என்னிடம் கேளுங்கள்...";

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
  addMessage("Hi I am Elinker! 👋 Ask me about  how to - find jobs, login/regiter, contact info, or website using issues/ more.....", "bot");

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