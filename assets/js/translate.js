/* ==========================================
   ELINKER LANGUAGE DROPDOWN
========================================== */

function toggleLanguageMenu() {

    const selector =
        document.querySelector(".language-selector");

    selector.classList.toggle("open");

}


/* ==========================================
   SELECT LANGUAGE
========================================== */

function selectLanguage(language) {

    document.getElementById(
        "selectedLanguage"
    ).textContent = language;

    document.querySelector(
        ".language-selector"
    ).classList.remove("open");

}


/* ==========================================
   GOOGLE TRANSLATE
========================================== */

function translatePage(language) {

    const tryTranslate = () => {

        const select =
            document.querySelector(".goog-te-combo");

        if (!select) {

            setTimeout(
                tryTranslate,
                300
            );

            return;
        }

        select.value = language;

        select.dispatchEvent(
            new Event("change", {
                bubbles: true
            })
        );

        localStorage.setItem(
            "elinkerLanguage",
            language
        );

    };

    tryTranslate();
}


/* ==========================================
   CLOSE DROPDOWN OUTSIDE CLICK
========================================== */

document.addEventListener(
    "click",
    function(event) {

        const selector =
            document.querySelector(
                ".language-selector"
            );

        if (
            selector &&
            !selector.contains(event.target)
        ) {

            selector.classList.remove("open");

        }

    }
);


/* ==========================================
   LOAD SAVED LANGUAGE
========================================== */

window.addEventListener(
    "load",
    function() {

        const saved =
            localStorage.getItem(
                "elinkerLanguage"
            );

        if (saved) {

            let name = "English";

            if (saved === "si") {
                name = "සිංහල";
            }

            if (saved === "ta") {
                name = "தமிழ்";
            }

            document.getElementById(
                "selectedLanguage"
            ).textContent = name;

            if (saved !== "en") {

                setTimeout(
                    function() {
                        translatePage(saved);
                    },
                    1500
                );

            }

        }

    }
);