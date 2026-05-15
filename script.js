(function () {
    const config = window.OFFER_AI_SITE_CONFIG || {};
    const apiBaseUrl = String(config.backendBaseUrl || "").replace(/\/+$/, "");

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
    const builderForm = document.getElementById("resume-builder-form");
    const builderStatus = document.getElementById("builder-status-text");
    const apiModeBadge = document.getElementById("api-mode-badge");
    const generatedOutput = document.getElementById("generated-text-output");
    const outputLabel = document.getElementById("output-label");

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

    if (apiModeBadge) {
        apiModeBadge.textContent = apiBaseUrl ? "Live API ready" : "Demo preview";
    }

    setupFeedbackForm();
    setupResumeBuilder();

    function setupFeedbackForm() {
        if (!form || !emailInput || !messageInput || !formStatus) {
            return;
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const email = emailInput.value.trim();
            const message = messageInput.value.trim();
            const submitButton = form.querySelector("button[type='submit']");

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
            setBusy(submitButton, true);

            if (config.formEndpoint) {
                sendWithEndpoint(config.formEndpoint, email, message, submitButton);
                return;
            }

            setBusy(submitButton, false);

            if (!config.contactEmail) {
                formStatus.textContent = "Set a support email or form endpoint in site-config.js.";
                return;
            }

            const subject = encodeURIComponent("Offer AI website feedback");
            const body = encodeURIComponent("Reply to: " + email + "\n\nMessage:\n" + message);
            window.location.href = "mailto:" + config.contactEmail + "?subject=" + subject + "&body=" + body;
            formStatus.textContent =
                "Direct form delivery is not connected yet. A pre-filled email draft has been prepared instead.";
        });
    }

    function setupResumeBuilder() {
        if (!builderForm) {
            return;
        }

        const fields = builderForm.querySelectorAll("input, textarea, select");
        fields.forEach(function (field) {
            field.addEventListener("input", updateResumePreview);
            field.addEventListener("change", updateResumePreview);
        });

        const previewButton = document.getElementById("preview-resume-button");
        const pdfButton = document.getElementById("generate-pdf-button");
        const coverButton = document.getElementById("generate-cover-button");
        const introButton = document.getElementById("generate-intro-button");
        const copyButton = document.getElementById("copy-output-button");

        if (previewButton) {
            previewButton.addEventListener("click", function () {
                updateResumePreview();
                setBuilderStatus("Preview refreshed from your latest resume fields.");
            });
        }

        if (pdfButton) {
            pdfButton.addEventListener("click", function () {
                generateResumePdf(pdfButton);
            });
        }

        if (coverButton) {
            coverButton.addEventListener("click", function () {
                generateDocument("cover", coverButton);
            });
        }

        if (introButton) {
            introButton.addEventListener("click", function () {
                generateDocument("intro", introButton);
            });
        }

        if (copyButton) {
            copyButton.addEventListener("click", function () {
                const text = generatedOutput ? generatedOutput.textContent.trim() : "";
                if (!text) {
                    setBuilderStatus("There is no generated text to copy yet.");
                    return;
                }
                navigator.clipboard.writeText(text)
                    .then(function () {
                        setBuilderStatus("Generated text copied.");
                    })
                    .catch(function () {
                        setBuilderStatus("Copy is blocked by this browser. Select the text manually.");
                    });
            });
        }

        updateResumePreview();
        setBuilderStatus(
            apiBaseUrl
                ? "Connected mode is ready. Generation will use your Render backend."
                : "Demo mode is active. Set backendBaseUrl in site-config.js to use the Render API."
        );
    }

    function generateResumePdf(button) {
        const data = collectResumeData();
        if (!data) {
            return;
        }

        if (!apiBaseUrl) {
            setBuilderStatus("Demo preview is ready. Add backendBaseUrl to site-config.js to generate the real PDF.");
            setGeneratedText(
                "PDF generation is wired to the existing Render endpoint /generate_cv.\n\nCurrent demo preview:\n" +
                    buildPlainResume(data),
                "Live PDF export needs the Render backend URL."
            );
            return;
        }

        setBusy(button, true);
        setBuilderStatus("Generating PDF with Offer AI...");
        fetchApi("/generate_cv", data.payload, "blob")
            .then(function (blob) {
                downloadBlob(blob, safeFileName(data.role || "Resume") + ".pdf");
                setBuilderStatus("PDF generated and downloaded.");
            })
            .catch(function (error) {
                setBuilderStatus(getFriendlyApiError(error));
            })
            .finally(function () {
                setBusy(button, false);
            });
    }

    function generateDocument(kind, button) {
        const data = collectResumeData();
        if (!data) {
            return;
        }

        if (!apiBaseUrl) {
            const content = kind === "cover"
                ? buildDemoCoverLetter(data)
                : buildDemoIntroMessage(data);
            setGeneratedText(content, kind === "cover" ? "Demo cover letter" : "Demo intro message");
            setBuilderStatus("Demo text generated locally. Connect Render for AI output.");
            return;
        }

        const endpoint = kind === "cover" ? "/generate_cover_letter" : "/generate_intro_message";
        setBusy(button, true);
        setBuilderStatus(kind === "cover" ? "Generating cover letter..." : "Generating intro message...");
        fetchApi(endpoint, data.documentPayload, "json")
            .then(function (response) {
                setGeneratedText(
                    response.content || "",
                    kind === "cover" ? "Cover letter generated by Offer AI" : "Intro message generated by Offer AI"
                );
                setBuilderStatus("Generated text is ready.");
            })
            .catch(function (error) {
                setBuilderStatus(getFriendlyApiError(error));
            })
            .finally(function () {
                setBusy(button, false);
            });
    }

    function collectResumeData() {
        const name = getValue("resume-name");
        const role = getValue("resume-role");
        const email = getValue("resume-email");
        const location = getValue("resume-location");
        const phone = getValue("resume-phone");
        const targetLanguage = getValue("resume-language") || "English";
        const summary = getValue("resume-summary");
        const skills = getValue("resume-skills");
        const experience = getValue("resume-experience");
        const education = getValue("resume-education");
        const jobDescription = getValue("resume-job");
        const style = getValue("resume-style") || "professional";

        if (!name || !role || !email) {
            setBuilderStatus("Add your name, target role, and email before generating.");
            return null;
        }

        if (!isValidEmail(email)) {
            setBuilderStatus("Use a valid email in the resume profile.");
            return null;
        }

        const contacts = {
            city: location,
            phone: phone,
            email: email,
            telegram: "",
            whatsapp: ""
        };
        const experienceItems = buildExperienceItems(experience, role);
        const educationItems = education
            ? [{ institution: education, specialty: "", year: "" }]
            : [];
        const payload = {
            raw_name: name,
            raw_dob: "",
            raw_contacts: JSON.stringify(contacts),
            raw_target_job_title: role,
            raw_job_description: jobDescription,
            raw_cv_style: style,
            raw_summary: summary,
            raw_skills: skills,
            target_language: targetLanguage,
            experiences: experienceItems,
            educations: educationItems,
            languages: [],
            links: [],
            raw_photo: ""
        };

        return {
            name: name,
            role: role,
            email: email,
            location: location,
            phone: phone,
            summary: summary,
            skills: skills,
            experience: experience,
            education: education,
            jobDescription: jobDescription,
            payload: payload,
            documentPayload: Object.assign({}, payload, {
                job_description: jobDescription,
                tone: "professional"
            })
        };
    }

    function updateResumePreview() {
        const data = collectResumeData();
        if (!data) {
            return;
        }

        setText("preview-name", data.name);
        setText("preview-role", data.role);
        setText(
            "preview-contact",
            [data.location, data.email, data.phone].filter(Boolean).join(" | ")
        );
        setText("preview-summary", data.summary || "Your professional summary will appear here.");
        setText("preview-skills", data.skills || "Add skills to make the resume easier to scan.");

        const list = document.getElementById("preview-experience");
        if (list) {
            list.innerHTML = "";
            getExperienceLines(data.experience).forEach(function (line) {
                const item = document.createElement("li");
                item.textContent = line;
                list.appendChild(item);
            });
        }
    }

    function fetchApi(path, payload, responseType) {
        const headers = {
            "Content-Type": "application/json",
            "Accept": responseType === "blob" ? "application/pdf" : "application/json",
            "Authorization": "Bearer " + (config.builderAccessToken || "guest:web-preview")
        };

        return fetch(apiBaseUrl + path, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        })
            .then(function (response) {
                if (!response.ok) {
                    return response.json()
                        .catch(function () {
                            return {};
                        })
                        .then(function (errorPayload) {
                            const error = new Error(errorPayload.detail || "Request failed");
                            error.status = response.status;
                            throw error;
                        });
                }
                return responseType === "blob" ? response.blob() : response.json();
            });
    }

    function sendWithEndpoint(endpoint, email, message, submitButton) {
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
                    return response.json()
                        .catch(function () {
                            return {};
                        })
                        .then(function (payload) {
                            const error = new Error(payload.error || "Request failed");
                            error.status = response.status;
                            throw error;
                        });
                }
                return response.json().catch(function () {
                    return {};
                });
            })
            .then(function () {
                form.reset();
                formStatus.textContent = "Thanks. Your feedback has been sent.";
            })
            .catch(function (error) {
                if (error && error.status === 429) {
                    formStatus.textContent =
                        "You have already sent feedback recently. Please try again in about an hour.";
                    return;
                }

                formStatus.textContent =
                    error && error.message
                        ? error.message
                        : "The direct form endpoint is unavailable right now. Please use the email button instead.";
            })
            .finally(function () {
                setBusy(submitButton, false);
            });
    }

    function buildExperienceItems(value, role) {
        const lines = getExperienceLines(value);
        if (!lines.length) {
            return [];
        }
        return [{
            company: "Recent experience",
            position: role,
            period: "Recent",
            description: lines.join("\n")
        }];
    }

    function getExperienceLines(value) {
        return String(value || "")
            .split(/\n+/)
            .map(function (line) {
                return line.replace(/^[-*]\s*/, "").trim();
            })
            .filter(Boolean)
            .slice(0, 6);
    }

    function buildPlainResume(data) {
        return [
            data.name + " - " + data.role,
            [data.location, data.email, data.phone].filter(Boolean).join(" | "),
            "",
            "Summary",
            data.summary,
            "",
            "Skills",
            data.skills,
            "",
            "Experience",
            getExperienceLines(data.experience).map(function (line) {
                return "- " + line;
            }).join("\n")
        ].join("\n");
    }

    function buildDemoCoverLetter(data) {
        const companyLine = data.jobDescription
            ? "Your vacancy matches the product, analytics, and cross-functional delivery experience in my background."
            : "I am excited to apply for the " + data.role + " role and bring a practical, outcome-focused approach.";

        return [
            "Dear Hiring Team,",
            "",
            companyLine,
            "My experience includes " + summarizeFirstExperience(data.experience) + ".",
            "I would welcome the chance to discuss how this background can support your team goals.",
            "",
            "Best regards,",
            data.name
        ].join("\n");
    }

    function buildDemoIntroMessage(data) {
        return "Hi, I am " + data.name + ", a " + data.role +
            " candidate with experience in " + summarizeSkills(data.skills) +
            ". I would be glad to share my resume and discuss how I can help your team.";
    }

    function summarizeFirstExperience(value) {
        const line = getExperienceLines(value)[0] || "building useful products and improving team execution";
        return line.charAt(0).toLowerCase() + line.slice(1);
    }

    function summarizeSkills(value) {
        return String(value || "product delivery and communication")
            .split(",")
            .map(function (item) {
                return item.trim();
            })
            .filter(Boolean)
            .slice(0, 3)
            .join(", ");
    }

    function setGeneratedText(text, label) {
        if (generatedOutput) {
            generatedOutput.textContent = text || "No content returned.";
        }
        if (outputLabel) {
            outputLabel.textContent = label || "";
        }
    }

    function setBuilderStatus(message) {
        if (builderStatus) {
            builderStatus.textContent = message;
        }
    }

    function getFriendlyApiError(error) {
        if (error && error.status === 403) {
            return "This action needs a signed-in or premium account on the backend. Try a standard resume first or connect web auth.";
        }
        if (error && error.status === 401) {
            return "The backend rejected the session token. Update builderAccessToken or enable Google web sign-in.";
        }
        return error && error.message
            ? error.message
            : "The Render backend is unavailable right now.";
    }

    function downloadBlob(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    function safeFileName(value) {
        return String(value || "Resume")
            .replace(/[^a-z0-9]+/gi, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 48) || "Resume";
    }

    function getValue(id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : "";
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    function setBusy(button, busy) {
        if (button) {
            button.disabled = Boolean(busy);
        }
    }

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
})();
