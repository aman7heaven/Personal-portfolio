export async function sendEmail(options: {
  to: string,
  from: string,
  subject: string,
  text: string,
  html?: string
}): Promise<boolean> {
  try {
    const { to, from, subject, text, html } = options;
    
    // Use native Node.js fetch API to make a request to a mail service
    // For simplicity, we'll use a simple email service API
    const response = await fetch(process.env.EMAIL_SERVICE_URL || "https://api.example.com/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.EMAIL_API_KEY || "your-api-key"}`,
      },
      body: JSON.stringify({
        to,
        from,
        subject,
        text,
        html
      })
    });
    
    if (!response.ok) {
      console.error("Failed to send email:", await response.text());
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
}
