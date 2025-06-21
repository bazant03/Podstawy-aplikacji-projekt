(() => {
    // Skrypt wykona się dopiero wtedy, gdy załaduje się cała sktruktura DOM
    document.addEventListener("DOMContentLoaded", () => {
        const cartBadge = document.querySelector(".custom-badge"); // To wyświetla liczbe produktów w koszyku w nawigacji
        const cartItemsList = document.getElementById("cart-items-list"); // Div z listą produktów w koszyku
        const emptyCartMessagePage = document.getElementById("empty-cart-message-page"); // Div z informacją o pustym koszyku
        const cartTotalItemsSpan = document.getElementById("cart-total-items"); // Liczba produków w podsumowaniu
        const cartTotalPriceSummarySpan = document.getElementById("cart-total-price-summary"); //Łączna cena w podsumowaniu
        const checkoutBtn = document.getElementById("checkout-btn"); // Guzik przechodzący do zapłaty
        const clearCartBtnPage = document.getElementById("clear-cart-btn-page"); // Guzik czyszczący koszyk

        // Pobieramy koszyk z localStorage, jeśli jest pusty czyli nie ma go w localStorage to przypisujemy pustą listę
        let cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];

        // Funkcje pomocnicze
        // Zapisanie koszyka w localStorage i odświerzenie strony
        function saveCart() {
            localStorage.setItem("shoppingCart", JSON.stringify(cart));
            updateCartUI();
        }

        // Funkcja do odświerzania strony
        function updateCartUI() {
            updateCartBadge(); // Zaktualizowanie liczby produktów wyświetlanej w navbar
            // Sprawdzamy, czy bieżąca ścieżka URL zawiera "cart.html", co oznacza, że jesteśmy na stronie koszyka.
            if (window.location.pathname.includes("cart.html")) {
                // Jeśli tak, to aktualizujemy listę produktów i podsumowanie na tej stronie.
                renderCartPageItems();
                updateCartSummary();
            }
        }

        // Funkcja do odświerzania liczby produktów w navbar w plakietce
        function updateCartBadge() {
            if (cartBadge) {
                // Sprawdzamy, czy element badge istnieje w DOM.
                // Zlicznie elemntów w koszyku, reduce jest wywoływana dla każdego elementu w koszyku
                // sum to akumulator liczby sztuk, item.quantity to liczba sztuk pojedynczego produktu
                // a 0 to wartość początkowa
                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                cartBadge.textContent = totalItems; // Ustawiamy tekst badge'a na obliczoną sumę.
            }
        }

        // Formatowanie ceny aby miała dwie cyfry po przecinku i dodawała walutę zł
        function formatPrice(price) {
            return parseFloat(price).toFixed(2) + " zł";
        }

        // Dodawanie produktu do koszyka
        function addToCart(productId, name, price, image, quantity = 1) {
            // Sprawdzamy czy taki sam produkt jest już w koszyku
            const existingItemIndex = cart.findIndex((item) => item.id === productId);

            if (existingItemIndex > -1) {
                // Jeśli tak to zwiekszamy jego ilość zapisaną w koszyku o podaną 'quantity'.
                cart[existingItemIndex].quantity += quantity;
            } else {
                // Jeśli nie to dodajemy nowy produkt do tablicy cart.
                cart.push({
                    id: productId,
                    name: name,
                    price: parseFloat(price), // Upewniamy się, że cena jest liczbą.
                    image: image,
                    quantity: quantity,
                });
            }
            saveCart(); // Zapisujemy zaktualizowany koszyk w localStorage i odświeżamy
            showToastNotification(`${name} dodano do koszyka!`); // Wyświetlamy animację informującą o dodaniu produktu.
        }

        // Dodawanie produktu z index.html
        // Dla każdego guzika Dodaj do koszyka z klasą add-to-cart-btn dodajemy event listener
        // tak aby po jego naciśnięciu produkt został umieszczony w koszyku
        document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
            // obsługa zdarzeń - Lab 6
            button.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation(); // Zapobiega przejściu do strony produktu po wciśnięciu guzika
                // e.currentTarget odnosi się do przycisku, na którym zdefiniowano listener.
                // Pobieramy dane produktu z atrybutów data-* tego przycisku.
                const targetButton = e.currentTarget;
                const productId = targetButton.dataset.productId;
                const productName = targetButton.dataset.productName;
                const productPrice = parseFloat(targetButton.dataset.productPrice);
                const productImage = targetButton.dataset.productImage;
                addToCart(productId, productName, productPrice, productImage); // Dodanie do koszyka
            });
        });

        // Dodawanie z indywidualnej strony produktu
        // Pobieramy formularz dodawania do koszyka jeśli istnieje na stronie
        const addToCartProductPageForm = document.getElementById("add-to-cart-product-page-form");
        if (addToCartProductPageForm) {
            // W tym wypadku dodajemy event listener dla zdarzenia submit formularza.
            addToCartProductPageForm.addEventListener("submit", (e) => {
                e.preventDefault(); // Zatrzymujemy domyślną akcję wysłania formularza
                // Dane produktu na stronie produktu są w kontenerze z klasą .product-info-container.
                const productInfoContainer = document.querySelector(".product-info-container");
                const productId = productInfoContainer.dataset.productId;
                const productName = productInfoContainer.dataset.productName;
                const productPrice = parseFloat(productInfoContainer.dataset.productPrice);
                const productImage = productInfoContainer.dataset.productImage;
                // Pobieramy wybraną ilość z pola input na stronie produktu.
                const quantityInput = document.getElementById("quantity-product-page");
                const quantity = parseInt(quantityInput.value) || 1; // Domyślnie 1

                addToCart(productId, productName, productPrice, productImage, quantity); // Dodajemy do koszyka z wybraną ilością.
            });
        }

        // Wyświetlanie listy produktów w koszyku na stronie cart.html
        function renderCartPageItems() {
            cartItemsList.innerHTML = ""; // Czyścimy listę elementów na stronie przed ponownym renderowaniem, aby uniknąć duplikatów.

            if (cart.length === 0) {
                // Jeśli koszyk jest pusty, to uwidoczniamy div z wiadomością o pustym koszyku.
                emptyCartMessagePage.style.display = "block"; // coś nie działa
            } else {
                // Jeśli koszyk nie jest pusty:
                emptyCartMessagePage.style.display = "none"; // Chowamy div z wiadomością o pustym koszyku.
                // Iterujemy po każdym produkcie w koszyku, aby wygenerować dla niego element HTML.
                cart.forEach((item) => {
                    // Korygujemy ścieżkę do obrazka: usuwamy ewentualne '../' z początku,
                    // ponieważ względem pliku cart.html zdjęcia są w katalogu images/, a nie ../images/.
                    const correctedImage = item.image.startsWith("../") ? item.image.substring(3) : item.image;

                    // Generujemy dynamicznie kod HTML produktu na stronie koszyka.
                    const itemElement = document.createElement("div");
                    itemElement.classList.add("card", "mb-3", "cart-item-card", "custom-card-div"); // Nadajemy klasy do stylizacji.
                    itemElement.dataset.productId = item.id;
                    // Dynamizcne generowanie kodu html pojedynczego produktu
                    // Wypełniamy element HTML strukturą dla pojedynczej pozycji w koszyku, używając template string.
                    // Komentarze dotyczące struktury HTML zostały przeniesione do opisu poniżej.
                    itemElement.innerHTML = `
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-2 col-3">
                                    <img src="${correctedImage}" alt="${
                        item.name
                    }" class="img-fluid rounded cart-item-image" style="max-height: 80px; object-fit: contain;">
                                </div>
                                <div class="col-md-4 col-9">
                                    <h5 class="mb-1 product-name-cart">${item.name}</h5>
                                    <small class="text-muted product-price-cart">Cena: ${formatPrice(
                                        item.price
                                    )}</small>
                                </div>
                                <div class="col-md-3 col-6 mt-2 mt-md-0 d-flex align-items-center justify-content-start justify-content-md-center">
                                    <button class="btn btn-outline-secondary btn-sm quantity-decrease custom-button" data-product-id="${
                                        item.id
                                    }">-</button>
                                    <input type="text" value="${
                                        item.quantity
                                    }" min="1" class="form-control form-control-sm quantity-input mx-2 text-center" style="width: 60px;" data-product-id="${
                        item.id
                    }" readonly>
                                    <button class="btn btn-outline-secondary btn-sm quantity-increase custom-button" data-product-id="${
                                        item.id
                                    }">+</button>
                                </div>
                                <div class="col-md-2 col-4 mt-2 mt-md-0 text-md-end">
                                    <strong class="item-total-price">${formatPrice(item.price * item.quantity)}</strong>
                                </div>
                                <div class="col-md-1 col-2 mt-2 mt-md-0 text-end">
                                    <button class="btn btn-outline-danger btn-sm remove-from-cart-btn" data-product-id="${
                                        item.id
                                    }">x</button>
                                </div>
                            </div>
                        </div>
                    `;
                    cartItemsList.appendChild(itemElement); // Dodajemy utworzony element produktu do listy na stronie.
                });
                // Po wyrenderowaniu wszystkich elementów, dodajemy do nich odpowiednie event listenry
                addCartItemEventListeners();
            }
        }

        // Funkcja dodająca listenery do przycisków i pól w elementach koszyka.
        function addCartItemEventListeners() {
            // Dodawnie event listenerów do guzików od usuwania produktu.
            document.querySelectorAll(".remove-from-cart-btn").forEach((button) => {
                button.addEventListener("click", (e) => {
                    // Pobieramy ID produktu z atrybutu data- przycisku, który został kliknięty.
                    const productId = e.currentTarget.dataset.productId;
                    removeFromCart(productId); // Wywołujemy funkcję usuwającą produkt.
                });
            });

            // Event listenery dla przycisków zmniejszania ilości.
            document.querySelectorAll(".quantity-decrease").forEach((button) => {
                button.addEventListener("click", (e) => {
                    const targetButton = e.currentTarget;
                    const productId = targetButton.dataset.productId;
                    // Znajdujemy produkt w koszyku, aby sprawdzić jego aktualną ilość.
                    const item = cart.find((cartItem) => cartItem.id === productId);
                    // Zmniejszamy ilość tylko jeśli jest większa niż 1.
                    if (item && item.quantity > 1) {
                        updateQuantity(productId, item.quantity - 1);
                    }
                    // Jeśli item.quantity jest 1, kliknięcie minus nic nie robi (można by tu dodać logikę usuwania produktu).
                });
            });

            // Event listenery dla przycisków zwiększania ilości.
            document.querySelectorAll(".quantity-increase").forEach((button) => {
                button.addEventListener("click", (e) => {
                    const targetButton = e.currentTarget;
                    const productId = targetButton.dataset.productId;
                    const item = cart.find((cartItem) => cartItem.id === productId);
                    // Jeśli produkt istnieje, zwiększamy jego ilość.
                    if (item) {
                        updateQuantity(productId, item.quantity + 1);
                    }
                });
            });
        }

        // Funkcja usuwająca produkt z koszyka na podstawie jego id.
        function removeFromCart(productId) {
            // Tworzymy nową tablicę cart zawierającą wszystkie produkty oprócz tego o podanym id.
            cart = cart.filter((item) => item.id !== productId);
            saveCart(); // Zapisujemy zmiany.
        }

        // Funkcja aktualizująca ilość produktu w koszyku.
        function updateQuantity(productId, newQuantity) {
            // Znajdujemy indeks produktu w tablicy cart
            const itemIndex = cart.findIndex((item) => item.id === productId);
            // Jeśli produkt istnieje i nowa ilość jest poprawna
            if (itemIndex > -1 && newQuantity >= 1) {
                cart[itemIndex].quantity = newQuantity; // Aktualizujemy ilość.
            } else if (itemIndex > -1 && newQuantity < 1) {
                // Zabezpieczenie przed iloscią produktów <0.
                cart[itemIndex].quantity = 1;
            }
            saveCart(); // Zapisujemy zmiany
        }

        // Funkcja aktualizująca wyświetlane podsumowanie koszyka.
        function updateCartSummary() {
            // Obliczamy łączną liczbę sztuk wszystkich produktów.
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            // Obliczamy łączną cenę wszystkich produktów.
            const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

            // Ustawiamy tekst odpowiednich elementów <span> na obliczone wartości.
            cartTotalItemsSpan.textContent = totalItems;
            cartTotalPriceSummarySpan.textContent = formatPrice(totalPrice);

            // Jeśli istnieje przycisk Przejdź do kasy, jego stan 'disabled' jest ustawiany
            // w zależności od tego, czy koszyk jest pusty.
            if (checkoutBtn) {
                checkoutBtn.disabled = cart.length === 0; // Jesli koszyk jest pusty to checkoutBtn.disabled = true
            }
        }

        // Symulacja przejścia do kasy
        if (checkoutBtn) {
            checkoutBtn.addEventListener("click", () => {
                alert("Przechodzimy do kasy...");
            });
        }

        // Obsługa przycisku Wyczyść Koszyk
        if (clearCartBtnPage) {
            clearCartBtnPage.addEventListener("click", () => {
                // Wyświetlamy standardowe okno dialogowe przeglądarki z prośbą o potwierdzenie.
                if (confirm("Czy na pewno chcesz wyczyścić koszyk?")) {
                    cart = []; // Resetujemy tablicę 'cart' do pustej.
                    saveCart(); // Zapisujemy pusty koszyk
                }
            });
        }

        // Proste powiadomienie Toast przy dodaniu do koszyka
        function showToastNotification(message) {
            const toast = document.createElement("div"); // Tworzymy nowy div
            toast.classList.add("toast-notification"); // Dodajemy mu klasę do stylizacji.
            toast.textContent = message; // Ustawiamy treść powiadomienia.
            document.body.appendChild(toast); // Dodajemy element do ciała dokumentu.

            // Używamy setTimeout, aby dodać klasę show z małym opóźnieniem
            // Pozwala to przeglądarce najpierw zastosować style początkowe (np. opacity: 0),
            // a następnie animować zmianę do stanu widocznego (zdefiniowanego przez klasę .show).
            setTimeout(() => {
                toast.classList.add("show");
            }, 100);

            // Ustawiamy kolejny setTimeout na ukrycie i usunięcie elementu toast po kilku sekundach.
            setTimeout(() => {
                toast.classList.remove("show"); // Rozpoczynamy animację ukrywania.
                // Po zakończeniu animacji ukrywania usuwamy element z DOM.
                setTimeout(() => {
                    // Sprawdzamy, czy element nadal istnieje w dokumencie przed próbą usunięcia,
                    // aby uniknąć błędów, jeśli zostałby usunięty w międzyczasie przez inny mechanizm.
                    if (document.body.contains(toast)) {
                        document.body.removeChild(toast);
                    }
                }, 500); // Ten czas powinien być równy lub nieco dłuższy niż czas trwania transition dla opacity/transform.
            }, 3000); // Czas, przez który powiadomienie jest w pełni widoczne.
        }

        // Wywołujemy updateCartUI() przy pierwszym załadowaniu strony po załadowaniu DOM.
        updateCartUI();
    });
})();
