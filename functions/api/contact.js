export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();

    const name = formData.get("name");
    const phone = formData.get("phone");
    const email = formData.get("email");
    const message = formData.get("message");
    const turnstileToken = formData.get("cf-turnstile-response");

    if (!name || !phone || !message) {
      return jsonResponse(
        {
          success: false,
          message: "Manglende obligatoriske felter"
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
      console.error("Turnstile verification failed:", turnstileResult);

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
      const error = await resendResponse.text();
      console.error("Resend error:", error);

      return jsonResponse(
        {
          success: false,
          message: "Kunne ikke sende e-post"
        },
        500
      );
    }

    return jsonResponse({
      success: true,
      message: "Forespørselen ble sendt"
    });

  } catch (error) {
    console.error(error);

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