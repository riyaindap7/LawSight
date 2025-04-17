
// // import React, { useState, useEffect, useRef } from 'react';
// // import { Mic, MicOff, Speaker, Volume2, Loader, Send, Check, AlertCircle } from 'lucide-react';

// // const VoiceFIRSubmissionForm = () => {
// //   // Main states
// //   const [stage, setStage] = useState('initial'); // initial, listening, questions, complete
// //   const [isListening, setIsListening] = useState(false);
// //   const [isSubmitting, setIsSubmitting] = useState(false);
// //   const [isSpeaking, setIsSpeaking] = useState(false);
// //   const [error, setError] = useState(null);
// //   const [hasSpokenWelcome, setHasSpokenWelcome] = useState(false);
// //   const [recordingComplete, setRecordingComplete] = useState(false);
// //   const [confirmingSubmission, setConfirmingSubmission] = useState(false);
  
// //   // Data states
// //   const [transcript, setTranscript] = useState('');
// //   const [completeTranscript, setCompleteTranscript] = useState('');
// //   const [extractedData, setExtractedData] = useState(null);
// //   const [questions, setQuestions] = useState([]);
// //   const [answers, setAnswers] = useState({});
// //   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
// //   const [generatedFIR, setGeneratedFIR] = useState(null);

// //   // Refs
// //   const recognitionRef = useRef(null);
// //   const speechSynthesisRef = useRef(null);
// //   const isMountedRef = useRef(true);
// //   const welcomeTimeoutRef = useRef(null);
// //   const isRecognitionActiveRef = useRef(false);
// //   const silenceTimerRef = useRef(null);
// //   const lastSpeechTimestampRef = useRef(0);

// //   // Initialize browser-only APIs safely
// //   useEffect(() => {
// //     // This only runs in the browser, not during server-side rendering
// //     if (typeof window !== 'undefined') {
// //       // Initialize speech synthesis
// //       speechSynthesisRef.current = window.speechSynthesis;
// //     }
    
// //     return () => {
// //       isMountedRef.current = false;
// //       if (welcomeTimeoutRef.current) {
// //         clearTimeout(welcomeTimeoutRef.current);
// //       }
// //       if (silenceTimerRef.current) {
// //         clearInterval(silenceTimerRef.current);
// //       }
// //       if (typeof window !== 'undefined' && speechSynthesisRef.current) {
// //         speechSynthesisRef.current.cancel();
// //       }
// //     };
// //   }, []);

// //   // Set up speech recognition separately
// //   useEffect(() => {
// //     if (typeof window !== 'undefined' && !recognitionRef.current) {
// //       if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
// //         const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
// //         recognitionRef.current = new SpeechRecognition();
// //         recognitionRef.current.continuous = true;
// //         recognitionRef.current.interimResults = true;
// //         recognitionRef.current.lang = 'en-IN'; // Set to Indian English
        
// //         recognitionRef.current.onresult = (event) => {
// //             const current = event.resultIndex;
// //             const result = event.results[current];
// //             const transcriptValue = result[0].transcript;
// //             const confidence = result[0].confidence;
            
// //             // Only accept results with good confidence
// //             if (confidence > 0.6) {
// //               lastSpeechTimestampRef.current = Date.now();
              
// //               if (result.isFinal) {
// //                 setTranscript(prev => prev + ' ' + transcriptValue);
// //               }
// //             }
// //           };
        
// //         recognitionRef.current.onerror = (event) => {
// //           console.error('Speech recognition error', event.error);
          
// //           if (event.error === 'no-speech') {
// //             setError("I didn't hear anything. Please speak again and make sure your microphone is working.");
// //           } else if (event.error === 'aborted') {
// //             console.log('Recognition aborted');
// //             // Don't show error for aborted as it's usually from manual stopping
// //             setError(null);
// //           } else {
// //             setError(`Microphone error: ${event.error}. Please try again.`);
// //             setIsListening(false);
// //             isRecognitionActiveRef.current = false;
// //           }
// //         };
        
// //         recognitionRef.current.onend = () => {
// //           console.log('Recognition ended');
// //           isRecognitionActiveRef.current = false;
          
// //           // Only restart if we're still supposed to be listening
// //           if (isMountedRef.current && isListening) {
// //             try {
// //               setTimeout(() => {
// //                 if (isListening && recognitionRef.current && !isRecognitionActiveRef.current) {
// //                   recognitionRef.current.start();
// //                   isRecognitionActiveRef.current = true;
// //                   console.log('Restarted recognition');
// //                 }
// //               }, 300);
// //             } catch (e) {
// //               console.log('Recognition restart failed', e);
// //               setIsListening(false);
// //             }
// //           } else if (isMountedRef.current && !isListening && stage === 'initial') {
// //             // If we've stopped listening and have transcript, update the complete transcript
// //             // and show a notification that recording is complete
// //             if (transcript.trim()) {
// //               setCompleteTranscript(transcript);
// //               setRecordingComplete(true);
              
// //               // Auto ask for confirmation after speech is complete
// //               if (!confirmingSubmission) {
// //                 setConfirmingSubmission(true);
// //                 setTimeout(() => {
// //                   speakText("I've recorded your complaint. Would you like to submit it now? Say yes to proceed or no to record again.");
// //                 }, 500);
// //               }
// //             }
// //           }
// //         };
// //       } else {
// //         setError('Speech recognition is not supported in your browser. Please use Chrome.');
// //       }
// //     }
// //   }, [isListening, stage, transcript, confirmingSubmission]);
  
// //   // Silence detection to automatically stop the microphone after silence
// //   useEffect(() => {
// //     if (isListening) {
// //       // Start the silence detection timer
// //       lastSpeechTimestampRef.current = Date.now();
// //       silenceTimerRef.current = setInterval(() => {
// //         const silenceTime = Date.now() - lastSpeechTimestampRef.current;
// //         // If silence for more than 2.5 seconds, stop listening
// //         if (silenceTime > 2500) {
// //           console.log('Silence detected for 2.5 seconds, stopping microphone');
// //           stopListening();
// //           // Clear the silence timer
// //           if (silenceTimerRef.current) {
// //             clearInterval(silenceTimerRef.current);
// //             silenceTimerRef.current = null;
// //           }
// //         }
// //       }, 500);
// //     } else {
// //       // Clear the silence timer if we're not listening
// //       if (silenceTimerRef.current) {
// //         clearInterval(silenceTimerRef.current);
// //         silenceTimerRef.current = null;
// //       }
// //     }

// //     return () => {
// //       if (silenceTimerRef.current) {
// //         clearInterval(silenceTimerRef.current);
// //       }
// //     };
// //   }, [isListening]);
  
// //   // Listen for "yes" or "no" confirmation
// //   useEffect(() => {
// //     if (confirmingSubmission && isListening && transcript) {
// //       const lowercaseTranscript = transcript.toLowerCase();
      
// //       if (lowercaseTranscript.includes('yes') || lowercaseTranscript.includes('yeah') || 
// //           lowercaseTranscript.includes('correct') || lowercaseTranscript.includes('submit')) {
// //         // User confirmed, submit the complaint
// //         setConfirmingSubmission(false);
// //         setIsListening(false);
// //         setTimeout(() => {
// //           handleSubmitComplaint();
// //         }, 300);
// //       } else if (lowercaseTranscript.includes('no') || lowercaseTranscript.includes('nope') || 
// //                 lowercaseTranscript.includes('repeat') || lowercaseTranscript.includes('again')) {
// //         // User wants to record again
// //         setConfirmingSubmission(false);
// //         setTranscript('');
// //         setCompleteTranscript('');
// //         setRecordingComplete(false);
// //         setIsListening(false);
// //         setTimeout(() => {
// //           speakText("Let's try again. Please describe the incident when you're ready.");
// //         }, 300);
// //       }
// //     }
// //   }, [transcript, confirmingSubmission, isListening]);

// //   // Clean up recognition when unmounting
// //   useEffect(() => {
// //     return () => {
// //       if (recognitionRef.current) {
// //         try {
// //           recognitionRef.current.stop();
// //           isRecognitionActiveRef.current = false;
// //         } catch (e) {
// //           console.log('Error stopping recognition', e);
// //         }
// //       }
// //     };
// //   }, []);

// //   // Handle changes to isListening state
// //   useEffect(() => {
// //     if (isListening) {
// //       if (recognitionRef.current && !isRecognitionActiveRef.current) {
// //         try {
// //           recognitionRef.current.start();
// //           isRecognitionActiveRef.current = true;
// //           console.log('Started listening');
          
// //           // Reset the recordingComplete flag when starting to listen again
// //           setRecordingComplete(false);
// //         } catch (e) {
// //           console.log('Error starting recognition:', e);
// //           setError(`Failed to start microphone: ${e.message}. Please try again.`);
// //           setIsListening(false);
// //         }
// //       }
// //     } else {
// //       if (recognitionRef.current && isRecognitionActiveRef.current) {
// //         try {
// //           recognitionRef.current.stop();
// //           isRecognitionActiveRef.current = false;
// //           console.log('Stopped listening');
          
// //           // If we have transcript, show the recording complete notification
// //           if (transcript.trim() && stage === 'initial' && !confirmingSubmission) {
// //             setCompleteTranscript(transcript);
// //             setRecordingComplete(true);
            
// //             // Auto ask for confirmation after stopping recording
// //             setConfirmingSubmission(true);
// //             setTimeout(() => {
// //               speakText("I've recorded your complaint. Would you like to submit it now? Say yes to proceed or no to record again.");
// //             }, 500);
// //           }
// //         } catch (e) {
// //           console.log('Error stopping recognition:', e);
// //         }
// //       }
// //     }
// //   }, [isListening, transcript, stage, confirmingSubmission]);

// //   // Speak text function
// //   const speakText = (text) => {
// //     if (typeof window !== 'undefined' && speechSynthesisRef.current) {
// //       // Cancel any ongoing speech
// //       speechSynthesisRef.current.cancel();
      
// //       const utterance = new SpeechSynthesisUtterance(text);
// //       utterance.lang = 'en-IN';
// //       utterance.rate = 0.9; // Slightly slower than default
      
// //       utterance.onstart = () => setIsSpeaking(true);
// //       utterance.onend = () => {
// //         setIsSpeaking(false);
        
// //         // If confirming submission, start listening for yes/no
// //         if (confirmingSubmission && !isListening) {
// //           setTimeout(() => {
// //             startListening();
// //           }, 300);
// //         }
// //         // If in question stage, start listening after speaking the question
// //         else if (stage === 'questions' && !isListening) {
// //           setTimeout(() => {
// //             startListening();
// //           }, 300);
// //         }
// //       };
      
// //       speechSynthesisRef.current.speak(utterance);
// //     }
// //   };

// //   // Toggle listening
// //   const toggleListening = () => {
// //     if (isListening) {
// //       stopListening();
// //     } else {
// //       startListening();
// //     }
// //   };

// //   // Start listening
// //   const startListening = () => {
// //     setError(null);
// //     setIsListening(true);
// //     // Don't clear transcript if we're confirming submission
// //     if (!confirmingSubmission) {
// //       setTranscript('');
// //     }
// //   };

// //   // Stop listening
// //   const stopListening = () => {
// //     setIsListening(false);
// //   };

// //   // Submit the complaint
// //   const handleSubmitComplaint = async () => {
// //     const textToSubmit = completeTranscript.trim();
// //     if (!textToSubmit) return;
    
// //     setIsSubmitting(true);
// //     setError(null);
// //     stopListening();
// //     setRecordingComplete(false);
// //     setConfirmingSubmission(false);
    
// //     try {
// //       // This would connect to your Python backend
// //       const response = await fetch('/api/analyze-complaint', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ complaint: textToSubmit })
// //       });
      
// //       const data = await response.json();
      
// //       if (!response.ok) throw new Error(data.error || 'Failed to process complaint');
      
// //       // Process the extracted data
// //       setExtractedData(data.extractedData);
      
// //       // Filter out duplicate questions about name and contact details
// //       // Create a set to track fields we've already added
// //       const fieldsAdded = new Set();
// //       const filteredQuestions = data.questions.filter(q => {
// //      // For any field (not just name/contact)
// //       if (fieldsAdded.has(q.field)) {
// //         return false;
// //   }
// //   fieldsAdded.add(q.field);
// //   return true;
// // });
      
// //       setQuestions(filteredQuestions);
// //       setStage('questions');
      
// //       // Clear transcript for questions
// //       setTranscript('');
      
// //       // Speak the first question
// //       setTimeout(() => {
// //         const introText = `Thank you for your complaint. I've identified this as a ${data.extractedData.type_of_theft} incident. I need some additional information. ${filteredQuestions[0].question}`;
// //         speakText(introText);
// //       }, 500);
      
// //     } catch (err) {
// //       setError(err.message);
// //       speakText(`Sorry, there was an error: ${err.message}`);
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   // Complete the current question and move to next
// //   const handleCompleteQuestion = () => {
// //     const currentQuestion = questions[currentQuestionIndex];
// //     const answer = transcript.trim();
    
// //     if (!answer) {
// //       speakText("I didn't catch that. Could you please repeat your answer?");
// //       return;
// //     }
    
// //     // Save the answer
// //     setAnswers(prev => ({ ...prev, [currentQuestion.field]: answer }));
// //     setTranscript('');
    
// //     // Check if we have more questions
// //     if (currentQuestionIndex < questions.length - 1) {
// //       setCurrentQuestionIndex(currentQuestionIndex + 1);
      
// //       // Speak the next question after a short delay
// //       setTimeout(() => {
// //         speakText(questions[currentQuestionIndex + 1].question);
// //       }, 500);
// //     } else {
// //       // All questions answered, generate FIR
// //       handleSubmitAllAnswers();
// //     }
// //   };

// //   // Submit all answers and generate FIR
// //   const handleSubmitAllAnswers = async () => {
// //     setIsSubmitting(true);
// //     setError(null);
    
// //     try {
// //       // Ensure complainant name is set properly
// //       const combinedData = {
// //         ...extractedData,
// //         ...answers
// //       };
      
// //       // Connect to your Python backend
// //       const response = await fetch('/api/generate-fir', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ 
// //           extractedData: combinedData,
// //           additionalInfo: answers
// //         })
// //       });
      
// //       const data = await response.json();
      
// //       if (!response.ok) throw new Error(data.error || 'Failed to generate FIR');
      
// //       // Make sure the complainant name is set in the FIR
// //       const enhancedFIR = {
// //         ...data.fir,
// //         // If complainant_name is not set or is "not identified", use the value from answers
// //         complainant_name: data.fir.complainant_name === "not identified" || !data.fir.complainant_name 
// //           ? answers.complainant_name || "Unknown" 
// //           : data.fir.complainant_name
// //       };
      
// //       setGeneratedFIR(enhancedFIR);
// //       setStage('complete');
      
// //       // Speak the completion message
// //       setTimeout(() => {
// //         speakText("Thank you for providing all the information. I've successfully generated your First Information Report. You can now download the document.");
// //       }, 500);
      
// //     } catch (err) {
// //       setError(err.message);
// //       speakText(`Sorry, there was an error: ${err.message}`);
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   // Start over with a new complaint
// //   const handleStartOver = () => {
// //     setStage('initial');
// //     setCompleteTranscript('');
// //     setTranscript('');
// //     setExtractedData(null);
// //     setQuestions([]);
// //     setAnswers({});
// //     setCurrentQuestionIndex(0);
// //     setGeneratedFIR(null);
// //     setError(null);
// //     setHasSpokenWelcome(false);
// //     setRecordingComplete(false);
// //     setConfirmingSubmission(false);
    
// //     // Speak the welcome message
// //     speakText("Welcome to the FIR voice assistant. Please describe the incident that occurred.");
// //   };

// //   // Download the generated FIR
// //   const handleDownloadFIR = () => {
// //     if (typeof window !== 'undefined' && generatedFIR && generatedFIR.id) {
// //       // Create a direct link instead of redirect
// //       const link = document.createElement('a');
// //       link.href = `/api/download-fir?id=${generatedFIR.id}`;
// //       link.setAttribute('download', `FIR_${generatedFIR.id}.docx`);
// //       document.body.appendChild(link);
// //       link.click();
// //       document.body.removeChild(link);
// //     } else {
// //       setError("Could not download the FIR. Missing document ID.");
// //     }
// //   };

// //   // Speak welcome message on first load (client-side only)
// //   useEffect(() => {
// //     if (typeof window !== 'undefined' && stage === 'initial' && !hasSpokenWelcome && !isSpeaking) {
// //       welcomeTimeoutRef.current = setTimeout(() => {
// //         speakText("Welcome to the FIR voice assistant. Please describe the incident that occurred.");
// //         setHasSpokenWelcome(true);
// //       }, 1000);
      
// //       return () => {
// //         if (welcomeTimeoutRef.current) {
// //           clearTimeout(welcomeTimeoutRef.current);
// //         }
// //       };
// //     }
// //   }, [stage, isSpeaking, hasSpokenWelcome]);

// //   return (
// //     <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
// //       {/* Header section */}
// //       <div className="space-y-2 mb-6">
// //         <h1 className="text-2xl font-bold text-gray-900">FIR Voice Assistant</h1>
// //         <p className="text-gray-600">
// //           {stage === 'initial' ? 
// //             "Please describe the incident in detail. Click the microphone icon to start or stop recording." : 
// //             stage === 'questions' ? 
// //             `Question ${currentQuestionIndex + 1} of ${questions.length}` : 
// //             "FIR Generated Successfully"}
// //         </p>
// //       </div>
      
// //       {/* Error message if any */}
// //       {error && (
// //         <div className="flex items-center p-3 mb-4 text-red-700 bg-red-100 rounded-md">
// //           <AlertCircle size={18} className="mr-2" />
// //           <span>{error}</span>
// //         </div>
// //       )}

// //       {/* Recording complete notification */}
// //       {recordingComplete && stage === 'initial' && !confirmingSubmission && (
// //         <div className="flex items-center p-3 mb-4 text-green-700 bg-green-100 rounded-md">
// //           <Check size={18} className="mr-2" />
// //           <span>Recording complete! Please review your complaint and click Submit to continue.</span>
// //         </div>
// //       )}
      
// //       {/* Confirmation message */}
// //       {confirmingSubmission && stage === 'initial' && (
// //         <div className="flex items-center p-3 mb-4 text-blue-700 bg-blue-100 rounded-md">
// //           <Volume2 size={18} className="mr-2" />
// //           <span>Please say "Yes" to submit or "No" to record again.</span>
// //         </div>
// //       )}
      
// //       {/* Initial complaint stage */}
// //       {stage === 'initial' && (
// //         <div className="space-y-6">
// //           <div className="relative p-4 border border-gray-200 rounded-lg bg-gray-50 min-h-48">
// //             <div className="mb-2 flex items-center justify-between">
// //               <span className="text-sm font-medium text-gray-500">Your complaint:</span>
// //               {isSpeaking && (
// //                 <div className="flex items-center space-x-1">
// //                   <Volume2 size={16} className="text-blue-500" />
// //                   <span className="text-xs text-blue-500">Speaking...</span>
// //                 </div>
// //               )}
// //             </div>
            
// //             <div className="min-h-40 rounded-md p-3 bg-white border border-gray-100">
// //               {transcript || completeTranscript || 
// //               <span className="text-gray-400 italic">Your speech will appear here...</span>}
// //             </div>
            
// //             <div className="absolute bottom-4 right-4 flex space-x-3">
// //               <button
// //                 onClick={toggleListening}
// //                 className={`p-3 rounded-full ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
// //                 disabled={isSpeaking || isSubmitting}
// //                 aria-label={isListening ? "Stop recording" : "Start recording"}
// //               >
// //                 {isListening ? <MicOff size={24} /> : <Mic size={24} />}
// //               </button>
// //             </div>
// //           </div>
          
// //           <div className="flex justify-between">
// //             <button
// //               onClick={() => {
// //                 setHasSpokenWelcome(true); // Prevent welcome from repeating
// //                 speakText("Welcome to the FIR voice assistant. Please describe the incident that occurred.");
// //               }}
// //               className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
// //               disabled={isSpeaking || isSubmitting}
// //             >
// //               <Speaker size={18} className="mr-2" />
// //               Repeat Instructions
// //             </button>
            
// //             <button
// //               onClick={handleSubmitComplaint}
// //               disabled={!completeTranscript.trim() || isSubmitting || isSpeaking || isListening}
// //               className={`flex items-center px-4 py-2 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed ${(completeTranscript.trim() && !isSubmitting && !isSpeaking && !isListening) ? 'bg-blue-600 hover:bg-blue-700 animate-pulse' : 'bg-blue-600'}`}
// //             >
// //               {isSubmitting ? (
// //                 <>
// //                   <Loader size={18} className="mr-2 animate-spin" />
// //                   Processing...
// //                 </>
// //               ) : (
// //                 <>
// //                   <Send size={18} className="mr-2" />
// //                   Submit
// //                 </>
// //               )}
// //             </button>
// //           </div>

// //           {/* Instructions */}
// //           <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700 border border-blue-100">
// //             <p><strong>How to use:</strong></p>
// //             <ol className="list-decimal pl-5 space-y-1">
// //               <li>Click the microphone icon to start recording</li>
// //               <li>Describe the incident in detail</li>
// //               <li>The microphone will automatically turn off when you stop speaking</li>
// //               <li>You will be asked to confirm submission - say "Yes" to submit or "No" to record again</li>
// //             </ol>
// //           </div>
// //         </div>
// //       )}
      
// //       {/* Questions stage */}
// //       {stage === 'questions' && questions.length > 0 && (
// //         <div className="space-y-6">
// //           <div className="p-4 bg-gray-50 rounded-md mb-4">
// //             <h3 className="font-medium text-gray-700">Incident type identified: {extractedData.type_of_theft}</h3>
// //             {extractedData.applicable_sections && (
// //               <p className="text-sm text-gray-600">Applicable sections: {extractedData.applicable_sections}</p>
// //             )}
// //           </div>
          
// //           <div className="relative p-4 border border-gray-200 rounded-lg bg-white">
// //             <div className="mb-3 flex items-center justify-between">
// //               <h3 className="text-lg font-medium">
// //                 {questions[currentQuestionIndex].question}
// //               </h3>
// //               {isSpeaking && (
// //                 <div className="flex items-center space-x-1">
// //                   <Volume2 size={16} className="text-blue-500" />
// //                   <span className="text-xs text-blue-500">Speaking...</span>
// //                 </div>
// //               )}
// //             </div>
            
// //             <div className="min-h-24 p-3 rounded-md bg-gray-50 border border-gray-100 mb-4">
// //               {transcript || <span className="text-gray-400 italic">Your answer will appear here...</span>}
// //             </div>
            
// //             <div className="flex justify-between items-center">
// //               <button
// //                 onClick={() => speakText(questions[currentQuestionIndex].question)}
// //                 className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
// //                 disabled={isSpeaking || isSubmitting}
// //               >
// //                 <Speaker size={16} className="mr-2" />
// //                 Repeat Question
// //               </button>
              
// //               <div className="flex space-x-3">
// //                 <button
// //                   onClick={toggleListening}
// //                   className={`p-2 rounded-full ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
// //                   disabled={isSpeaking || isSubmitting}
// //                   aria-label={isListening ? "Stop recording" : "Start recording"}
// //                 >
// //                   {isListening ? <MicOff size={20} /> : <Mic size={20} />}
// //                 </button>
                
// //                 <button
// //                   onClick={handleCompleteQuestion}
// //                   disabled={!transcript.trim() || isSubmitting || isSpeaking || isListening}
// //                   className={`flex items-center px-4 py-2 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed ${(transcript.trim() && !isSubmitting && !isSpeaking && !isListening) ? 'bg-blue-600 hover:bg-blue-700 animate-pulse' : 'bg-blue-600'}`}
// //                 >
// //                   {isSubmitting ? (
// //                     <>
// //                       <Loader size={18} className="mr-2 animate-spin" />
// //                       Processing...
// //                     </>
// //                   ) : (
// //                     "Next"
// //                   )}
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
          
// //           <div className="flex items-center justify-between pt-4 border-t border-gray-200">
// //             <div className="flex flex-col">
// //               <span className="text-sm text-gray-500">Progress</span>
// //               <div className="w-64 h-2 mt-1 bg-gray-200 rounded-full overflow-hidden">
// //                 <div 
// //                   className="h-full bg-blue-600 rounded-full" 
// //                   style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
// //                 />
// //               </div>
// //             </div>
// //             <span className="text-sm text-gray-500">
// //               {currentQuestionIndex + 1} of {questions.length} questions
// //             </span>
// //           </div>
// //         </div>
// //       )}
      
// //       {/* Completion stage */}
// //       {stage === 'complete' && generatedFIR && (
// //         <div className="space-y-6">
// //           <div className="space-y-2 text-center">
// //             <div className="flex justify-center">
// //               <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
// //                 <Check size={24} className="text-green-600" />
// //               </div>
// //             </div>
// //             <h1 className="text-2xl font-bold text-gray-900">FIR Generated Successfully</h1>
// //             <p className="text-gray-600">
// //               Your First Information Report has been generated and is ready for download.
// //             </p>
// //             {isSpeaking && (
// //               <div className="flex items-center justify-center space-x-1 mt-2">
// //                 <Volume2 size={16} className="text-blue-500" />
// //                 <span className="text-xs text-blue-500">Speaking...</span>
// //               </div>
// //             )}
// //           </div>
          
// //           <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
// //             <h3 className="font-medium text-gray-900 mb-4">FIR Summary</h3>
// //             <dl className="space-y-3">
// //               <div className="grid grid-cols-3 gap-4">
// //                 <dt className="text-sm font-medium text-gray-500">Complainant</dt>
// //                 <dd className="text-sm text-gray-900 col-span-2">{generatedFIR.complainant_name}</dd>
// //               </div>
// //               <div className="grid grid-cols-3 gap-4">
// //                 <dt className="text-sm font-medium text-gray-500">Incident Type</dt>
// //                 <dd className="text-sm text-gray-900 col-span-2">{generatedFIR.type_of_theft}</dd>
// //               </div>
// //               <div className="grid grid-cols-3 gap-4">
// //                 <dt className="text-sm font-medium text-gray-500">Date/Time</dt>
// //                 <dd className="text-sm text-gray-900 col-span-2">{generatedFIR.date_time}</dd>
// //               </div>
// //               <div className="grid grid-cols-3 gap-4">
// //                 <dt className="text-sm font-medium text-gray-500">Location</dt>
// //                 <dd className="text-sm text-gray-900 col-span-2">{generatedFIR.location}</dd>
// //               </div>
// //               <div className="grid grid-cols-3 gap-4">
// //                 <dt className="text-sm font-medium text-gray-500">Applicable Sections</dt>
// //                 <dd className="text-sm text-gray-900 col-span-2">{generatedFIR.applicable_sections}</dd>
// //               </div>
// //             </dl>
// //           </div>
          
// //           <div className="flex flex-col space-y-3">
// //             <button
// //               onClick={handleDownloadFIR}
// //               className="flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
// //             >
// //               Download FIR Document (.docx)
// //             </button>
            
// //             <button
// //               onClick={handleStartOver}
// //               className="flex items-center justify-center py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
// //             >
// //               Submit Another Complaint
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default VoiceFIRSubmissionForm;

// import React, { useState, useEffect, useRef } from 'react';
// import { Mic, MicOff, Speaker, Volume2, Loader, Send, Check, AlertCircle, Activity } from 'lucide-react';

// const VoiceFIRSubmissionForm = () => {
//   // Main states
//   const [stage, setStage] = useState('initial'); // initial, listening, questions, complete
//   const [isListening, setIsListening] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [error, setError] = useState(null);
//   const [hasSpokenWelcome, setHasSpokenWelcome] = useState(false);
//   const [recordingComplete, setRecordingComplete] = useState(false);
//   const [confirmingSubmission, setConfirmingSubmission] = useState(false);
  
//   // New states for improved reliability
//   const [isRecognitionInitialized, setIsRecognitionInitialized] = useState(false);
//   const [speechDetected, setSpeechDetected] = useState(false);
//   const [silenceThreshold, setSilenceThreshold] = useState(4000); // 4 seconds, increased from 2.5s
//   const [isWarmingUp, setIsWarmingUp] = useState(false);
  
//   // Data states
//   const [transcript, setTranscript] = useState('');
//   const [completeTranscript, setCompleteTranscript] = useState('');
//   const [extractedData, setExtractedData] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [answers, setAnswers] = useState({});
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [generatedFIR, setGeneratedFIR] = useState(null);

//   // Refs
//   const recognitionRef = useRef(null);
//   const speechSynthesisRef = useRef(null);
//   const isMountedRef = useRef(true);
//   const welcomeTimeoutRef = useRef(null);
//   const isRecognitionActiveRef = useRef(false);
//   const silenceTimerRef = useRef(null);
//   const lastSpeechTimestampRef = useRef(0);
//   const recognitionRestartTimerRef = useRef(null);
//   const initAttemptCountRef = useRef(0);

//   // Logging function for debugging (you can remove in production)
//   const logDebug = (message) => {
//     console.log(`[VoiceFIR Debug] ${message}`);
//   };

//   // Initialize browser-only APIs safely
//   useEffect(() => {
//     // This only runs in the browser, not during server-side rendering
//     if (typeof window !== 'undefined') {
//       // Initialize speech synthesis
//       speechSynthesisRef.current = window.speechSynthesis;
      
//       // Initialize recognition with retry logic
//       initializeSpeechRecognition();
//     }
    
//     return () => {
//       isMountedRef.current = false;
//       if (welcomeTimeoutRef.current) {
//         clearTimeout(welcomeTimeoutRef.current);
//       }
//       if (silenceTimerRef.current) {
//         clearInterval(silenceTimerRef.current);
//       }
//       if (recognitionRestartTimerRef.current) {
//         clearTimeout(recognitionRestartTimerRef.current);
//       }
//       if (typeof window !== 'undefined' && speechSynthesisRef.current) {
//         speechSynthesisRef.current.cancel();
//       }
//     };
//   }, []);

//   // Initialize speech recognition with retry logic
//   const initializeSpeechRecognition = () => {
//     if (typeof window !== 'undefined' && !recognitionRef.current) {
//       initAttemptCountRef.current++;
//       logDebug(`Initializing speech recognition (attempt ${initAttemptCountRef.current})`);
      
//       if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
//         try {
//           const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
//           recognitionRef.current = new SpeechRecognition();
//           recognitionRef.current.continuous = true;
//           recognitionRef.current.interimResults = true;
//           recognitionRef.current.lang = 'en-IN'; // Set to Indian English
          
//           recognitionRef.current.onresult = handleRecognitionResult;
//           recognitionRef.current.onerror = handleRecognitionError;
//           recognitionRef.current.onend = handleRecognitionEnd;
//           recognitionRef.current.onstart = handleRecognitionStart;
          
//           setIsRecognitionInitialized(true);
//           logDebug("Speech recognition initialized successfully");
//         } catch (e) {
//           logDebug(`Error initializing recognition: ${e.message}`);
//           setError(`Could not initialize speech recognition: ${e.message}`);
          
//           // Retry initialization after a delay (but not too many times)
//           if (initAttemptCountRef.current < 3) {
//             setTimeout(initializeSpeechRecognition, 1000);
//           }
//         }
//       } else {
//         setError('Speech recognition is not supported in your browser. Please use Chrome.');
//       }
//     }
//   };
  
//   // Handle recognition result
//   const handleRecognitionResult = (event) => {
//     const current = event.resultIndex;
//     const result = event.results[current];
//     const transcriptValue = result[0].transcript;
//     const confidence = result[0].confidence;
    
//     // Only accept results with good confidence
//     if (confidence > 0.6) {
//       // Update the last speech timestamp
//       lastSpeechTimestampRef.current = Date.now();
      
//       // Show speech detected indicator
//       setSpeechDetected(true);
      
//       if (result.isFinal) {
//         setTranscript(prev => prev + ' ' + transcriptValue);
//       }
//     }
//   };
  
//   // Handle recognition error
//   const handleRecognitionError = (event) => {
//     logDebug(`Speech recognition error: ${event.error}`);
    
//     if (event.error === 'no-speech') {
//       // Don't show error immediately for no-speech, this is handled by silence detection
//       logDebug("No speech detected");
//     } else if (event.error === 'aborted') {
//       logDebug('Recognition aborted');
//       // Don't show error for aborted as it's usually from manual stopping
//       setError(null);
//     } else if (event.error === 'audio-capture') {
//       setError("I can't access your microphone. Please check your microphone permissions.");
//       setIsListening(false);
//       isRecognitionActiveRef.current = false;
//     } else if (event.error === 'network') {
//       setError("There was a network error. Please check your internet connection.");
//       setIsListening(false);
//       isRecognitionActiveRef.current = false;
//     } else {
//       setError(`Microphone error: ${event.error}. Please try again.`);
//       setIsListening(false);
//       isRecognitionActiveRef.current = false;
//     }
//   };
  
//   // Handle recognition start
//   const handleRecognitionStart = () => {
//     logDebug('Recognition started');
//     isRecognitionActiveRef.current = true;
    
//     // Set warming up state for a short period (helpful for first runs)
//     setIsWarmingUp(true);
//     setTimeout(() => {
//       if (isMountedRef.current) {
//         setIsWarmingUp(false);
//       }
//     }, 1500);
//   };
  
//   // Handle recognition end
//   const handleRecognitionEnd = () => {
//     logDebug('Recognition ended');
//     isRecognitionActiveRef.current = false;
    
//     // Clear any pending restart timers
//     if (recognitionRestartTimerRef.current) {
//       clearTimeout(recognitionRestartTimerRef.current);
//       recognitionRestartTimerRef.current = null;
//     }
    
//     // Only restart if we're still supposed to be listening
//     if (isMountedRef.current && isListening) {
//       // Use a longer delay before restarting (500ms instead of 300ms)
//       recognitionRestartTimerRef.current = setTimeout(() => {
//         if (isListening && recognitionRef.current && !isRecognitionActiveRef.current) {
//           try {
//             logDebug('Restarting recognition');
//             recognitionRef.current.start();
//             // Note: The onstart handler will set isRecognitionActiveRef to true
//           } catch (e) {
//             logDebug(`Recognition restart failed: ${e.message}`);
//             setIsListening(false);
            
//             // Try one more restart after a longer delay
//             setTimeout(() => {
//               if (isMountedRef.current && isListening) {
//                 try {
//                   recognitionRef.current.start();
//                 } catch (innerE) {
//                   setError("Could not restart speech recognition. Please refresh the page.");
//                   setIsListening(false);
//                 }
//               }
//             }, a000);
//           }
//         }
//       }, 500);
//     } else if (isMountedRef.current && !isListening && stage === 'initial') {
//       // If we've stopped listening and have transcript, update the complete transcript
//       // and show a notification that recording is complete
//       if (transcript.trim()) {
//         setCompleteTranscript(transcript);
//         setRecordingComplete(true);
        
//         // Auto ask for confirmation after speech is complete
//         if (!confirmingSubmission) {
//           setConfirmingSubmission(true);
//           setTimeout(() => {
//             speakText("I've recorded your complaint. Would you like to submit it now? Say yes to proceed or no to record again.");
//           }, 500);
//         }
//       }
//     }
    
//     // Reset speech detected indicator
//     setSpeechDetected(false);
//   };

//   // Silence detection to automatically stop the microphone after silence
//   useEffect(() => {
//     if (isListening) {
//       // Start the silence detection timer
//       lastSpeechTimestampRef.current = Date.now();
//       logDebug(`Silence detection started with threshold of ${silenceThreshold}ms`);
      
//       silenceTimerRef.current = setInterval(() => {
//         const silenceTime = Date.now() - lastSpeechTimestampRef.current;
        
//         // If silence for more than the threshold, stop listening
//         if (silenceTime > silenceThreshold) {
//           logDebug(`Silence detected for ${silenceThreshold}ms, stopping microphone`);
//           stopListening();
//           // Clear the silence timer
//           if (silenceTimerRef.current) {
//             clearInterval(silenceTimerRef.current);
//             silenceTimerRef.current = null;
//           }
//         }
//       }, 500);
//     } else {
//       // Clear the silence timer if we're not listening
//       if (silenceTimerRef.current) {
//         clearInterval(silenceTimerRef.current);
//         silenceTimerRef.current = null;
//       }
//     }

//     return () => {
//       if (silenceTimerRef.current) {
//         clearInterval(silenceTimerRef.current);
//       }
//     };
//   }, [isListening, silenceThreshold]);
  
//   // Listen for "yes" or "no" confirmation
//   useEffect(() => {
//     if (confirmingSubmission && isListening && transcript) {
//       const lowercaseTranscript = transcript.toLowerCase();
      
//       if (lowercaseTranscript.includes('yes') || lowercaseTranscript.includes('yeah') || 
//           lowercaseTranscript.includes('correct') || lowercaseTranscript.includes('submit')) {
//         // User confirmed, submit the complaint
//         setConfirmingSubmission(false);
//         setIsListening(false);
//         setTimeout(() => {
//           handleSubmitComplaint();
//         }, 300);
//       } else if (lowercaseTranscript.includes('no') || lowercaseTranscript.includes('nope') || 
//                 lowercaseTranscript.includes('repeat') || lowercaseTranscript.includes('again')) {
//         // User wants to record again
//         setConfirmingSubmission(false);
//         setTranscript('');
//         setCompleteTranscript('');
//         setRecordingComplete(false);
//         setIsListening(false);
//         setTimeout(() => {
//           speakText("Let's try again. Please describe the incident when you're ready.");
//         }, 300);
//       }
//     }
//   }, [transcript, confirmingSubmission, isListening]);

//   // Clean up recognition when unmounting
//   useEffect(() => {
//     return () => {
//       if (recognitionRef.current && isRecognitionActiveRef.current) {
//         try {
//           recognitionRef.current.stop();
//           isRecognitionActiveRef.current = false;
//         } catch (e) {
//           logDebug(`Error stopping recognition during cleanup: ${e.message}`);
//         }
//       }
//     };
//   }, []);

//   // Handle changes to isListening state
//   useEffect(() => {
//     if (isListening) {
//       if (recognitionRef.current && !isRecognitionActiveRef.current) {
//         try {
//           recognitionRef.current.start();
//           // Note: isRecognitionActiveRef will be set to true in the onstart handler
//           logDebug('Started listening');
          
//           // Reset the recordingComplete flag when starting to listen again
//           setRecordingComplete(false);
//         } catch (e) {
//           logDebug(`Error starting recognition: ${e.message}`);
//           setError(`Failed to start microphone: ${e.message}. Please try again.`);
//           setIsListening(false);
//         }
//       }
//     } else {
//       if (recognitionRef.current && isRecognitionActiveRef.current) {
//         try {
//           recognitionRef.current.stop();
//           // Note: isRecognitionActiveRef will be set to false in the onend handler
//           logDebug('Stopped listening');
          
//           // If we have transcript, show the recording complete notification
//           if (transcript.trim() && stage === 'initial' && !confirmingSubmission) {
//             setCompleteTranscript(transcript);
//             setRecordingComplete(true);
            
//             // Auto ask for confirmation after stopping recording
//             setConfirmingSubmission(true);
//             setTimeout(() => {
//               speakText("I've recorded your complaint. Would you like to submit it now? Say yes to proceed or no to record again.");
//             }, 500);
//           }
//         } catch (e) {
//           logDebug(`Error stopping recognition: ${e.message}`);
//         }
//       }
//     }
//   }, [isListening, transcript, stage, confirmingSubmission]);

//   // Speak text function
//   const speakText = (text) => {
//     if (typeof window !== 'undefined' && speechSynthesisRef.current) {
//       // Cancel any ongoing speech
//       speechSynthesisRef.current.cancel();
      
//       const utterance = new SpeechSynthesisUtterance(text);
//       utterance.lang = 'en-IN';
//       utterance.rate = 0.9; // Slightly slower than default
      
//       utterance.onstart = () => setIsSpeaking(true);
//       utterance.onend = () => {
//         setIsSpeaking(false);
        
//         // If confirming submission, start listening for yes/no
//         if (confirmingSubmission && !isListening) {
//           setTimeout(() => {
//             startListening();
//           }, 300);
//         }
//         // If in question stage, start listening after speaking the question
//         else if (stage === 'questions' && !isListening) {
//           setTimeout(() => {
//             startListening();
//           }, 300);
//         }
//       };
      
//       speechSynthesisRef.current.speak(utterance);
//     }
//   };

//   // Toggle listening
//   const toggleListening = () => {
//     if (isListening) {
//       stopListening();
//     } else {
//       startListening();
//     }
//   };

//   // Start listening
//   const startListening = () => {
//     if (!isRecognitionInitialized) {
//       setError("Speech recognition is still initializing. Please wait a moment.");
//       // Try to initialize again
//       initializeSpeechRecognition();
//       return;
//     }
    
//     setError(null);
//     setIsListening(true);
//     // Don't clear transcript if we're confirming submission
//     if (!confirmingSubmission) {
//       setTranscript('');
//     }
//   };

//   // Stop listening
//   const stopListening = () => {
//     setIsListening(false);
//   };

//   // Adjust silence threshold
//   const adjustSilenceThreshold = (newThreshold) => {
//     setSilenceThreshold(newThreshold);
//     logDebug(`Silence threshold adjusted to ${newThreshold}ms`);
//   };

//   // Submit the complaint
//   const handleSubmitComplaint = async () => {
//     const textToSubmit = completeTranscript.trim();
//     if (!textToSubmit) return;
    
//     setIsSubmitting(true);
//     setError(null);
//     stopListening();
//     setRecordingComplete(false);
//     setConfirmingSubmission(false);
    
//     try {
//       // This would connect to your Python backend
//       const response = await fetch('/api/analyze-complaint', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ complaint: textToSubmit })
//       });
      
//       const data = await response.json();
      
//       if (!response.ok) throw new Error(data.error || 'Failed to process complaint');
      
//       // Process the extracted data
//       setExtractedData(data.extractedData);
      
//       // Filter out duplicate questions about name and contact details
//       // Create a set to track fields we've already added
//       const fieldsAdded = new Set();
//       const filteredQuestions = data.questions.filter(q => {
//         // For any field (not just name/contact)
//         if (fieldsAdded.has(q.field)) {
//           return false;
//         }
//         fieldsAdded.add(q.field);
//         return true;
//       });
      
//       setQuestions(filteredQuestions);
//       setStage('questions');
      
//       // Clear transcript for questions
//       setTranscript('');
      
//       // Speak the first question
//       setTimeout(() => {
//         const introText = `Thank you for your complaint. I've identified this as a ${data.extractedData.type_of_theft} incident. I need some additional information. ${filteredQuestions[0].question}`;
//         speakText(introText);
//       }, 500);
      
//     } catch (err) {
//       setError(err.message);
//       speakText(`Sorry, there was an error: ${err.message}`);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Complete the current question and move to next
//   const handleCompleteQuestion = () => {
//     const currentQuestion = questions[currentQuestionIndex];
//     const answer = transcript.trim();
    
//     if (!answer) {
//       speakText("I didn't catch that. Could you please repeat your answer?");
//       return;
//     }
    
//     // Save the answer
//     setAnswers(prev => ({ ...prev, [currentQuestion.field]: answer }));
//     setTranscript('');
    
//     // Check if we have more questions
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
      
//       // Speak the next question after a short delay
//       setTimeout(() => {
//         speakText(questions[currentQuestionIndex + 1].question);
//       }, 500);
//     } else {
//       // All questions answered, generate FIR
//       handleSubmitAllAnswers();
//     }
//   };

//   // Submit all answers and generate FIR
//   const handleSubmitAllAnswers = async () => {
//     setIsSubmitting(true);
//     setError(null);
    
//     try {
//       // Ensure complainant name is set properly
//       const combinedData = {
//         ...extractedData,
//         ...answers
//       };
      
//       // Connect to your Python backend
//       const response = await fetch('/api/generate-fir', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           extractedData: combinedData,
//           additionalInfo: answers
//         })
//       });
      
//       const data = await response.json();
      
//       if (!response.ok) throw new Error(data.error || 'Failed to generate FIR');
      
//       // Make sure the complainant name is set in the FIR
//       const enhancedFIR = {
//         ...data.fir,
//         // If complainant_name is not set or is "not identified", use the value from answers
//         complainant_name: data.fir.complainant_name === "not identified" || !data.fir.complainant_name 
//           ? answers.complainant_name || "Unknown" 
//           : data.fir.complainant_name
//       };
      
//       setGeneratedFIR(enhancedFIR);
//       setStage('complete');
      
//       // Speak the completion message
//       setTimeout(() => {
//         speakText("Thank you for providing all the information. I've successfully generated your First Information Report. You can now download the document.");
//       }, 500);
      
//     } catch (err) {
//       setError(err.message);
//       speakText(`Sorry, there was an error: ${err.message}`);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Start over with a new complaint
//   const handleStartOver = () => {
//     setStage('initial');
//     setCompleteTranscript('');
//     setTranscript('');
//     setExtractedData(null);
//     setQuestions([]);
//     setAnswers({});
//     setCurrentQuestionIndex(0);
//     setGeneratedFIR(null);
//     setError(null);
//     setHasSpokenWelcome(false);
//     setRecordingComplete(false);
//     setConfirmingSubmission(false);
    
//     // Speak the welcome message
//     speakText("Welcome to the FIR voice assistant. Please describe the incident that occurred.");
//   };

//   // Download the generated FIR
//   const handleDownloadFIR = () => {
//     if (typeof window !== 'undefined' && generatedFIR && generatedFIR.id) {
//       // Create a direct link instead of redirect
//       const link = document.createElement('a');
//       link.href = `/api/download-fir?id=${generatedFIR.id}`;
//       link.setAttribute('download', `FIR_${generatedFIR.id}.docx`);
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     } else {
//       setError("Could not download the FIR. Missing document ID.");
//     }
//   };

//   // Speak welcome message on first load (client-side only)
//   useEffect(() => {
//     if (typeof window !== 'undefined' && stage === 'initial' && !hasSpokenWelcome && !isSpeaking) {
//       welcomeTimeoutRef.current = setTimeout(() => {
//         speakText("Welcome to the FIR voice assistant. Please describe the incident that occurred.");
//         setHasSpokenWelcome(true);
//       }, 1000);
      
//       return () => {
//         if (welcomeTimeoutRef.current) {
//           clearTimeout(welcomeTimeoutRef.current);
//         }
//       };
//     }
//   }, [stage, isSpeaking, hasSpokenWelcome]);

//   return (
//     <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
//       {/* Header section */}
//       <div className="space-y-2 mb-6">
//         <h1 className="text-2xl font-bold text-gray-900">FIR Voice Assistant</h1>
//         <p className="text-gray-600">
//           {stage === 'initial' ? 
//             "Please describe the incident in detail. Click the microphone icon to start or stop recording." : 
//             stage === 'questions' ? 
//             `Question ${currentQuestionIndex + 1} of ${questions.length}` : 
//             "FIR Generated Successfully"}
//         </p>
//       </div>
      
//       {/* Initialization status and warming up indicator */}
//       {!isRecognitionInitialized && (
//         <div className="flex items-center p-3 mb-4 text-blue-700 bg-blue-100 rounded-md">
//           <Loader size={18} className="mr-2 animate-spin" />
//           <span>Initializing speech recognition...</span>
//         </div>
//       )}
      
//       {isWarmingUp && isRecognitionInitialized && (
//         <div className="flex items-center p-3 mb-4 text-blue-700 bg-blue-100 rounded-md">
//           <Loader size={18} className="mr-2 animate-spin" />
//           <span>Warming up microphone...</span>
//         </div>
//       )}
      
//       {/* Speech activity indicator */}
//       {isListening && speechDetected && (
//         <div className="flex items-center p-3 mb-4 text-green-700 bg-green-100 rounded-md">
//           <Activity size={18} className="mr-2 animate-pulse" />
//           <span>Speech detected</span>
//         </div>
//       )}
      
//       {/* Error message if any */}
//       {error && (
//         <div className="flex items-center p-3 mb-4 text-red-700 bg-red-100 rounded-md">
//           <AlertCircle size={18} className="mr-2" />
//           <span>{error}</span>
//         </div>
//       )}

//       {/* Recording complete notification */}
//       {recordingComplete && stage === 'initial' && !confirmingSubmission && (
//         <div className="flex items-center p-3 mb-4 text-green-700 bg-green-100 rounded-md">
//           <Check size={18} className="mr-2" />
//           <span>Recording complete! Please review your complaint and click Submit to continue.</span>
//         </div>
//       )}
      
//       {/* Confirmation message */}
//       {confirmingSubmission && stage === 'initial' && (
//         <div className="flex items-center p-3 mb-4 text-blue-700 bg-blue-100 rounded-md">
//           <Volume2 size={18} className="mr-2" />
//           <span>Please say "Yes" to submit or "No" to record again.</span>
//         </div>
//       )}
      
//       {/* Initial complaint stage */}
//       {stage === 'initial' && (
//         <div className="space-y-6">
//           <div className="relative p-4 border border-gray-200 rounded-lg bg-gray-50 min-h-48">
//             <div className="mb-2 flex items-center justify-between">
//               <span className="text-sm font-medium text-gray-500">Your complaint:</span>
//               {isSpeaking && (
//                 <div className="flex items-center space-x-1">
//                   <Volume2 size={16} className="text-blue-500" />
//                   <span className="text-xs text-blue-500">Speaking...</span>
//                 </div>
//               )}
//             </div>
            
//             <div className="min-h-40 rounded-md p-3 bg-white border border-gray-100">
//               {transcript || completeTranscript || 
//               <span className="text-gray-400 italic">Your speech will appear here...</span>}
//             </div>
            
//             <div className="absolute bottom-4 right-4 flex space-x-3">
//               <button
//                 onClick={toggleListening}
//                 className={`p-3 rounded-full ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
//                 disabled={isSpeaking || isSubmitting || !isRecognitionInitialized}
//                 aria-label={isListening ? "Stop recording" : "Start recording"}
//               >
//                 {isListening ? <MicOff size={24} /> : <Mic size={24} />}
//               </button>
//             </div>
//           </div>
          
//           <div className="flex justify-between">
//             <button
//               onClick={() => {
//                 setHasSpokenWelcome(true); // Prevent welcome from repeating
//                 speakText("Welcome to the FIR voice assistant. Please describe the incident that occurred.");
//               }}
//               className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//               disabled={isSpeaking || isSubmitting}
//             >
//               <Speaker size={18} className="mr-2" />
//               Repeat Instructions
//             </button>
            
//             <button
//               onClick={handleSubmitComplaint}
//               disabled={!completeTranscript.trim() || isSubmitting || isSpeaking || isListening}
//               className={`flex items-center px-4 py-2 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed ${(completeTranscript.trim() && !isSubmitting && !isSpeaking && !isListening) ? 'bg-blue-600 hover:bg-blue-700 animate-pulse' : 'bg-blue-600'}`}
//             >
//               {isSubmitting ? (
//                 <>
//                   <Loader size={18} className="mr-2 animate-spin" />
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   <Send size={18} className="mr-2" />
//                   Submit
//                 </>
//               )}
//             </button>
//           </div>

//           {/* Silence Threshold Control */}
//           <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
//             <label htmlFor="silenceThreshold" className="block text-sm font-medium text-gray-700 mb-1">
//               Silence Timeout: {silenceThreshold/1000} seconds
//             </label>
//             <input
//               type="range"
//               id="silenceThreshold"
//               min="2000"
//               max="8000"
//               step="1000"
//               value={silenceThreshold}
//               onChange={(e) => adjustSilenceThreshold(parseInt(e.target.value))}
//               className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//             />
//             <p className="mt-1 text-xs text-gray-500">
//               Adjust this if recording stops too soon (increase) or doesn't stop after you finish speaking (decrease).
//             </p>
//           </div>

//           {/* Instructions */}
//           <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700 border border-blue-100">
//             <p><strong>How to use:</strong></p>
//             <ol className="list-decimal pl-5 space-y-1">
//               <li>Click the microphone icon to start recording</li>
//               <li>Describe the incident in detail</li>
//               <li>The microphone will automatically turn off when you stop speaking</li>
//               <li>You will be asked to confirm submission - say "Yes" to submit or "No" to record again</li>
//               <li>If the microphone doesn't work properly on first try, please try again</li>
//             </ol>
//           </div>
//         </div>
//       )}
      
//       {/* Questions stage */}
//       {stage === 'questions' && questions.length > 0 && (
//         <div className="space-y-6">
//           <div className="p-4 bg-gray-50 rounded-md mb-4">
//             <h3 className="font-medium text-gray-700">Incident type identified: {extractedData.type_of_theft}</h3>
//             {extractedData.applicable_sections && (
//               <p className="text-sm text-gray-600">Applicable sections: {extractedData.applicable_sections}</p>
//             )}
//           </div>
          
//           <div className="relative p-4 border border-gray-200 rounded-lg bg-white">
//             <div className="mb-3 flex items-center justify-between">
//               <h3 className="text-lg font-medium">
//                 {questions[currentQuestionIndex].question}
//               </h3>
//               {isSpeaking && (
//                 <div className="flex items-center space-x-1">
//                   <Volume2 size={16} className="text-blue-500" />
//                   <span className="text-xs text-blue-500">Speaking...</span>
//                 </div>
//               )}
//             </div>
            
//             <div className="min-h-24 p-3 rounded-md bg-gray-50 border border-gray-100 mb-4">
//               {transcript || <span className="text-gray-400 italic">Your answer will appear here...</span>}
//             </div>
            
//             <div className="flex justify-between items-center">
//               <button
//                 onClick={() => speakText(questions[currentQuestionIndex].question)}
//                 className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//                 disabled={isSpeaking || isSubmitting}
//               >
//                 <Speaker size={16} className="mr-2" />
//                 Repeat Question
//               </button>
              
//               <div className="flex space-x-3">
//                 <button
//                   onClick={toggleListening}
//                   className={`p-2 rounded-full ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
//                   disabled={isSpeaking || isSubmitting}
//                   aria-label={isListening ? "Stop recording" : "Start recording"}
//                 >
//                   {isListening ? <MicOff size={20} /> : <Mic size={20} />}
//                 </button>
                
//                 <button
//                   onClick={handleCompleteQuestion}
//                   disabled={!transcript.trim() || isSubmitting || isSpeaking || isListening}
//                   className={`flex items-center px-4 py-2 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed ${(transcript.trim() && !isSubmitting && !isSpeaking && !isListening) ? 'bg-blue-600 hover:bg-blue-700 animate-pulse' : 'bg-blue-600'}`}
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <Loader size={18} className="mr-2 animate-spin" />
//                       Processing...
//                     </>
//                   ) : (
//                     "Next"
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
          
//           <div className="flex items-center justify-between pt-4 border-t border-gray-200">
//             <div className="flex flex-col">
//               <span className="text-sm text-gray-500">Progress</span>
//               <div className="w-64 h-2 mt-1 bg-gray-200 rounded-full overflow-hidden">
//                 <div 
//                   className="h-full bg-blue-600 rounded-full" 
//                   style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
//                 />
//               </div>
//             </div>
//             <span className="text-sm text-gray-500">
//               {currentQuestionIndex + 1} of {questions.length} questions
//             </span>
//           </div>
//         </div>
//       )}
      
//       {/* Completion stage */}
//       {stage === 'complete' && generatedFIR && (
//         <div className="space-y-6">
//           <div className="space-y-2 text-center">
//             <div className="flex justify-center">
//               <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
//                 <Check size={24} className="text-green-600" />
//               </div>
//             </div>
//             <h1 className="text-2xl font-bold text-gray-900">FIR Generated Successfully</h1>
//             <p className="text-gray-600">
//               Your First Information Report has been generated and is ready for download.
//             </p>
//             {isSpeaking && (
//               <div className="flex items-center justify-center space-x-1 mt-2">
//                 <Volume2 size={16} className="text-blue-500" />
//                 <span className="text-xs text-blue-500">Speaking...</span>
//               </div>
//             )}
//           </div>
          
//           <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
//             <h3 className="font-medium text-gray-900 mb-4">FIR Summary</h3>
//             <dl className="space-y-3">
//               <div className="grid grid-cols-3 gap-4">
//                 <dt className="text-sm font-medium text-gray-500">Complainant</dt>
//                 <dd className="text-sm text-gray-900 col-span-2">{generatedFIR.complainant_name}</dd>
//               </div>
//               <div className="grid grid-cols-3 gap-4">
//                 <dt className="text-sm font-medium text-gray-500">Incident Type</dt>
//                 <dd className="text-sm text-gray-900 col-span-2">{generatedFIR.type_of_theft}</dd>
//               </div>
//               <div className="grid grid-cols-3 gap-4">
//                 <dt className="text-sm font-medium text-gray-500">Date/Time</dt>
//                 <dd className="text-sm text-gray-900 col-span-2">{generatedFIR.date_time}</dd>
//               </div>
//               <div className="grid grid-cols-3 gap-4">
//                 <dt className="text-sm font-medium text-gray-500">Location</dt>
//                 <dd className="text-sm text-gray-900 col-span-2">{generatedFIR.location}</dd>
//               </div>
//               <div className="grid grid-cols-3 gap-4">
//                 <dt className="text-sm font-medium text-gray-500">Applicable Sections</dt>
//                 <dd className="text-sm text-gray-900 col-span-2">{generatedFIR.applicable_sections}</dd>
//               </div>
//             </dl>
//           </div>
          
//           <div className="flex flex-col space-y-3">
//             <button
//               onClick={handleDownloadFIR}
//               className="flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//             >
//               Download FIR Document (.docx)
//             </button>
            
//             <button
//               onClick={handleStartOver}
//               className="flex items-center justify-center py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//             >
//               Submit Another Complaint
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VoiceFIRSubmissionForm;

// trying UI
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff,Speaker, RefreshCw, Volume2, Loader, Send, Check, AlertCircle, Activity } from 'lucide-react';

const VoiceFIRSubmissionForm = () => {
  // Main states
  const [stage, setStage] = useState('initial'); // initial, listening, questions, complete
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const [hasSpokenWelcome, setHasSpokenWelcome] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [confirmingSubmission, setConfirmingSubmission] = useState(false);
  
  // New states for improved reliability
  const [isRecognitionInitialized, setIsRecognitionInitialized] = useState(false);
  const [speechDetected, setSpeechDetected] = useState(false);
  const [silenceThreshold, setSilenceThreshold] = useState(4000); // 4 seconds, increased from 2.5s
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  
  // Data states
  const [transcript, setTranscript] = useState('');
  const [completeTranscript, setCompleteTranscript] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [generatedFIR, setGeneratedFIR] = useState(null);

  // Refs
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const isMountedRef = useRef(true);
  const welcomeTimeoutRef = useRef(null);
  const isRecognitionActiveRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const lastSpeechTimestampRef = useRef(0);
  const recognitionRestartTimerRef = useRef(null);
  const initAttemptCountRef = useRef(0);

  // Logging function for debugging (you can remove in production)
  const logDebug = (message) => {
    console.log(`[VoiceFIR Debug] ${message}`);
  };

  // Initialize browser-only APIs safely
  useEffect(() => {
    // This only runs in the browser, not during server-side rendering
    if (typeof window !== 'undefined') {
      // Initialize speech synthesis
      speechSynthesisRef.current = window.speechSynthesis;
      
      // Initialize recognition with retry logic
      initializeSpeechRecognition();
    }
    
    return () => {
      isMountedRef.current = false;
      if (welcomeTimeoutRef.current) {
        clearTimeout(welcomeTimeoutRef.current);
      }
      if (silenceTimerRef.current) {
        clearInterval(silenceTimerRef.current);
      }
      if (recognitionRestartTimerRef.current) {
        clearTimeout(recognitionRestartTimerRef.current);
      }
      if (typeof window !== 'undefined' && speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  // Initialize speech recognition with retry logic
  const initializeSpeechRecognition = () => {
    if (typeof window !== 'undefined' && !recognitionRef.current) {
      initAttemptCountRef.current++;
      logDebug(`Initializing speech recognition (attempt ${initAttemptCountRef.current})`);
      
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        try {
          const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = 'en-IN'; // Set to Indian English
          
          recognitionRef.current.onresult = handleRecognitionResult;
          recognitionRef.current.onerror = handleRecognitionError;
          recognitionRef.current.onend = handleRecognitionEnd;
          recognitionRef.current.onstart = handleRecognitionStart;
          
          setIsRecognitionInitialized(true);
          logDebug("Speech recognition initialized successfully");
        } catch (e) {
          logDebug(`Error initializing recognition: ${e.message}`);
          setError(`Could not initialize speech recognition: ${e.message}`);
          
          // Retry initialization after a delay (but not too many times)
          if (initAttemptCountRef.current < 3) {
            setTimeout(initializeSpeechRecognition, 1000);
          }
        }
      } else {
        setError('Speech recognition is not supported in your browser. Please use Chrome.');
      }
    }
  };
  
  // Handle recognition result
  const handleRecognitionResult = (event) => {
    const current = event.resultIndex;
    const result = event.results[current];
    const transcriptValue = result[0].transcript;
    const confidence = result[0].confidence;
    
    // Only accept results with good confidence
    if (confidence > 0.6) {
      // Update the last speech timestamp
      lastSpeechTimestampRef.current = Date.now();
      
      // Show speech detected indicator
      setSpeechDetected(true);
      
      if (result.isFinal) {
        setTranscript(prev => prev + ' ' + transcriptValue);
      }
    }
  };
  
  // Handle recognition error
  const handleRecognitionError = (event) => {
    logDebug(`Speech recognition error: ${event.error}`);
    
    if (event.error === 'no-speech') {
      // Don't show error immediately for no-speech, this is handled by silence detection
      logDebug("No speech detected");
    } else if (event.error === 'aborted') {
      logDebug('Recognition aborted');
      // Don't show error for aborted as it's usually from manual stopping
      setError(null);
    } else if (event.error === 'audio-capture') {
      setError("I can't access your microphone. Please check your microphone permissions.");
      setIsListening(false);
      isRecognitionActiveRef.current = false;
    } else if (event.error === 'network') {
      setError("There was a network error. Please check your internet connection.");
      setIsListening(false);
      isRecognitionActiveRef.current = false;
    } else {
      setError(`Microphone error: ${event.error}. Please try again.`);
      setIsListening(false);
      isRecognitionActiveRef.current = false;
    }
  };
  
  // Handle recognition start
  const handleRecognitionStart = () => {
    logDebug('Recognition started');
    isRecognitionActiveRef.current = true;
    
    // Set warming up state for a short period (helpful for first runs)
    setIsWarmingUp(true);
    setTimeout(() => {
      if (isMountedRef.current) {
        setIsWarmingUp(false);
      }
    }, 1500);
  };
  
  // Handle recognition end
  const handleRecognitionEnd = () => {
    logDebug('Recognition ended');
    isRecognitionActiveRef.current = false;
    
    // Clear any pending restart timers
    if (recognitionRestartTimerRef.current) {
      clearTimeout(recognitionRestartTimerRef.current);
      recognitionRestartTimerRef.current = null;
    }
    
    // Only restart if we're still supposed to be listening
    if (isMountedRef.current && isListening) {
      // Use a longer delay before restarting (500ms instead of 300ms)
      recognitionRestartTimerRef.current = setTimeout(() => {
        if (isListening && recognitionRef.current && !isRecognitionActiveRef.current) {
          try {
            logDebug('Restarting recognition');
            recognitionRef.current.start();
            // Note: The onstart handler will set isRecognitionActiveRef to true
          } catch (e) {
            logDebug(`Recognition restart failed: ${e.message}`);
            setIsListening(false);
            
            // Try one more restart after a longer delay
            setTimeout(() => {
              if (isMountedRef.current && isListening) {
                try {
                  recognitionRef.current.start();
                } catch (innerE) {
                  setError("Could not restart speech recognition. Please refresh the page.");
                  setIsListening(false);
                }
              }
            }, 1000);
          }
        }
      }, 500);
    } else if (isMountedRef.current && !isListening && stage === 'initial') {
      // If we've stopped listening and have transcript, update the complete transcript
      // and show a notification that recording is complete
      if (transcript.trim()) {
        setCompleteTranscript(transcript);
        setRecordingComplete(true);
        
        // Auto ask for confirmation after speech is complete
        if (!confirmingSubmission) {
          setConfirmingSubmission(true);
          setTimeout(() => {
            speakText("I've recorded your complaint. Would you like to submit it now? Say yes to proceed or no to record again.");
          }, 500);
        }
      }
    }
    
    // Reset speech detected indicator
    setSpeechDetected(false);
  };

  // Silence detection to automatically stop the microphone after silence
  useEffect(() => {
    if (isListening) {
      // Start the silence detection timer
      lastSpeechTimestampRef.current = Date.now();
      logDebug(`Silence detection started with threshold of ${silenceThreshold}ms`);
      
      silenceTimerRef.current = setInterval(() => {
        const silenceTime = Date.now() - lastSpeechTimestampRef.current;
        
        // If silence for more than the threshold, stop listening
        if (silenceTime > silenceThreshold) {
          logDebug(`Silence detected for ${silenceThreshold}ms, stopping microphone`);
          stopListening();
          // Clear the silence timer
          if (silenceTimerRef.current) {
            clearInterval(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        }
      }, 500);
    } else {
      // Clear the silence timer if we're not listening
      if (silenceTimerRef.current) {
        clearInterval(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    }

    return () => {
      if (silenceTimerRef.current) {
        clearInterval(silenceTimerRef.current);
      }
    };
  }, [isListening, silenceThreshold]);
  
  // Listen for "yes" or "no" confirmation
  useEffect(() => {
    if (confirmingSubmission && isListening && transcript) {
      const lowercaseTranscript = transcript.toLowerCase();
      
      if (lowercaseTranscript.includes('yes') || lowercaseTranscript.includes('yeah') || 
          lowercaseTranscript.includes('correct') || lowercaseTranscript.includes('submit')) {
        // User confirmed, submit the complaint
        setConfirmingSubmission(false);
        setIsListening(false);
        setTimeout(() => {
          handleSubmitComplaint();
        }, 300);
      } else if (lowercaseTranscript.includes('no') || lowercaseTranscript.includes('nope') || 
                lowercaseTranscript.includes('repeat') || lowercaseTranscript.includes('again')) {
        // User wants to record again
        setConfirmingSubmission(false);
        setTranscript('');
        setCompleteTranscript('');
        setRecordingComplete(false);
        setIsListening(false);
        setTimeout(() => {
          speakText("Let's try again. Please describe the incident when you're ready.");
        }, 300);
      }
    }
  }, [transcript, confirmingSubmission, isListening]);

  // Clean up recognition when unmounting
  useEffect(() => {
    return () => {
      if (recognitionRef.current && isRecognitionActiveRef.current) {
        try {
          recognitionRef.current.stop();
          isRecognitionActiveRef.current = false;
        } catch (e) {
          logDebug(`Error stopping recognition during cleanup: ${e.message}`);
        }
      }
    };
  }, []);

  // Handle changes to isListening state
  useEffect(() => {
    if (isListening) {
      if (recognitionRef.current && !isRecognitionActiveRef.current) {
        try {
          recognitionRef.current.start();
          // Note: isRecognitionActiveRef will be set to true in the onstart handler
          logDebug('Started listening');
          
          // Reset the recordingComplete flag when starting to listen again
          setRecordingComplete(false);
        } catch (e) {
          logDebug(`Error starting recognition: ${e.message}`);
          setError(`Failed to start microphone: ${e.message}. Please try again.`);
          setIsListening(false);
        }
      }
    } else {
      if (recognitionRef.current && isRecognitionActiveRef.current) {
        try {
          recognitionRef.current.stop();
          // Note: isRecognitionActiveRef will be set to false in the onend handler
          logDebug('Stopped listening');
          
          // If we have transcript, show the recording complete notification
          if (transcript.trim() && stage === 'initial' && !confirmingSubmission) {
            setCompleteTranscript(transcript);
            setRecordingComplete(true);
            
            // Auto ask for confirmation after stopping recording
            setConfirmingSubmission(true);
            setTimeout(() => {
              speakText("I've recorded your complaint. Would you like to submit it now? Say yes to proceed or no to record again.");
            }, 500);
          }
        } catch (e) {
          logDebug(`Error stopping recognition: ${e.message}`);
        }
      }
    }
  }, [isListening, transcript, stage, confirmingSubmission]);

  // Speak text function
  const speakText = (text) => {
    if (typeof window !== 'undefined' && speechSynthesisRef.current) {
      // Cancel any ongoing speech
      speechSynthesisRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 0.9; // Slightly slower than default
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        
        // If confirming submission, start listening for yes/no
        if (confirmingSubmission && !isListening) {
          setTimeout(() => {
            startListening();
          }, 300);
        }
        // If in question stage, start listening after speaking the question
        else if (stage === 'questions' && !isListening) {
          setTimeout(() => {
            startListening();
          }, 300);
        }
      };
      
      speechSynthesisRef.current.speak(utterance);
    }
  };

  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Start listening
  const startListening = () => {
    if (!isRecognitionInitialized) {
      setError("Speech recognition is still initializing. Please wait a moment.");
      // Try to initialize again
      initializeSpeechRecognition();
      return;
    }
    
    setError(null);
    setIsListening(true);
    // Don't clear transcript if we're confirming submission
    if (!confirmingSubmission) {
      setTranscript('');
    }
  };

  // Stop listening
  const stopListening = () => {
    setIsListening(false);
  };

  // Adjust silence threshold
  const adjustSilenceThreshold = (newThreshold) => {
    setSilenceThreshold(newThreshold);
    logDebug(`Silence threshold adjusted to ${newThreshold}ms`);
  };

  // Submit the complaint
  const handleSubmitComplaint = async () => {
    const textToSubmit = completeTranscript.trim();
    if (!textToSubmit) return;
    
    setIsSubmitting(true);
    setError(null);
    stopListening();
    setRecordingComplete(false);
    setConfirmingSubmission(false);
    
    try {
      // This would connect to your Python backend
      const response = await fetch('/api/analyze-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaint: textToSubmit })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to process complaint');
      
      // Process the extracted data
      setExtractedData(data.extractedData);
      
      // Filter out duplicate questions about name and contact details
      // Create a set to track fields we've already added
      const fieldsAdded = new Set();
      const filteredQuestions = data.questions.filter(q => {
        // For any field (not just name/contact)
        if (fieldsAdded.has(q.field)) {
          return false;
        }
        fieldsAdded.add(q.field);
        return true;
      });
      
      setQuestions(filteredQuestions);
      setStage('questions');
      
      // Clear transcript for questions
      setTranscript('');
      
      // Speak the first question
      setTimeout(() => {
        const introText = `Thank you for your complaint. I've identified this as a ${data.extractedData.type_of_theft} incident. I need some additional information. ${filteredQuestions[0].question}`;
        speakText(introText);
      }, 500);
      
    } catch (err) {
      setError(err.message);
      speakText(`Sorry, there was an error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete the current question and move to next
  const handleCompleteQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const answer = transcript.trim();
    
    if (!answer) {
      speakText("I didn't catch that. Could you please repeat your answer?");
      return;
    }
    
    // Save the answer
    setAnswers(prev => ({ ...prev, [currentQuestion.field]: answer }));
    setTranscript('');
    
    // Check if we have more questions
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      
      // Speak the next question after a short delay
      setTimeout(() => {
        speakText(questions[currentQuestionIndex + 1].question);
      }, 500);
    } else {
      // All questions answered, generate FIR
      handleSubmitAllAnswers();
    }
  };

  // Submit all answers and generate FIR
  const handleSubmitAllAnswers = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Ensure complainant name is set properly
      const combinedData = {
        ...extractedData,
        ...answers
      };
      
      // Connect to your Python backend
      const response = await fetch('/api/generate-fir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          extractedData: combinedData,
          additionalInfo: answers
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to generate FIR');
      
      // Make sure the complainant name is set in the FIR
      const enhancedFIR = {
        ...data.fir,
        // If complainant_name is not set or is "not identified", use the value from answers
        complainant_name: data.fir.complainant_name === "not identified" || !data.fir.complainant_name 
          ? answers.complainant_name || "Unknown" 
          : data.fir.complainant_name
      };
      
      setGeneratedFIR(enhancedFIR);
      setStage('complete');
      
      // Speak the completion message
      setTimeout(() => {
        speakText("Thank you for providing all the information. I've successfully generated your First Information Report. You can now download the document.");
      }, 500);
      
    } catch (err) {
      setError(err.message);
      speakText(`Sorry, there was an error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download the generated FIR
  const handleDownloadFIR = () => {
    if (typeof window !== 'undefined' && generatedFIR && generatedFIR.id) {
      // Create a direct link instead of redirect
      const link = document.createElement('a');
      link.href = `/api/download-fir?id=${generatedFIR.id}`;
      link.setAttribute('download', `FIR_${generatedFIR.id}.docx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      setError("Could not download the FIR. Missing document ID.");
    }
  };

  // Start over with a new complaint
  const handleStartOver = () => {
    setStage('initial');
    setCompleteTranscript('');
    setTranscript('');
    setExtractedData(null);
    setQuestions([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setGeneratedFIR(null);
    setError(null);
    setHasSpokenWelcome(false);
    setRecordingComplete(false);
    setConfirmingSubmission(false);
    
    // Speak the welcome message
    speakText("Welcome to the FIR voice assistant. Please describe the incident that occurred.");
  };

  // Speak welcome message on first load (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined' && stage === 'initial' && !hasSpokenWelcome && !isSpeaking) {
      welcomeTimeoutRef.current = setTimeout(() => {
        speakText("Welcome to the FIR voice assistant. Please describe the incident that occurred.");
        setHasSpokenWelcome(true);
      }, 1000);
      
      return () => {
        if (welcomeTimeoutRef.current) {
          clearTimeout(welcomeTimeoutRef.current);
        }
      };
    }
  }, [stage, isSpeaking, hasSpokenWelcome]);

  return (
    <div
      className="relative min-h-screen bg-black flex flex-col"
      style={{
        backgroundImage:
          "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design.jpg-MyQCMOVtmhlYkrCeqXwpoNnPch0aXg.jpeg')",
        backgroundSize: "contain",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Content container with overlay */}
      <div className="relative z-10 flex flex-col min-h-screen px-8">
        {/* Header */}
        <header className="flex justify-between items-center">
          <h1 className="text-amber-50 text-3xl font-light"></h1>
        </header>
  
        <main className="flex-1 flex flex-col mt-7">
  {/* Only show the FIR Voice Assistant heading when NOT in completion stage */}
  {stage !== "complete" && (
    <h2 className="text-gray-200 text-4xl leading-sung font-extrabold mb-4 font-[sans-serif]">
      <br></br>FIR Voice Assistant
    </h2>
  )}
          {/* Stage-specific descriptions */}
          {stage === "initial" && (
            <p className="text-amber-50/80 text-2xl font-light mb-8">
              Please describe the incident in detail. Click the microphone icon to start or stop recording.
            </p>
          )}
          
          {stage === "questions" && questions.length > 0 && (
            <p className="text-amber-50/80 text-1xl mb-12">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          )}
          
          {/* {stage === "complete" && (
            <p className="text-amber-50/80 text-xl mb-4">FIR Generated Successfully</p>
          )} */}
  
          {/* Error message if any */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-xl text-red-300">
              <AlertCircle size={18} className="inline-block mr-2" />
              <span>{error}</span>
            </div>
          )}
  
          {/* Initialization status and warming up indicator */}
          {!isRecognitionInitialized && (
            <div className="mb-6 p-4 bg-blue-900/30 border border-blue-500/30 rounded-xl text-blue-300">
              <Loader size={18} className="inline-block mr-2 animate-spin" />
              <span>Initializing speech recognition...</span>
            </div>
          )}
  
          {isWarmingUp && isRecognitionInitialized && (
            <div className="mb-6 p-4 bg-blue-900/30 border border-blue-500/30 rounded-xl text-blue-300">
              <Loader size={18} className="inline-block mr-2 animate-spin" />
              <span>Warming up microphone...</span>
            </div>
          )}
          
          {/* Speech activity indicator */}
          {isListening && speechDetected && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-500/30 rounded-xl text-green-300">
              <Activity size={18} className="inline-block mr-2 animate-pulse" />
              <span>Speech detected</span>
            </div>
          )}
  
          {/* Recording complete notification */}
          {recordingComplete && stage === "initial" && !confirmingSubmission && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-500/30 rounded-xl text-green-300">
              <Check size={18} className="inline-block mr-2" />
              <span>Recording complete! Please review your complaint and click Submit to continue.</span>
            </div>
          )}
  
          {/* Confirmation message */}
          {confirmingSubmission && stage === "initial" && (
            <div className="mb-6 p-4 bg-blue-900/30 border border-blue-500/30 rounded-xl text-blue-300">
              <Volume2 size={18} className="inline-block mr-2" />
              <span>Please say "Yes" to submit or "No" to record again.</span>
            </div>
          )}
          
          {/* Initial complaint stage */}
          {stage === "initial" && (
            <div className="space-y-6">
              <div className="relative">
                <div className="flex gap-6 items-center">
                  <textarea
                    className="flex-1 bg-black/40 backdrop-blur-sm border border-amber-50/20 rounded-xl p-6 text-amber-50/80 text-xl min-h-40 resize-none focus:outline-none focus:border-amber-50/40"
                    placeholder="Your speech will appear here..."
                    value={transcript || completeTranscript}
                    readOnly
                  />
                  <div className="w-24 h-24 rounded-full border-2 border-blue-400/70 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <button
                      onClick={toggleListening}
                      className={`w-20 h-20 rounded-full ${isListening ? "bg-red-500/20 border-2 border-red-500/70" : "bg-blue-400/20 border-2 border-blue-400/70"} flex items-center justify-center`}
                      disabled={isSpeaking || isSubmitting || !isRecognitionInitialized}
                      aria-label={isListening ? "Stop recording" : "Start recording"}
                    >
                      {isListening ? (
                        <MicOff size={30} className="text-red-400" />
                      ) : (
                        <Mic size={30} className="text-blue-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Silence Threshold Control */}
              <div className="w-1/2 p-4 bg-black/40 backdrop-blur-sm border border-amber-50/20 rounded-xl">
                <label htmlFor="silenceThreshold" className="block text-sm font-medium text-amber-50/70 mb-1">
                  Silence Timeout: {silenceThreshold/1000} seconds
                </label>
                <input
                  type="range"
                  id="silenceThreshold"
                  min="2000"
                  max="8000"
                  step="1000"
                  value={silenceThreshold}
                  onChange={(e) => adjustSilenceThreshold(parseInt(e.target.value))}
                  className="w-full h-2 bg-amber-50/20 rounded-lg appearance-none cursor-pointer"
                />
                <p className="mt-1 text-xs text-amber-50/60">
                  Adjust this if recording stops too soon (increase) or doesn't stop after you finish speaking (decrease).
                </p>
              </div>
  
              {/* <div className="mt-4 p-3 bg-black/30 backdrop-blur-sm rounded-md text-sm text-amber-50/80 border border-amber-50/20">
                <p className="font-medium mb-2">How to use:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Click the microphone icon to start recording</li>
                  <li>Describe the incident in detail</li>
                  <li>The microphone will automatically turn off when you stop speaking</li>
                  <li>You will be asked to confirm submission - say "Yes" to submit or "No" to record again</li>
                  <li>If the microphone doesn't work properly on first try, please try again</li>
                </ol>
              </div> */}
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    setHasSpokenWelcome(true); // Prevent welcome from repeating
                    speakText("Welcome to the FIR voice assistant. Please describe the incident that occurred.");
                  }}
                  className="flex items-center gap-2 text-amber-50 border border-amber-50/20 rounded-xl py-3 px-6 bg-black/30 backdrop-blur-sm hover:bg-black/40"
                  disabled={isSpeaking || isSubmitting}
                >
                  <Speaker size={18} className="mr-2" />
                  <span>Repeat Instructions</span>
                </button>
                
                <button
                  onClick={handleSubmitComplaint}
                  disabled={!completeTranscript.trim() || isSubmitting || isSpeaking || isListening}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600/80 hover:bg-blue-600 backdrop-blur-sm ${(completeTranscript.trim() && !isSubmitting && !isSpeaking && !isListening) ? 'animate-pulse' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={18} className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send size={18} className="mr-2" />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          
          {/* Questions stage */}
          {stage === "questions" && questions.length > 0 && (
            <div className="space-y-6">
              <div className="p-4 bg-black/40 backdrop-blur-sm border border-amber-50/20 rounded-xl mb-4">
                <h3 className="font-medium text-amber-50">Incident type identified: {extractedData.type_of_theft}</h3>
                {extractedData.applicable_sections && (
                  <p className="text-sm text-amber-50/70">Applicable sections: {extractedData.applicable_sections}</p>
                )}
              </div>
              
              <div className="relative p-4 border border-amber-50/20 rounded-xl bg-black/40 backdrop-blur-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-amber-50">
                    {questions[currentQuestionIndex].question}
                  </h3>
                  {isSpeaking && (
                    <div className="flex items-center space-x-1">
                      <Volume2 size={16} className="text-blue-400" />
                      <span className="text-xs text-blue-400">Speaking...</span>
                    </div>
                  )}
                </div>
                
                <div className="min-h-24 p-3 rounded-md bg-black/40 border border-amber-50/10 mb-4 text-amber-50/80">
                  {transcript || <span className="text-amber-50/50 italic">Your answer will appear here...</span>}
                </div>
                
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => speakText(questions[currentQuestionIndex].question)}
                    className="flex items-center px-3 py-2 border border-amber-50/20 rounded-md text-amber-50 hover:bg-black/60 bg-black/30 backdrop-blur-sm"
                    disabled={isSpeaking || isSubmitting}
                  >
                    <Speaker size={16} className="mr-2" />
                    Repeat Question
                  </button>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={toggleListening}
                      className={`p-3 rounded-full ${isListening ? 'bg-red-500/70' : 'bg-blue-500/70'} text-white backdrop-blur-sm`}
                      disabled={isSpeaking || isSubmitting}
                      aria-label={isListening ? "Stop recording" : "Start recording"}
                    >
                      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    
                    <button
                      onClick={handleCompleteQuestion}
                      disabled={!transcript.trim() || isSubmitting || isSpeaking || isListening}
                      className={`flex items-center px-4 py-2 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600/70 hover:bg-blue-600 backdrop-blur-sm ${(transcript.trim() && !isSubmitting && !isSpeaking && !isListening) ? 'animate-pulse' : ''}`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader size={18} className="mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Next"
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-amber-50/20">
                <div className="flex flex-col">
                  <span className="text-sm text-amber-50/60">Progress</span>
                  <div className="w-64 h-2 mt-1 bg-amber-50/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500/80 rounded-full" 
                      style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-amber-50/60">
                  {currentQuestionIndex + 1} of {questions.length} questions
                </span>
              </div>
            </div>
          )}
          
          {/* Completion stage */}
          {stage === "complete" && generatedFIR && (
  <div className="flex justify-start items-center pt-20">
    <div className="m-8 w-100 space-y-6 bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-amber-50/20">
      <div className="space-y-2 text-center">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-green-900/30 border border-green-500/30 flex items-center justify-center">
            <Check size={24} className="text-green-400" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-amber-50">FIR Generated Successfully</h1>
        <p className="text-sm text-amber-50/70">
          Your First Information Report has been generated and is ready for download.
        </p>
        {isSpeaking && (
          <div className="flex items-center justify-center space-x-1 mt-2">
            <Volume2 size={16} className="text-blue-400" />
            <span className="text-xs text-blue-400">Speaking...</span>
          </div>
        )}

      </div>
      
      <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg border border-amber-50/20">
        <h3 className="font-medium text-amber-50 mb-3 text-sm">FIR Summary</h3>
        <dl className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <dt className="text-xs font-medium text-amber-50/60">Complainant</dt>
            <dd className="text-xs text-amber-50/90 col-span-2">{generatedFIR.complainant_name}</dd>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <dt className="text-xs font-medium text-amber-50/60">Incident Type</dt>
            <dd className="text-xs text-amber-50/90 col-span-2">{generatedFIR.type_of_theft}</dd>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <dt className="text-xs font-medium text-amber-50/60">Date/Time</dt>
            <dd className="text-xs text-amber-50/90 col-span-2">{generatedFIR.date_time}</dd>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <dt className="text-xs font-medium text-amber-50/60">Location</dt>
            <dd className="text-xs text-amber-50/90 col-span-2">{generatedFIR.location}</dd>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <dt className="text-xs font-medium text-amber-50/60">Sections</dt>
            <dd className="text-xs text-amber-50/90 col-span-2">{generatedFIR.applicable_sections}</dd>
          </div>
        </dl>
      </div>
      
      <div className="flex flex-col space-y-3">
        <button
          onClick={handleDownloadFIR}
          className="flex items-center justify-center py-2 px-4 bg-blue-600/80 text-white rounded-lg hover:bg-blue-600 backdrop-blur-sm text-sm"
        >
          Download FIR Document (.docx)
        </button>
        <button
          onClick={handleStartOver}
          className="flex items-center justify-center py-2 px-4 border border-amber-50/20 text-amber-50 rounded-lg hover:bg-black/40 bg-black/30 backdrop-blur-sm text-sm"
        >
          Submit Another Complaint
        </button>
      </div>
    </div>
  </div>
)}
        </main>
  
        {/* Progress indicator - only show in questions and complete stages */}
        {(stage === "questions" || stage === "complete") && (
          <footer className="mt-auto pt-4 pb-8">
            <div className="flex items-center gap-4">
              <span className="text-amber-50 text-lg">
                {stage === "questions" ? `Step ${currentQuestionIndex + 3} of ${questions.length + 2}` : "Step 5 of 5"}
              </span>
              <div className="flex-1 h-1 bg-amber-50/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500/80 rounded-full"
                  style={{
                    width:
                      stage === "questions"
                        ? `${((currentQuestionIndex + 3) / (questions.length + 2)) * 100}%`
                        : "100%",
                  }}
                ></div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
  export default VoiceFIRSubmissionForm;