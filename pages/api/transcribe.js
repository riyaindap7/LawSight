// pages/api/transcribe.js
import { google } from '@google-cloud/speech';
import formidable from 'formidable';
import fs from 'fs';
import { PassThrough } from 'stream';
import { exec } from 'child_process';
import { promisify } from 'util';

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Create a child process execution promise
const execPromise = promisify(exec);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form data
    const form = new formidable.IncomingForm();
    
    // Parse the form
    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });
    
    // Get audio file
    const audioFile = files.audio;
    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }
    
    console.log('Received audio file:', {
      name: audioFile.originalFilename,
      size: audioFile.size,
      type: audioFile.mimetype,
      path: audioFile.filepath
    });

    // Initialize Google Cloud Speech client
    const speechClient = new google.speech.v1.SpeechClient({
      // Make sure your Google Cloud credentials are properly set up
      // You can either set GOOGLE_APPLICATION_CREDENTIALS environment variable
      // or provide the path to your service account key file
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });

    // If the audio is webm, we need to convert it to LINEAR16 (wav)
    // We can use ffmpeg for this conversion
    const tempWavFile = `${audioFile.filepath}.wav`;
    
    await execPromise(`ffmpeg -i ${audioFile.filepath} -acodec pcm_s16le -ar 16000 -ac 1 ${tempWavFile}`);
    
    // Read the converted audio file
    const audioBytes = fs.readFileSync(tempWavFile);
    const audio = {
      content: audioBytes.toString('base64')
    };

    // Configure the request
    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-IN', // Change to match your application's language
    };

    const request = {
      audio: audio,
      config: config,
    };

    // Perform the speech recognition
    const [response] = await speechClient.recognize(request);
    
    // Extract the transcription
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    
    console.log('Transcription complete:', transcription);
    
    // Clean up temporary files
    try {
      fs.unlinkSync(tempWavFile);
    } catch (err) {
      console.error('Error cleaning up temporary files:', err);
    }
    
    // Return the transcription
    return res.status(200).json({ transcript: transcription });
    
  } catch (error) {
    console.error('Transcription error:', error);
    return res.status(500).json({ error: 'Transcription failed: ' + error.message });
  }
}