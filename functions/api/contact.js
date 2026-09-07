export async function onRequestPost(context) {
  const formData = await context.request.formData();

  const name = formData.get("name");
  const phone = formData.get("phone");
  const email = formData.get("email");
  const message = formData.get("message");

  console.log({
    name,
    phone,
    email,
    message
  });

  return new Response(
    JSON.stringify({
      success: true,
      message: "Forespørselen ble mottatt"
    }),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}