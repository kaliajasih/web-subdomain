// File: api/domains.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.CLOUDFLARE_API_TOKEN;

  try {
    const response = await fetch('https://api.cloudflare.com/client/v4/zones', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const result = await response.json();

    if (!result.success) {
      return res.status(500).json({ error: 'Gagal mengambil daftar domain' });
    }

    // Ambil hanya ID dan Nama Domain
    const domains = result.result.map(zone => ({
      id: zone.id,
      name: zone.name
    }));

    return res.status(200).json({ success: true, domains });

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
