'use client';

import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SuggestedDoctorCard } from "./SuggestedDoctorCard";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

export function AddNewSessionDialog() {
  const [note, setNote] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDoctors = async () => {
    if (!note.trim()) {
      alert("Please enter some symptoms or details first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/suggest-doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      setDoctors(result);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      alert("Failed to fetch doctor suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Start New Consultation</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Basic Details</DialogTitle>
          <DialogDescription>
            <h2 className="mb-2 text-sm font-medium">Add Symptoms or Any Other Details</h2>
            <Textarea
              placeholder="Describe your symptoms, concerns, or health questions..."
              className="h-[200px] mt-1"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button 
              className="mt-4" 
              onClick={fetchDoctors} 
              disabled={loading || !note.trim()}
            >
              {loading ? "Fetching..." : "Suggest Doctors"}
            </Button>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {doctors.map((doc) => (
            <SuggestedDoctorCard key={doc.id} doctor={doc} note={note} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}