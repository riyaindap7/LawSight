// For Pages Router (Next.js)
import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Execute the Python script
    const { stdout, stderr } = await execPromise('python scripts/speech_script.py');
    
    if (stderr) {
      console.error('stderr:', stderr);
      return res.status(500).json({ error: 'Speech recognition failed', details: stderr });
    }
    
    // The Python script should print the transcript to stdout
    return res.status(200).json({ transcript: stdout.trim() });
  } catch (error) {
    console.error('Error executing speech recognition:', error);
    return res.status(500).json({ error: 'Speech recognition failed', details: String(error) });
  }
}