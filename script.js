(function () {
    const config = window.OFFER_AI_SITE_CONFIG || {};

    const playLinks = [
        document.getElementById("play-store-link"),
        document.getElementById("footer-play-link")
    ];
    const privacyLinks = [
        document.getElementById("privacy-link"),
        document.getElementById("footer-privacy-link")
    ];
    const directEmailLink = document.getElementById("contact-email-link");
    const form = document.getElementById("feedback-form");
    const emailInput = document.getElementById("feedback-email");
    const messageInput = document.getElementById("feedback-message");
    const formStatus = document.getElementById("form-status");

    playLinks.forEach(function (link) {
        if (!link) {
            return;
        }
        link.href = config.playStoreUrl || "#";
        link.setAttribute("aria-disabled", config.playStoreUrl ? "false" : "true");
    });

    privacyLinks.forEach(function (link) {
        if (!link) {
            return;
        }
        link.href = config.privacyPolicyUrl || "#";
        link.setAttribute("aria-disabled", config.privacyPolicyUrl ? "false" : "true");
    });

    if (directEmailLink) {
        directEmailLink.href = config.contactEmail
            ? "mailto:" + encodeURIComponent(config.contactEmail)
            : "#";
    }

    if (!form || !emailInput || !messageInput || !formStatus) {
        return;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        if (!isValidEmail(email)) {
            formStatus.textContent = "Please enter a valid email address.";
            emailInput.focus();
            return;
        }

        if (message.length < 10) {
            formStatus.textContent = "Please add a bit more detail before sending.";
            messageInput.focus();
            return;
        }

        formStatus.textContent = "Preparing your message...";

        if (config.formEndpoint) {
            sendWithEndpoint(config.formEndpoint, email, message);
            return;
        }

        if (!config.contactEmail) {
            formStatus.textContent = "Set a support email or form endpoint in site-config.js.";
            return;
        }

        const subject = encodeURIComponent("Offer AI website feedback");
        const body = encodeURIComponent("Reply to: " + email + "\n\nMessage:\n" + message);
        window.location.href = "mailto:" + config.contactEmail + "?subject=" + subject + "&body=" + body;
        formStatus.textContent = "Your mail app should open with a pre-filled feedback draft.";
    });

    function sendWithEndpoint(endpoint, email, message) {
        fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                email: email,
                message: message,
                source: "Offer AI GitHub Pages"
            })
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("Request failed");
                }
                return response.json().catch(function () {
                    return {};
                });
            })
            .then(function () {
                form.reset();
                formStatus.textContent = "Thanks. Your feedback has been sent.";
            })
            .catch(function () {
                formStatus.textContent =
                    "The direct form endpoint is unavailable right now. Please use the email button instead.";
            });
    }

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
})();
