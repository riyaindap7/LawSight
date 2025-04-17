// File: pages/fir-generator.js
import React from 'react';
import Head from 'next/head';
import VoiceFIRSubmissionForm from '../components/voiceFIRSubmissionForm.js';

export default function FIRGeneratorPage() {
  return (
    <>
      <Head>
        <title>Voice FIR Generator | First Information Report Tool</title>
        <meta name="description" content="Generate professional First Information Reports (FIR) for theft incidents using voice commands" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <VoiceFIRSubmissionForm />
        </div>
      </main>
      
      <footer className="bg-white py-6 border-t">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>This tool is designed to help generate First Information Reports using voice interaction. Please ensure you're in a quiet environment for best results.</p>
          <p className="mt-2">© {new Date().getFullYear()} Voice FIR Generator Tool</p>
        </div>
      </footer>
    </>
  );
}