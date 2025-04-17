// File: pages/api/download-fir.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Document ID is required' });
    }
    
    const tempDir = path.join(process.cwd(), 'temp');
    const filePath = path.join(tempDir, id);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const stat = fs.statSync(filePath);
    
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=FIR_Document.docx`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    // Clean up the file after sending it
    fileStream.on('end', () => {
      setTimeout(() => {
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.error('Error deleting file:', error);
        }
      }, 5000); // 5-second delay to ensure file is fully transmitted
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Error processing request' });
  }
}