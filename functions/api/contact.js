export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();

    const name = formData.get("name")?.toString().trim() || "";
    const phone = formData.get("phone")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim() || "";
    const message = formData.get("message")?.toString().trim() || "";
    const turnstileToken = formData.get("cf-turnstile-response");

    if (name.length < 2 || name.length > 100) {
      console.warn("Contact form: Validation failed - name");
      return jsonResponse(
        {
          success: false,
          message: "Ugyldig navn"
        },
        400
      );
    }

    if (!/^[0-9+\s()-]{5,20}$/.test(phone)) {
      console.warn("Contact form: Validation failed - phone");
      return jsonResponse(
        {
          success: false,
          message: "Ugyldig telefonnummer"
        },
        400
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.warn("Contact form: Validation failed - email");
      return jsonResponse(
        {
          success: false,
          message: "Ugyldig e-postadresse"
        },
        400
      );
    }

    if (message.length < 5 || message.length > 5000) {
      console.warn("Contact form: Validation failed - message");
      return jsonResponse(
        {
          success: false,
          message: "Ugyldig melding"
        },
        400
      );
    }

    if (!turnstileToken) {
      return jsonResponse(
        {
          success: false,
          message: "Sikkerhetskontrollen mangler"
        },
        400
      );
    }

    const turnstileResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          secret: context.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken
        })
      }
    );

    const turnstileResult = await turnstileResponse.json();

    if (!turnstileResult.success) {
      console.warn("Contact form: Turnstile verification failed");

      return jsonResponse(
        {
          success: false,
          message: "Sikkerhetskontrollen ble ikke godkjent"
        },
        403
      );
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${context.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Hagen Elektro <nettside@nettside-demo.no>",
        to: ["espenandreashagen@gmail.com"],
        reply_to: email || undefined,
        subject: `Ny henvendelse fra ${name}`,
        html: `
          <h2>Ny henvendelse fra nettsiden</h2>

          <p><strong>Navn:</strong> ${escapeHtml(name)}</p>
          <p><strong>Telefon:</strong> ${escapeHtml(phone)}</p>
          <p><strong>E-post:</strong> ${escapeHtml(email || "Ikke oppgitt")}</p>

          <p><strong>Melding:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
        `
      })
    });

    if (!resendResponse.ok) {
      await resendResponse.text();
      console.error("Contact form: Resend failed");

      return jsonResponse(
        {
          success: false,
          message: "Kunne ikke sende e-post"
        },
        500
      );
    }

    console.log("Contact form: Message sent successfully");

    return jsonResponse({
      success: true,
      message: "Forespørselen ble sendt"
    });

  } catch (error) {
    console.error("Contact form: Unexpected server error");

    return jsonResponse(
      {
        success: false,
        message: "Serverfeil"
      },
      500
    );
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}