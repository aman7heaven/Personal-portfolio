import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface EmailResult {
  success: boolean;
  error?: string;
}

// Create a reusable transporter object
let transporter: nodemailer.Transporter | null = null;

export function initializeEmailTransport() {
  // For production, use actual SMTP settings
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('Email transport initialized with SMTP');
    return;
  }

  // Fallback to a test account for development
  console.log('Using test email account. Set SMTP_* environment variables for production.');
  nodemailer.createTestAccount().then((testAccount) => {
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('Test email account created:', testAccount.user);
  }).catch(err => {
    console.error('Failed to create test email account:', err);
  });
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  if (!transporter) {
    return {
      success: false,
      error: 'Email transport not initialized'
    };
  }

  try {
    // Set the from address (use environment variable or fallback)
    const from = process.env.EMAIL_FROM || 'portfolio@example.com';
    
    // Send the email
    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    });

    console.log('Message sent:', info.messageId);
    
    // If using test account, log URL where message can be viewed
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
