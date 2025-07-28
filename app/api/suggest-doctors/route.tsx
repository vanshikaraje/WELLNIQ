// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   const { note } = await req.json();

//   const doctors = [
//     { id: "doc-1", name: "Dr. Priya Sharma", specialization: "General Physician" },
//     { id: "doc-2", name: "Dr. Arjun Mehta", specialization: "Dermatologist" },
//   ];

//   return NextResponse.json(doctors);
// }
import { NextRequest, NextResponse } from "next/server";

// Mock doctor database with specializations and keywords
const doctorDatabase = [
  {
    id: "doc-1",
    name: "Dr. Priya Sharma",
    specialization: "General Physician",
    keywords: ["fever", "cold", "cough", "headache", "general", "common", "flu", "body ache"]
  },
  {
    id: "doc-2", 
    name: "Dr. Arjun Mehta",
    specialization: "Dermatologist",
    keywords: ["skin", "rash", "acne", "eczema", "dermatitis", "mole", "hair", "nail"]
  },
  {
    id: "doc-3",
    name: "Dr. Kavya Reddy", 
    specialization: "Cardiologist",
    keywords: ["heart", "chest pain", "palpitations", "blood pressure", "cardiac", "cardiovascular"]
  },
  {
    id: "doc-4",
    name: "Dr. Rohit Singh",
    specialization: "Orthopedic Surgeon", 
    keywords: ["bone", "joint", "fracture", "back pain", "knee", "shoulder", "arthritis", "muscle"]
  },
  {
    id: "doc-5",
    name: "Dr. Anita Gupta",
    specialization: "Gynecologist",
    keywords: ["women", "pregnancy", "menstrual", "reproductive", "gynecological", "pelvic"]
  },
  {
    id: "doc-6",
    name: "Dr. Vikram Joshi",
    specialization: "Neurologist", 
    keywords: ["brain", "headache", "migraine", "seizure", "neurological", "memory", "dizziness"]
  },
  {
    id: "doc-7",
    name: "Dr. Sunita Patel",
    specialization: "Pediatrician",
    keywords: ["child", "baby", "infant", "pediatric", "vaccination", "growth", "development"]
  },
  {
    id: "doc-8",
    name: "Dr. Rajesh Kumar",
    specialization: "ENT Specialist",
    keywords: ["ear", "nose", "throat", "sinus", "hearing", "voice", "tonsil", "allergy"]
  }
];

export async function POST(req: NextRequest) {
  try {
    const { note } = await req.json();

    if (!note || typeof note !== 'string') {
      return NextResponse.json(
        { error: "Note is required and must be a string" }, 
        { status: 400 }
      );
    }

    const noteLower = note.toLowerCase();
    
    // Find matching doctors based on keywords
    const matchingDoctors = doctorDatabase.filter(doctor => 
      doctor.keywords.some(keyword => noteLower.includes(keyword))
    );

    // If no specific matches, return general physicians and a few random specialists
    const suggestedDoctors = matchingDoctors.length > 0 
      ? matchingDoctors.slice(0, 3)
      : [
          doctorDatabase[0], // General Physician
          doctorDatabase[1], // Dermatologist  
          doctorDatabase[2]  // Cardiologist
        ];

    return NextResponse.json(suggestedDoctors);
  } catch (error) {
    console.error("Error suggesting doctors:", error);
    return NextResponse.json(
      { error: "Failed to suggest doctors" }, 
      { status: 500 }
    );
  }
}