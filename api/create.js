// File: api/create.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Terima zoneId dan zoneName (rootDomain) dari body
  const { subdomain, target, zoneId, zoneName } = req.body;

  if (!subdomain || !target || !zoneId || !zoneName) {
    return res.status(400).json({ error: 'Data tidak lengkap (Pilih domain terlebih dahulu)' });
  }

  const apiKey = process.env.CLOUDFLARE_API_TOKEN;
  
  // Gunakan zoneName yang dipilih user sebagai root domain
  const rootDomain = zoneName; 

  const data = {
    type: 'A', 
    name: `${subdomain}.${rootDomain}`,
    content: target,
    ttl: 1, 
    proxied: false, 
  };

  try {
    // Gunakan zoneId yang dipilih user
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.success) {
      return res.status(500).json({ error: result.errors[0]?.message || 'Gagal' });
    }

    return res.status(200).json({ success: true, message: `Subdomain ${subdomain}.${rootDomain} berhasil dibuat!` });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
