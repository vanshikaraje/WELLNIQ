import { NextRequest, NextResponse } from "next/server";

const REPORT_GEN_PROMPT = `You are an AI Medical Assistant generating a comprehensive medical report based on a patient consultation. 

Analyze the conversation between the patient and doctor to create a detailed medical report in JSON format.

Generate a structured medical report with the following sections:
1. Patient Summary
2. Chief Complaints 
3. Symptoms Discussed
4. Preliminary Assessment
5. Recommendations
6. Follow-up Instructions
7. Medications/Treatment Suggested
8. Risk Factors Identified

Return the response in this exact JSON format:
{
  "patientSummary": "Brief overview of patient condition",
  "chiefComplaints": ["complaint1", "complaint2"],
  "symptoms": ["symptom1", "symptom2"],
  "assessment": "Preliminary medical assessment",
  "recommendations": ["recommendation1", "recommendation2"],
  "followUp": "Follow-up instructions",
  "medications": ["medication1", "medication2"],
  "riskFactors": ["risk1", "risk2"],
  "reportDate": "ISO date string",
  "consultationSummary": "Detailed summary of the consultation"
}`;

export async function POST(req: NextRequest) {
  try {
    const { sessionId, sessionDetails, messages } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "No conversation data available for report generation" },
        { status: 400 }
      );
    }

    console.log("📋 Generating report for session:", sessionId);
    console.log("💬 Messages received:", messages.length);

    const conversationText = messages
      .map((msg: { role: string; text: string }) => `${msg.role}: ${msg.text}`)
      .join('\n');

    // Enhanced report generation with better data extraction
    const reportData = {
      id: `report-${sessionId}-${Date.now()}`,
      sessionId: sessionId.toString(),
      patientSummary: generatePatientSummary(messages),
      chiefComplaints: extractComplaints(messages),
      symptoms: extractSymptoms(messages),
      assessment: generateAssessment(messages),
      recommendations: generateRecommendations(messages),
      followUp: generateFollowUp(messages),
      medications: extractMedications(messages),
      riskFactors: extractRiskFactors(messages),
      reportDate: new Date().toISOString(),
      consultationSummary: conversationText,
    };

    console.log("📝 Generated Medical Report:");
    console.dir(reportData, { depth: null });

    return NextResponse.json({
      success: true,
      report: reportData,
      message: "Medical report generated successfully"
    });

  } catch (error) {
    console.error("❌ Error generating medical report:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to generate medical report",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

function generatePatientSummary(messages: { role: string; text: string }[]): string {
  const userMessages = messages.filter(msg => msg.role === 'user');
  if (userMessages.length === 0) {
    return "Patient participated in voice consultation session.";
  }
  
  const firstMessage = userMessages[0]?.text || "";
  const concernsCount = userMessages.length;
  
  return `Patient engaged in ${concernsCount} exchanges during voice consultation. Initial concern: "${firstMessage.substring(0, 100)}${firstMessage.length > 100 ? '...' : ''}". Patient was responsive and provided detailed information about their health concerns.`;
}

function generateAssessment(messages: { role: string; text: string }[]): string {
  const doctorMessages = messages.filter(msg => msg.role === 'assistant' || msg.role === 'doctor');
  const userMessages = messages.filter(msg => msg.role === 'user');
  
  if (doctorMessages.length === 0) {
    return "Consultation completed. Further clinical evaluation recommended.";
  }
  
  // Look for assessment-related keywords in doctor responses
  const assessmentKeywords = ['diagnosis', 'condition', 'appears', 'likely', 'suggest', 'indicate'];
  const assessmentMessages = doctorMessages.filter(msg => 
    assessmentKeywords.some(keyword => msg.text.toLowerCase().includes(keyword))
  );
  
  if (assessmentMessages.length > 0) {
    return `Based on the consultation: ${assessmentMessages[0].text.substring(0, 200)}${assessmentMessages[0].text.length > 200 ? '...' : ''}`;
  }
  
  return `Comprehensive consultation completed with ${userMessages.length} patient interactions. Clinical assessment based on reported symptoms and patient history. Recommend follow-up for detailed examination.`;
}

function generateRecommendations(messages: { role: string; text: string }[]): string[] {
  const doctorMessages = messages.filter(msg => msg.role === 'assistant' || msg.role === 'doctor');
  const recommendations: string[] = [];
  
  // Look for recommendation keywords
  const recKeywords = ['recommend', 'suggest', 'should', 'try', 'consider', 'advice'];
  
  doctorMessages.forEach(msg => {
    const text = msg.text.toLowerCase();
    if (recKeywords.some(keyword => text.includes(keyword))) {
      // Extract sentence containing recommendation
      const sentences = msg.text.split(/[.!?]+/);
      sentences.forEach(sentence => {
        if (recKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
          recommendations.push(sentence.trim());
        }
      });
    }
  });
  
  if (recommendations.length === 0) {
    return [
      "Continue monitoring symptoms",
      "Schedule follow-up appointment if symptoms persist",
      "Maintain healthy lifestyle habits",
      "Contact healthcare provider if condition worsens"
    ];
  }
  
  return recommendations.slice(0, 5); // Limit to 5 recommendations
}

function generateFollowUp(messages: { role: string; text: string }[]): string {
  const doctorMessages = messages.filter(msg => msg.role === 'assistant' || msg.role === 'doctor');
  
  // Look for follow-up related content
  const followUpKeywords = ['follow up', 'follow-up', 'next appointment', 'see you', 'return', 'check back'];
  
  for (const msg of doctorMessages) {
    const text = msg.text.toLowerCase();
    if (followUpKeywords.some(keyword => text.includes(keyword))) {
      return msg.text.substring(0, 150) + (msg.text.length > 150 ? '...' : '');
    }
  }
  
  return "Follow up in 1-2 weeks or sooner if symptoms worsen. Contact healthcare provider if you have any concerns.";
}

function extractMedications(messages: { role: string; text: string }[]): string[] {
  const medications: string[] = [];
  const medKeywords = ['medication', 'medicine', 'drug', 'prescription', 'take', 'tablet', 'capsule', 'mg', 'dose'];
  
  messages.forEach(msg => {
    const text = msg.text.toLowerCase();
    if (medKeywords.some(keyword => text.includes(keyword))) {
      // Look for common medication patterns
      const medPatterns = [
        /\b\w+\s*\d+\s*mg\b/gi,
        /\btake\s+[\w\s]+/gi,
        /\bprescription\s+[\w\s]+/gi
      ];
      
      medPatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
          medications.push(...matches.map(m => m.trim()));
        }
      });
    }
  });
  
  return medications.length > 0 ? medications : ["No specific medications discussed during consultation"];
}

function extractRiskFactors(messages: { role: string; text: string }[]): string[] {
  const riskFactors: string[] = [];
  const riskKeywords = ['risk', 'factor', 'concern', 'warning', 'caution', 'avoid', 'dangerous'];
  
  messages.forEach(msg => {
    const text = msg.text.toLowerCase();
    if (riskKeywords.some(keyword => text.includes(keyword))) {
      riskFactors.push(msg.text.substring(0, 100) + (msg.text.length > 100 ? '...' : ''));
    }
  });
  
  if (riskFactors.length === 0) {
    return ["Standard health precautions apply", "Monitor for symptom changes"];
  }
  
  return riskFactors.slice(0, 3); // Limit to 3 risk factors
}

function extractComplaints(messages: { role: string; text: string }[]): string[] {
  const userMessages = messages.filter(msg => msg.role === 'user');
  const complaints: string[] = [];

  userMessages.forEach(msg => {
    const text = msg.text.toLowerCase();
    if (text.includes('pain') || text.includes('hurt') || text.includes('ache')) {
      complaints.push('Pain-related symptoms');
    }
    if (text.includes('fever') || text.includes('temperature') || text.includes('hot')) {
      complaints.push('Fever/Temperature concerns');
    }
    if (text.includes('headache') || text.includes('head')) {
      complaints.push('Headache');
    }
    if (text.includes('tired') || text.includes('fatigue') || text.includes('exhausted')) {
      complaints.push('Fatigue/Tiredness');
    }
    if (text.includes('cough') || text.includes('coughing')) {
      complaints.push('Cough');
    }
    if (text.includes('cold') || text.includes('flu')) {
      complaints.push('Cold/Flu symptoms');
    }
    if (text.includes('nausea') || text.includes('sick') || text.includes('vomit')) {
      complaints.push('Nausea/Digestive issues');
    }
    if (text.includes('dizzy') || text.includes('lightheaded')) {
      complaints.push('Dizziness');
    }
    if (text.includes('breath') || text.includes('breathing')) {
      complaints.push('Breathing difficulties');
    }
  });

  // Remove duplicates
  const uniqueComplaints = [...new Set(complaints)];
  return uniqueComplaints.length > 0 ? uniqueComplaints : ['General health consultation'];
}

function extractSymptoms(messages: { role: string; text: string }[]): string[] {
  const userMessages = messages.filter(msg => msg.role === 'user');
  const symptoms: string[] = [];

  userMessages.forEach(msg => {
    const text = msg.text.toLowerCase();
    if (text.includes('cough') || text.includes('coughing')) {
      symptoms.push('Cough');
    }
    if (text.includes('sore throat') || text.includes('throat')) {
      symptoms.push('Sore throat');
    }
    if (text.includes('nausea') || text.includes('sick')) {
      symptoms.push('Nausea');
    }
    if (text.includes('dizzy') || text.includes('dizziness')) {
      symptoms.push('Dizziness');
    }
    if (text.includes('shortness of breath') || text.includes('breathing')) {
      symptoms.push('Breathing difficulties');
    }
    if (text.includes('fever') || text.includes('temperature')) {
      symptoms.push('Fever');
    }
    if (text.includes('headache') || text.includes('head pain')) {
      symptoms.push('Headache');
    }
    if (text.includes('fatigue') || text.includes('tired')) {
      symptoms.push('Fatigue');
    }
    if (text.includes('pain')) {
      symptoms.push('Pain');
    }
    if (text.includes('swelling') || text.includes('swollen')) {
      symptoms.push('Swelling');
    }
  });

  // Remove duplicates
  const uniqueSymptoms = [...new Set(symptoms)];
  return uniqueSymptoms.length > 0 ? uniqueSymptoms : ['Various symptoms discussed during consultation'];
}