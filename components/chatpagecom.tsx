import React, { useState } from 'react';
import { Send, Plus, AlertCircle, Check, Loader } from 'lucide-react';

const FIRSubmissionForm = () => {
  const [complaint, setComplaint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stage, setStage] = useState('initial'); // initial, questions, complete
  const [extractedData, setExtractedData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [generatedFIR, setGeneratedFIR] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmitComplaint = async () => {
    if (!complaint.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // This would connect to your Python backend
      const response = await fetch('/api/analyze-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaint })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to process complaint');
      
      setExtractedData(data.extractedData);
      setQuestions(data.questions);
      setStage('questions');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerChange = (questionField, value) => {
    setAnswers(prev => ({ ...prev, [questionField]: value }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmitAllAnswers();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitAllAnswers = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // This would connect to your Python backend
      const response = await fetch('/api/generate-fir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          extractedData,
          additionalInfo: answers
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to generate FIR');
      
      setGeneratedFIR(data.fir);
      setStage('complete');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadFIR = () => {
    // This would trigger downloading the generated DOCX file
    window.location.href = `/api/download-fir?id=${generatedFIR.id}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {stage === 'initial' && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">First Information Report (FIR) Generator</h1>
            <p className="text-gray-600">
              Describe the theft incident in detail. Include information such as what was stolen, 
              when and where it happened, how it was stolen, and any other relevant details.
            </p>
          </div>
          
          <div className="space-y-4">
            <textarea
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Describe the incident in detail..."
              className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isSubmitting}
            />
            
            {error && (
              <div className="flex items-center p-3 text-red-700 bg-red-100 rounded-md">
                <AlertCircle size={18} className="mr-2" />
                <span>{error}</span>
              </div>
            )}
            
            <button
              onClick={handleSubmitComplaint}
              disabled={isSubmitting || !complaint.trim()}
              className="flex items-center justify-center w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader size={18} className="mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send size={18} className="mr-2" />
                  Submit Complaint
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {stage === 'questions' && questions.length > 0 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Additional Information Needed</h1>
            <p className="text-gray-600">
              Please provide more details to complete your FIR. 
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
            
            {extractedData && (
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-700">Incident type identified: {extractedData.type_of_theft}</h3>
                {extractedData.applicable_sections && (
                  <p className="text-sm text-gray-600">Applicable sections: {extractedData.applicable_sections}</p>
                )}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-md bg-white">
              <h3 className="text-lg font-medium mb-2 font-medium text-gray-700">{questions[currentQuestionIndex].question}</h3>
              <textarea
                value={answers[questions[currentQuestionIndex].field] || ''}
                onChange={(e) => handleAnswerChange(questions[currentQuestionIndex].field, e.target.value)}
                placeholder="Your answer..."
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isSubmitting}
              />
            </div>
            
            {error && (
              <div className="flex items-center p-3 text-red-700 bg-red-100 rounded-md">
                <AlertCircle size={18} className="mr-2" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="flex justify-between space-x-4">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0 || isSubmitting}
                className="flex items-center justify-center py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <button
                onClick={handleNextQuestion}
                disabled={isSubmitting || !answers[questions[currentQuestionIndex].field]}
                className="flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader size={18} className="mr-2 animate-spin" />
                    Processing...
                  </>
                ) : currentQuestionIndex === questions.length - 1 ? (
                  <>
                    <Check size={18} className="mr-2" />
                    Submit
                  </>
                ) : (
                  "Next"
                )}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Progress</span>
              <div className="w-64 h-2 mt-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full" 
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {currentQuestionIndex + 1} of {questions.length} questions
            </span>
          </div>
        </div>
      )}
      
      {stage === 'complete' && generatedFIR && (
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check size={24} className="text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">FIR Generated Successfully</h1>
            <p className="text-gray-600">
              Your First Information Report has been generated and is ready for download.
            </p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-4">FIR Summary</h3>
            <dl className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Complainant</dt>
                <dd className="text-sm text-gray-900 col-span-2">{generatedFIR.complainant_name}</dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Incident Type</dt>
                <dd className="text-sm text-gray-900 col-span-2">{generatedFIR.type_of_theft}</dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Date/Time</dt>
                <dd className="text-sm text-gray-900 col-span-2">{generatedFIR.date_time}</dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="text-sm text-gray-900 col-span-2">{generatedFIR.location}</dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Applicable Sections</dt>
                <dd className="text-sm text-gray-900 col-span-2">{generatedFIR.applicable_sections}</dd>
              </div>
            </dl>
          </div>
          
          <button
            onClick={handleDownloadFIR}
            className="flex items-center justify-center w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Download FIR Document (.docx)
          </button>
          
          <button
            onClick={() => {
              setStage('initial');
              setComplaint('');
              setExtractedData(null);
              setQuestions([]);
              setAnswers({});
              setCurrentQuestionIndex(0);
              setGeneratedFIR(null);
              setError(null);
            }}
            className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus size={18} className="mr-2" />
            Submit Another Complaint
          </button>
        </div>
      )}
    </div>
  );
};

export default FIRSubmissionForm;