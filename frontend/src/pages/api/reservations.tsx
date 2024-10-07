import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { date, bookstore } = req.query;

  if (!date || !bookstore) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }

  const apiUrl = `https://ee.taehyun35802.shop/reservation?bookstore=${encodeURIComponent(bookstore as string)}&date=${date}`;

  try {
    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: { "Content-Type": "application/json" },
    });

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({ error: 'Error fetching reservation data' });
    }

    const data = await apiResponse.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
