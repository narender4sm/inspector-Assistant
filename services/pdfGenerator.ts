import { jsPDF } from "jspdf";
import { getAllEquipment, getEquipmentHistory } from "./mockDatabase";
import { Equipment, Inspection } from "../types";

export const generatePDFReport = (items: {id: string, name: string, type: string, location: string}[]) => {
  const doc = new jsPDF();
  
  // 1. Group by Type
  const presentTypes = Array.from(new Set(items.map(i => i.type))).sort();
  
  const equipmentByType: Record<string, typeof items> = {};
  presentTypes.forEach(type => {
    equipmentByType[type] = items.filter(e => e.type === type);
  });

  let yPos = 20;
  const lineHeight = 6;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const pageWidth = doc.internal.pageSize.width;
  const contentWidth = pageWidth - (margin * 2);

  // Helper for adding text with page break check
  const addText = (text: string, fontSize: number = 10, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setTextColor(color[0], color[1], color[2]);
    
    const splitText = doc.splitTextToSize(text, contentWidth);
    
    // Check if we need a page break
    if (yPos + (splitText.length * lineHeight) > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.text(splitText, margin, yPos);
    yPos += (splitText.length * lineHeight);
    return splitText.length;
  };

  const addLine = () => {
     if (yPos + 5 > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
  };

  // --- PDF Content ---

  // Title Page
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  
  // Dynamic Title Logic
  let title = "Inspection Report";
  if (items.length === 1) {
    title = `Report: ${items[0].name}`;
  } else if (items.length > 1) {
    title = "Inspection Report (Batch)";
  }
  
  doc.text(title, pageWidth / 2, 100, { align: "center" });
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 115, { align: "center" });
  doc.text("Source: InspectorAI Database", pageWidth / 2, 125, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Total Records: ${items.length}`, pageWidth / 2, 135, { align: "center" });
  
  doc.addPage();
  yPos = margin;

  // Loop through each type
  presentTypes.forEach(type => {
    const selected = equipmentByType[type] || [];
    if (selected.length === 0) return;

    // Section Header (Only show category if we have multiple types or items)
    if (items.length > 1) {
      if (yPos > pageHeight - 50) { doc.addPage(); yPos = margin; }
      
      doc.setFillColor(240, 253, 244); // Light Emerald
      doc.rect(0, yPos - 5, pageWidth, 20, 'F');
      
      addText(`Category: ${type}`, 16, true, [5, 150, 105]); // Emerald text
      yPos += 5; 
    }
    
    selected.forEach((simpleEq, index) => {
      const fullEq = getEquipmentHistory(simpleEq.id);
      if (!fullEq || fullEq.inspections.length === 0) return;
      const latest = fullEq.inspections[0];

      // Item Header
      yPos += 5;
      addText(`${index + 1}. ${fullEq.name} (${fullEq.id})`, 12, true);
      addText(`Location: ${fullEq.location}`, 10, false, [100, 116, 139]); // Slate-500
      yPos += 2;

      // Inspection Details
      addText(`Latest Inspection: ${latest.date}   |   Status: ${latest.status}`, 10, true);
      
      // Severity Color Coding
      let sevColor: [number, number, number] = [0, 0, 0];
      if (latest.severity === 'Critical') sevColor = [220, 38, 38]; // Red
      else if (latest.severity === 'High') sevColor = [234, 88, 12]; // Orange
      
      addText(`Severity: ${latest.severity}`, 10, true, sevColor);
      addText(`Inspector: ${latest.inspector}`);
      
      yPos += 2;
      addText("Findings:", 10, true);
      addText(latest.findings, 10, false, [50, 50, 50]);
      
      yPos += 2;
      addText("Recommendations:", 10, true);
      addText(latest.recommendations, 10, false, [50, 50, 50]);

      yPos += 5;
      addLine();
    });

    // If batch, add page between types
    if (items.length > 1) {
        doc.addPage();
        yPos = margin;
    }
  });

  const fileName = items.length === 1 
    ? `Report_${items[0].id}.pdf` 
    : "InspectorAI_Batch_Report.pdf";
    
  doc.save(fileName);
};