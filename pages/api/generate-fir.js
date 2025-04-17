// File: pages/api/generate-fir.js
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
    const { extractedData, additionalInfo } = req.body;
    
    if (!extractedData) {
      return res.status(400).json({ error: 'Extracted data is required' });
    }
    
    // Create a temporary file to store the data
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    const dataFile = path.join(tempDir, `fir_data_${Date.now()}.json`);
    fs.writeFileSync(dataFile, JSON.stringify({ extractedData, additionalInfo }));
    
    // Run your Python script to generate the FIR document
    const scriptPath = path.join(process.cwd(), 'python', 'generate_fir.py');
    const outputPath = path.join(tempDir, `FIR_${Date.now()}.docx`);
    const { stdout, stderr } = await execPromise(`python ${scriptPath} ${dataFile} ${outputPath}`);
    
    if (stderr) {
      console.error('Python script error:', stderr);
      return res.status(500).json({ error: 'Error generating FIR' });
    }
    
    // Parse the output from the Python script for the summary
    const summary = JSON.parse(stdout);
    
    // Store the document path temporarily for downloading
    const docId = path.basename(outputPath);
    
    // Clean up the temporary data file
    fs.unlinkSync(dataFile);
    
    return res.status(200).json({
      fir: {
        id: docId,
        ...summary
      }
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Error processing request' });
  }
}

