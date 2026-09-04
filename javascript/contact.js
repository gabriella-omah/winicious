
const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = contactForm.querySelector(
            ".contact-form__submit"
        );

        const formData = new FormData(contactForm);

        const contactMessage = {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone") || null,
            reason: formData.get("reason"),
            message: formData.get("message")
        };

        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        const { error } = await supabaseClient
            .from("contact_messages")
            .insert([contactMessage]);

        if (error) {
            console.error("Contact form error:", error);

            alert(
                "We couldn't send your message. Please try again."
            );

            submitButton.disabled = false;
            submitButton.textContent = "Send message";
            return;
        }

        contactForm.reset();

        submitButton.disabled = false;
        submitButton.textContent = "Send message";

        alert(
            "Thanks for reaching out. We'll get back to you as soon as we can."
        );
    });
}