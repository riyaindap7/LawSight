import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { complaint } = req.body;

  if (!complaint) {
    return res.status(400).json({ message: 'Complaint is required' });
  }

  try {
    // Assuming your Python model is hosted on FastAPI or Flask at localhost:8000
    const response = await axios.post('http://localhost:8000/predict', { complaint });

    return res.status(200).json(response.data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ message: 'Error classifying complaint', error: errorMessage });
  }
}
