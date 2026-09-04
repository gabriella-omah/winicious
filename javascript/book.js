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

const bookingForm =
    document.getElementById("bookingForm");


if (bookingForm) {

    bookingForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            /* ==========================================
               GET SUBMIT BUTTON
            ========================================== */

            const submitButton =
                bookingForm.querySelector(
                    ".booking-form__submit"
                );


            /* ==========================================
               READ FORM
            ========================================== */

            const formData =
                new FormData(bookingForm);


            const booking = {

                service:
                    formData.get("service"),

                preferred_date:
                    formData.get("date"),

                preferred_time:
                    formData.get("time"),

                customer_name:
                    formData.get("name"),

                customer_email:
                    formData.get("email"),

                customer_phone:
                    formData.get("phone"),

                notes:
                    formData.get("notes") || null
            };


            /* ==========================================
               DISABLE BUTTON
            ========================================== */

            submitButton.disabled =
                true;

            submitButton.textContent =
                "Sending...";


            try {

                /* ======================================
                   CREATE BOOKING
                ====================================== */

                const {
                    data: createdBooking,
                    error
                } =
                    await supabaseClient
                        .from("bookings")
                        .insert([booking])
                        .select()
                        .single();


                /* ======================================
                   CHECK BOOKING ERROR
                ====================================== */

                if (error) {

                    console.error(
                        "Booking error:",
                        error
                    );


                    throw new Error(
                        "We couldn't submit your appointment request. Please try again."
                    );
                }


                console.log(
                    "Booking created:",
                    createdBooking
                );


                /* ======================================
                   CREATE ADMIN NOTIFICATION
                ====================================== */

                const {
                    error: notificationError
                } =
                    await supabaseClient
                        .from("notifications")
                        .insert({

                            type:
                                "booking",

                            title:
                                "New Booking",

                            message:
                                `${booking.customer_name} submitted a new ${booking.service} booking request.`,

                            related_id:
                                createdBooking.id
                        });


                /* --------------------------------------
                   Notification errors should NOT
                   cancel the booking
                -------------------------------------- */

                if (notificationError) {

                    console.error(
                        "Notification error:",
                        notificationError
                    );

                } else {

                    console.log(
                        "Booking notification created successfully."
                    );

                }


                /* ======================================
                   SUCCESS
                ====================================== */

                bookingForm.reset();

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Request appointment";


                alert(
                    "Your appointment request has been received. We'll contact you to confirm your appointment."
                );


            } catch (error) {

                /* ======================================
                   ERROR HANDLING
                ====================================== */

                console.error(
                    "Booking submission error:",
                    error
                );


                alert(
                    error.message ||
                    "We couldn't submit your appointment request. Please try again."
                );


                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Request appointment";
            }

        }
    );
}