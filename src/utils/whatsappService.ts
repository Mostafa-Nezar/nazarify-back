export const sendAdminWhatsApp = async (message: string) => {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;

    if (!token || !phoneNumberId || !adminNumber) {
        console.warn("WhatsApp credentials or admin number are not configured in environment variables.");
        return;
    }

    try {
        const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: adminNumber,
                type: 'text',
                text: {
                    body: message,
                },
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("Failed to send WhatsApp message:", data);
        } else {
            console.log("WhatsApp message sent successfully:", data);
        }
    } catch (error) {
        console.error("Error sending WhatsApp message:", error);
    }
};
