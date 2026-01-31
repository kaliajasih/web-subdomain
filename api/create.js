export default async function handler(req, res) {
  // Hanya izinkan method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { subdomain, target } = req.body;

  if (!subdomain || !target) {
    return res.status(400).json({ error: 'Data tidak lengkap' });
  }

  const rootDomain = process.env.ROOT_DOMAIN;
  const apiKey = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;

  const data = {
    type: 'A', // Ganti CNAME jika targetnya domain
    name: `${subdomain}.${rootDomain}`,
    content: target,
    ttl: 1,
    proxied: true,
  };

  try {
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

    return res.status(200).json({ success: true, message: `Subdomain ${subdomain}.${rootDomain} berhasil!` });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
