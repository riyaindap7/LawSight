// File: pages/api/analyze-complaint.js-last
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { complaint } = req.body;
    
    if (!complaint) {
      return res.status(400).json({ error: 'Complaint is required' });
    }
    
    // Create a temporary file to store the complaint
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    const complaintFile = path.join(tempDir, `complaint_${Date.now()}.txt`);
    fs.writeFileSync(complaintFile, complaint);
    
    // Run your Python script using the complaint file
    const scriptPath = path.join(process.cwd(), 'python', 'analyze_complaint.py');
    const { stdout, stderr } = await execPromise(`python ${scriptPath} ${complaintFile}`);
    
    if (stderr) {
      console.error('Python script error:', stderr);
      return res.status(500).json({ error: 'Error processing complaint' });
    }
    
    // Parse the output from the Python script
    const data = JSON.parse(stdout);
    
    // Clean up the temporary file
    fs.unlinkSync(complaintFile);
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Error processing request' });
  }
}

