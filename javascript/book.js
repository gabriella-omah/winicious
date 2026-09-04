/* ==================================================
   BOOKING FAQ
================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const faqItems = document.querySelectorAll(
        ".booking-faq__item"
    );
    if (!faqItems.length) return;
    faqItems.forEach((item) => {
        const question = item.querySelector(
            ".booking-faq__question"
        );
        const answer = item.querySelector(
            ".booking-faq__answer"
        );
        if (!question || !answer) return;
        question.addEventListener("click", () => {
            const isOpen =
                item.classList.contains("is-open");
            /*
             * Close every other FAQ item.
             * This keeps the accordion clean.
             */
            faqItems.forEach((otherItem) => {
                if (otherItem !== item) {
                    otherItem.classList.remove(
                        "is-open"
                    );
                    const otherQuestion =
                        otherItem.querySelector(
                            ".booking-faq__question"
                        );
                    if (otherQuestion) {
                        otherQuestion.setAttribute(
                            "aria-expanded",
                            "false"
                        );
                    }
                }
            });
            /*
             * Toggle current item.
             */
            if (isOpen) {
                item.classList.remove(
                    "is-open"
                );
                question.setAttribute(
                    "aria-expanded",
                    "false"
                );
            } else {
                item.classList.add(
                    "is-open"
                );
                question.setAttribute(
                    "aria-expanded",
                    "true"
                );
            }
        });
    });
});

const bookingForm = document.getElementById("bookingForm");

if (bookingForm) {
    bookingForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = bookingForm.querySelector(
            ".booking-form__submit"
        );

        const formData = new FormData(bookingForm);

        const booking = {
            service: formData.get("service"),
            preferred_date: formData.get("date"),
            preferred_time: formData.get("time"),
            customer_name: formData.get("name"),
            customer_email: formData.get("email"),
            customer_phone: formData.get("phone"),
            notes: formData.get("notes") || null
        };

        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        const { error } = await supabaseClient
            .from("bookings")
            .insert([booking]);

        if (error) {
            console.error("Booking error:", error);

            alert(
                "We couldn't submit your appointment request. Please try again."
            );

            submitButton.disabled = false;
            submitButton.textContent = "Request appointment";
            return;
        }

        bookingForm.reset();

        submitButton.disabled = false;
        submitButton.textContent = "Request appointment";

        alert(
            "Your appointment request has been received. We'll contact you to confirm your appointment."
        );
    });
}