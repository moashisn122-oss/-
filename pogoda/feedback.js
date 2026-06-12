document.addEventListener("DOMContentLoaded", () => {
    const feedbackText = document.getElementById("feedback-text");
    const stars = document.querySelectorAll(".stars i");
    const submitBtn = document.getElementById("submit-feedback");
    const feedbackMessage = document.getElementById("feedback-message");

    let rating = 0;

    // Обработка клика по звездам
    stars.forEach(star => {
        star.addEventListener("click", () => {
            const currentRating = parseInt(star.dataset.rating);
            rating = currentRating;

            stars.forEach((s, index) => {
                if (index < currentRating) {
                    s.classList.add("active");
                } else {
                    s.classList.remove("active");
                }
            });
        });
    });

    // Обработка отправки отзыва
    submitBtn.addEventListener("click", async () => {
        const text = feedbackText.value.trim();

        if (!text) {
            feedbackMessage.textContent = "Пожалуйста, напишите отзыв.";
            feedbackMessage.style.color = "#ff6b6b";
            return;
        }

        if (rating === 0) {
            feedbackMessage.textContent = "Пожалуйста, выберите оценку.";
            feedbackMessage.style.color = "#ff6b6b";
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Отправка...";

        try {
            // Здесь можно отправить отзыв на сервер
            // Для примера используем бесплатный сервис FormSubmit
            const response = await fetch("https://formsubmit.co/your-email@example.com", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text: text,
                    rating: rating,
                    date: new Date().toLocaleString("ru-RU")
                })
            });

            if (response.ok) {
                feedbackMessage.textContent = "Спасибо за отзыв! 😊";
                feedbackMessage.style.color = "#4CAF50";
                feedbackText.value = "";
                stars.forEach(star => star.classList.remove("active"));
                rating = 0;
            } else {
                feedbackMessage.textContent = "Произошла ошибка. Попробуйте позже.";
                feedbackMessage.style.color = "#ff6b6b";
            }
        } catch (error) {
            console.error("Ошибка при отправке отзыва:", error);
            feedbackMessage.textContent = "Произошла ошибка. Попробуйте позже.";
            feedbackMessage.style.color = "#ff6b6b";
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Отправить";
        }
    });
});