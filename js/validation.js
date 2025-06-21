// Walidacja z użyciem JS - Lab 8

// Funkcja typu IIFE, czyli samowykonująca się funkcja anonimowa
(() => {
    // Skrypt wykona się dopiero wtedy gdy załaduje się cała zawartość strony
    document.addEventListener("DOMContentLoaded", () => {
        const form = document.getElementById("contactForm"); // Pobieramy formularz

        // Funkcja pomocnicza do walidacji jakiegoś pojedynczego pola
        function validateField(inputElement, validationFn, errorMessage) {
            const feedbackElement = inputElement.nextElementSibling; // To powinien być element bootstrapowej klasy invalid-feedback

            if (validationFn(inputElement.value.trim())) {
                inputElement.classList.remove("is-invalid");
                inputElement.classList.add("is-valid");
                /* Bootstrap automatycznie kontroluje widoczność elementu z klasą .invalid-feedback
            w zależności od tego, czy walidowany element input ma przypisaną klasę is-invalid,
            gdy is-invalid jest obecne na inpucie, invalid-feedback staje się widoczny a
            gdy is-invalid jest usunięte, invalid-feedback zostaje ukryty. */
                return true;
            } else {
                inputElement.classList.add("is-invalid");
                inputElement.classList.remove("is-valid");
                if (feedbackElement && feedbackElement.classList.contains("invalid-feedback")) {
                    feedbackElement.textContent = errorMessage; // Ustawiamy spersonalizowany komunikat
                }
                return false;
            }
        }

        // Funkcje do walidowania konkretnych pól
        function validateNameInput() {
            const nameInput = document.getElementById("name");
            // Najpierw duża litera, potem conajmniej jedna mała, opcjonalnie : "-",duża litera, conajmniej jedna mała
            const namePattern = /^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+(?:-[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)?$/;
            return validateField(
                nameInput,
                (value) => namePattern.test(value),
                "Proszę podać swoje imię np. Anna, Jan-Krzysztof."
            );
        }

        function validateEmailInput() {
            const emailInput = document.getElementById("email");
            // Najpierw conajmniej jeden znak niebędący "@", następnie "@", conajmniej jeden znak != "@", "." ,
            // conajmniej jeden znak != "@"
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return validateField(emailInput, (value) => emailPattern.test(value), "Proszę podać poprawny adres email.");
        }

        function validateSubjectInput() {
            const subjectInput = document.getElementById("subject");
            const validationLogic = (value) => {
                if (value.length === 0) {
                    // To w wypadku jeśli temat jest pusty, bez tego wyświetli się komunikat o zbyt długim temacie dla pustego
                    subjectInput.classList.remove("is-invalid", "is-valid");
                    return true;
                }
                return value.length <= 100;
            };
            return validateField(subjectInput, validationLogic, "Temat jest za długi (maks. 100 znaków).");
        }

        function validateMessageInput() {
            const messageInput = document.getElementById("message");
            return validateField(
                messageInput,
                (value) => value.length > 0 && value.length <= 255,
                "Proszę wpisać treść wiadomości (od 1 do 255 znaków)."
            );
        }

        // Dodajemy event listenery blur, w celu walidowania na żywo
        document.getElementById("name").addEventListener("blur", validateNameInput);
        document.getElementById("email").addEventListener("blur", validateEmailInput);
        document.getElementById("subject").addEventListener("blur", validateSubjectInput);
        document.getElementById("message").addEventListener("blur", validateMessageInput);

        // Dodatkowo dodajemy walidację przy wysyłaniu formularza
        form.addEventListener("submit", (event) => {
            event.preventDefault(); // Wstrzymujemy wysłanie formularza, aby móc go wcześniej zwalidować

            const isNameValid = validateNameInput();
            const isEmailValid = validateEmailInput();
            const isSubjectValid = validateSubjectInput();
            const isMessageValid = validateMessageInput();

            const isFormValid = isNameValid && isEmailValid && isSubjectValid && isMessageValid;

            if (isFormValid) {
                alert("Wiadomość wysłana pomyślnie!");
                form.reset();
                // Usuwamy wszystkie klasy valid/invalid, aby nie pozostawiać mylących komunikatów
                form.querySelectorAll(".is-valid, .is-invalid").forEach((el) => {
                    el.classList.remove("is-valid", "is-invalid");
                });
            }
        });
    });
})();
