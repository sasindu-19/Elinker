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
    },
    { keywords: [, "how to remove my post", "how to delete my post", "remove", "Delete" ],
      reply: "Click > My profile & delte you post"
    },
    {
      keywords: ["හායි", "හෙලෝ", "හේයි", "හෙලෝ"],
      reply: "හෙලෝ! අද මම ඔබට උදව් කරන්නේ කෙසේද?"
    },
    {
      keywords: ["මිලකරණය පළ කිරීම", "මිලකරණය", "පිරිවැය", "කොපමණද", "මිල", "මම සේවායෝජකයා සම්බන්ධ කර ගන්නේ කෙසේද", "මට සේවායෝජකයා සමඟ කතාබස් කළ හැකිද", "මට ඔවුන්ගේ දුරකථන අංකය ලැබේද"],
      reply: "තනතුර සඳහා අයදුම් කර වැඩි විස්තර ඉල්ලා සිටීමට සේවාදායකයා අමතන්න"
    },
    {
      keywords: ["පැය", "විවෘත", "කාලය", "කාලය"],
      reply: "අපි ඔබට නොමිලේ වේලාවන් ලබා ගත හැකිය"
    },
    {
      keywords: ["සම්බන්ධතා", "ඊමේල්", "දුරකථන", "සහාය", "දුරකථන"],
      reply: "අප අමතන්න ක්ලික් කර මට ඉදිරිපත් කරන්න."
    },
    {
      keywords: ["පිවිසුම", "ලියාපදිංචි වන්න", "ලියාපදිංචි වන්නේ කෙසේද", "රැකියාව එකක්"],
      reply: "login බොත්තම ක්ලික් කරන්න > signup > විස්තර නිවැරදිව ලබා දී ඔබ ගැන කුමක් දැයි තෝරාගෙන ඉදිරිපත් කරන්න"
    },
    {
      keywords: ["මොන ස්ථානයද", "ස්ථානය"],
      reply: "අපි ශ්‍රී ලංකාවේ සියලුම පළාත්වල සේවය කරන පාරිභෝගිකයින්ට සේවය කරනවා 🌍"
    },
    {
      keywords: ["ආපසු ගෙවීම", "ආපසු යැවීම", "අවලංගු කිරීම"],
      reply: "අපි දින 30ක මුදල් ආපසු ගෙවීමේ සහතිකයක් ලබා දෙනවා. ආපසු පැමිණීමක් ආරම්භ කිරීමට support@Elinker.com වෙත විද්‍යුත් තැපැල් කරන්න."
    },
    {
      keywords: ["ගෙවීම", "ගෙවීම", "කාඩ්පත"],
      reply: "අපි සියලුම ප්‍රධාන cbank හුවමාරු, ස්ථානයෙන් මුදල් ලබා ගනිමු."
    },
    {
      keywords: ["තේරුම් ගන්න", "ස්තූතියි", "ස්තූතියි"],
      reply: "ඔබව සාදරයෙන් පිළිගනිමු! 😊 මට උදව් කළ හැකි වෙනත් ඕනෑම දෙයක්?"
    },
    {
      keywords: ["බායි", "ආයුබෝවන්", "ඔබව හමුවෙමු"],
      reply: "ආයුබෝවන්! සුභ දවසක් වේවා. 👋"
    },
    {
      keywords: ["උදව්", "සහාය", "සහාය"],
      reply: "ඇත්තෙන්ම! රැකියා සොයා ගැනීම, පිවිසුම/ලියාපදිංචි වීම, සම්බන්ධතා තොරතුරු හෝ වෙබ් අඩවිය භාවිතා කර ගැටළු හෝ වෙනත් දෙයක් කරන්නේ කෙසේද යන්න පිළිබඳව ඔබට අවශ්‍ය උදව් මොනවාදැයි මට කියන්න?"
    },
    {
      keywords: ["නම", "වෙබ් අඩවියේ නම", "ඔබේ නම"],
      reply: "මෙම වෙබ් අඩවියේ නම එලින්කර්"
    },
    {
      keywords: ["අයදුම් කරන්න", "රැකියාව අයදුම් කරන්නේ කෙසේද", "රැකියාව අයදුම් කරන්නේ කෙසේද" ],
      reply: "රැකියාවක් පළ කරන්න > රැකියා පෝරම විස්තර දෙන්න > ඉදිරිපත් කරන්න ක්ලික් කරන්න සහ ඔබේ පළ කිරීම පරීක්ෂා කරන්න > රැකියාව සොයා ගන්න"
    },
    {
      keywords: ["හදිසි රැකියාවක් තිබේ", "පින්තූර", "අංක", "තවත්"],
      reply: "නැහැ... වෙනත් ඕනෑම දෙයක් කණගාටුයි"
    },
    {
      keywords: ["මම මේ වෙබ් අඩවිය භාවිතා කරන්නේ නැහැ", "භාවිතා කරන්නේ කෙසේද", "මේක මොකක්ද", "කුමක් ගැනද", "භාවිතා කරන්න"],
      reply: "ඔවුන් ඔබේ කැමතිම වැඩිපුර අර්ධකාලීන රැකියා සොයා ගන්නවා හෝ ඔබේ වැඩ සඳහා සේවකයින් අවශ්‍ය නම්, රැකියාව පළ කර අප හා සම්බන්ධ වන්න දැන් ගොස් පිවිසුම් බොත්තම ක්ලික් කර ලියාපදිංචි වන්න"
    },
    {
      keywords: [, "කුමක් ගැනද", "භාවිතා කරන්න"],
      reply: "ඔවුන් ඔබේ කැමතිම වැඩිපුර අර්ධකාලීනව සොයා ගන්නවා රැකියා හෝ ඔබේ වැඩ සඳහා සේවකයින් අවශ්‍ය නම්, රැකියාව පළ කර අප හා සම්බන්ධ වන්න දැන්ම පිවිසුම් බොත්තම ක්ලික් කර සංඥා කරන්න"
    },
    { 
      keywords: [, "මගේ පළ කිරීම ඉවත් කරන්නේ කෙසේද", "මගේ පළ කිරීම මකා දමන්නේ කෙසේද", "ඉවත් කරන්න", "මකන්න" ],
      reply: "මගේ පැතිකඩ ක්ලික් කර ඔබේ පළ කිරීම ඉවත් කරන්න"
    },
    {
      keywords: ["ஹாய்", "ஹலோ", "ஹே", "ஹோலா"],
      reply: "வணக்கம்! இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?"
    },
    {
      keywords: ["உள்நுழைவு", "பதிவுசெய்", "எப்படிப் பதிவு செய்வது", "வேலை ஒன்று"],
      reply: "உள்நுழைவு பொத்தானைக் கிளிக் செய்யவும் > பதிவு செய்யவும் > விவரங்களைச் சரியாக உள்ளிட்டு, உங்களைப் பற்றிய விவரங்களைத் தேர்ந்தெடுத்துச் சமர்ப்பிக்கவும்"
    },
    {
      keywords: ["எப்போது", "இடம்"],
      reply: "நாங்கள் இலங்கையின் அனைத்து மாகாணங்களிலும் உள்ள வாடிக்கையாளர்களுக்குச் சேவை செய்கிறோம் 🌍"
    },
    {
      keywords: ["பணம் திரும்பப்பெறுதல்", "திரும்ப அளித்தல்", "ரத்துசெய்"],
      reply: "நாங்கள் 30-நாள் பணம் திரும்பப்பெறும் உத்தரவாதத்தை வழங்குகிறோம். திரும்ப அளிக்கும் செயல்முறையைத் தொடங்க support@Elinker.com என்ற மின்னஞ்சல் முகவரிக்கு எழுதவும்."
    },
    {
      keywords: ["கட்டணம்", "செலுத்து", "அட்டை", "யுபிஐ"],
      reply: "நாங்கள் அனைத்து முக்கிய வங்கிப் பரிமாற்றங்களையும், இடத்திலேயே ரொக்கப் பணத்தையும் ஏற்றுக்கொள்கிறோம்."
    },
    {
      keywords: ["புரிந்துகொண்டேன்", "நன்றி", "மிக்க நன்றி", "thx"],
      reply: "பரவாயில்லை! 😊 வேறு ஏதாவது நான் உதவ வேண்டுமா?"
    },
    {
      keywords: ["பை", "குட்பை", "மீண்டும் சந்திப்போம்"],
      reply: "குட்பை! இந்த நாள் இனிய நாளாக அமையட்டும்.👋"
    },
    {
      keywords: ["உதவி", "ஆதரவு", "உதவுதல்"],
      reply: "நிச்சயமாக! உங்களுக்கு என்ன உதவி தேவை என்று சொல்லுங்கள் - வேலைகளைக் கண்டறிவது, உள்நுழைவது/பதிவு செய்வது, தொடர்புத் தகவல், அல்லது இணையதளத்தைப் பயன்படுத்துவதில் உள்ள சிக்கல்கள் அல்லது வேறு ஏதாவது?"
    },
    {
      keywords: ["பெயர்", "இணையதளத்தின் பெயர்", "உங்கள் பெயர்"],
      reply: "இந்த இணையதளத்தின் பெயர் எலிங்கர்"
    },
    {
      keywords:["விண்ணப்பிக்கவும்", "வேலைக்கு விண்ணப்பிக்கவும்", "வேலைக்கு எப்படி விண்ணப்பிப்பது"],
      reply: "வேலையை இடுகையிடவும் > வேலை படிவ விவரங்களை வழங்கவும் > சமர்ப்பி பொத்தானை அழுத்தி உங்கள் இடுகையைச் சரிபார்க்கவும் > வேலையைக் கண்டறியவும்"
    },
    {
      keywords: ["அவசர வேலை உள்ளது", "படங்கள்", "எண்கள்", "மேலும்"],
      reply: "இல்லை... மன்னிக்கவும், வேறு ஏதாவது உள்ளதா?"
    },
    {
      keywords: ["இந்த இணையதளத்தை நான் பயன்படுத்தத் தெரியாது", "எப்படிப் பயன்படுத்துவது", "இது என்ன", "எதைப் பற்றி", "பயன்படுத்து"],
      reply: "அவர்கள் உங்களுக்குப் பிடித்தமான பகுதி நேர வேலைகளைக் கண்டறிவார்கள் அல்லது உங்கள் வேலைக்கு ஆட்கள் தேவைப்பட்டால், வேலையை இடுகையிட்டு எங்களைத் தொடர்பு கொள்ளுங்கள். இப்போது சென்று உள்நுழைவு பொத்தானை அழுத்திப் பதிவு செய்யவும்"
    },
    {
      keywords: [, "எதைப் பற்றி", "பயன்படுத்து"],
      reply: "அவர்கள் உங்களுக்குப் பிடித்தமான மேலும் பல வேலைகளைக் கண்டறிவார்கள் பகுதி நேர வேலைகளுக்கு அல்லது உங்கள் பணிக்கு ஆட்கள் தேவைப்பட்டால், வேலையை இடுகையிட்டு எங்களைத் தொடர்புகொள்ளுங்கள். இப்போதே சென்று உள்நுழைவு பொத்தானைக் கிளிக் செய்து பதிவு செய்யவும்."
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
