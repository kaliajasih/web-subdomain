// File: api/delete.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Terima zoneId dan zoneName dari body
  const { subdomain, zoneId, zoneName } = req.body;

  if (!subdomain || !zoneId || !zoneName) {
    return res.status(400).json({ error: 'Data tidak lengkap (Pilih domain terlebih dahulu)' });
  }

  const apiKey = process.env.CLOUDFLARE_API_TOKEN;
  const fullDomain = `${subdomain}.${zoneName}`;

  try {
    // 1. Cari ID Subdomain di Zone yang spesifik (zoneId)
    const searchRes = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${fullDomain}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    const searchResult = await searchRes.json();
    
    if (!searchResult.success || searchResult.result.length === 0) {
      return res.status(404).json({ error: 'Subdomain tidak ditemukan di Cloudflare.' });
    }

    const recordId = searchResult.result[0].id;

    // 2. Hapus berdasarkan ID record dan Zone ID
    const deleteRes = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    const deleteResult = await deleteRes.json();

    if (!deleteResult.success) {
      return res.status(500).json({ error: 'Gagal menghapus subdomain.' });
    }

    return res.status(200).json({ success: true, message: `Subdomain ${fullDomain} berhasil dihapus!` });

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
