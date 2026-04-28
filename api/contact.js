const RESEND_API_KEY = process.env.RESEND_API_KEY;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio <noreply@lmnpaiva.com.br>',
        to: 'lmnpaiva@gmail.com',
        reply_to: email,
        subject: `Portfolio Contact: ${name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:2rem;background:#FDFAF7;border-radius:12px;">
            <h2 style="color:#B85C72;font-size:1.4rem;margin-bottom:1rem;">New message from your portfolio</h2>
            <div style="background:#fff;border-radius:8px;padding:1.5rem;border:1px solid #E0D8D0;">
              <p style="margin:0 0 0.5rem;font-size:0.85rem;color:#A09890;text-transform:uppercase;letter-spacing:0.1em;">Name</p>
              <p style="margin:0 0 1.5rem;font-size:1rem;color:#2C2825;">${name}</p>
              <p style="margin:0 0 0.5rem;font-size:0.85rem;color:#A09890;text-transform:uppercase;letter-spacing:0.1em;">Email</p>
              <p style="margin:0 0 1.5rem;font-size:1rem;color:#2C2825;">${email}</p>
              <p style="margin:0 0 0.5rem;font-size:0.85rem;color:#A09890;text-transform:uppercase;letter-spacing:0.1em;">Message</p>
              <p style="margin:0;font-size:1rem;color:#2C2825;line-height:1.6;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            <p style="margin-top:1.5rem;font-size:0.8rem;color:#A09890;text-align:center;">Sent via lmnpaiva.com.br</p>
          </div>
        `,
      }),
    });

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      const err = await response.json();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Failed to send email.' });
    }
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
