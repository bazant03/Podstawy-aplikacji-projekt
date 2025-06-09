function initSlider() {
    let currentSlideIndex = 0;
    const $slides = $(".slide");
    const slideCount = $slides.length;
    const animationDuration = 400; // Czas trwania animacji w milisekundach

    function showSlide(index) {
        $slides.filter(".active").removeClass("active").fadeOut(animationDuration);
        // Ukrywamy wszytkie slajdy, z efektem fade out
        $slides.eq(index).addClass("active").show(); // Wyświetlamy pojedynczy slajd, dodajemy mu klasę active
        $slides.eq(index).addClass("active").fadeIn(animationDuration); // Aktywujemy slajd, z efektem fade in
        currentSlideIndex = index;
    }

    // Pokaż slajd o podanym indeksie
    showSlide(currentSlideIndex);

    // Obsługa przycisku next
    $(".next-btn").on("click", () => {
        // Funkcja anonimowa
        currentSlideIndex = (currentSlideIndex + 1) % slideCount; // Przejdź do następnego,
        showSlide(currentSlideIndex); // Licznik będzie się zapętlać od 0 do slideCount-1
    });

    // Obsługa przycisku prev
    $(".prev-btn").on("click", () => {
        currentSlideIndex = (currentSlideIndex - 1 + slideCount) % slideCount; // Przejdź do poprzedniego
        showSlide(currentSlideIndex);
    });
}
