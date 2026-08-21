import jsPDF from "jspdf";
import { format } from "date-fns";
import logoWatermark from "@/assets/logo-watermark.png";
import logoDoualaFiesta from "@/assets/logo-douala-fiesta.png";
import { translations } from "./translations";

interface RegistrationData {
  firstName: string;
  lastName: string;
  birthDate: Date;
  age: number;
  height: string;
  birthPlace: string;
  neighborhood: string;
  district: string;
  phone: string;
  occupation: string;
  nationalityCamerounaise: boolean;
  residenceDouala: boolean;
  ageRange: boolean;
  celibataire: boolean;
  disponibilite: boolean;
  representation: boolean;
  hasIdPhoto: boolean;
  hasIdCard: boolean;
  hasParentalAuth: boolean;
}

export async function generateRegistrationPDF(data: RegistrationData, language: "fr" | "en" = "fr"): Promise<void> {
  const t = translations[language];
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = 20;

  // Add watermark (logo in grayscale)
  try {
    const img = new Image();
    img.src = logoWatermark;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    // Create grayscale version
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;

    if (ctx) {
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        const gray = pixels[i] * 0.3 + pixels[i + 1] * 0.59 + pixels[i + 2] * 0.11;
        pixels[i] = gray;
        pixels[i + 1] = gray;
        pixels[i + 2] = gray;
      }

      ctx.putImageData(imageData, 0, 0);
      const grayscaleImage = canvas.toDataURL("image/png");

      // Add watermark centered - larger and more blurred
      doc.addImage(grayscaleImage, "PNG", pageWidth / 2 - 60, pageHeight / 2 - 60, 120, 120, "", "NONE", 0.05);
    }
  } catch (error) {
    console.error("Error adding watermark:", error);
  }

  // Title with logo icon
  try {
    const logoImg = new Image();
    logoImg.src = logoDoualaFiesta;
    await new Promise((resolve) => {
      logoImg.onload = resolve;
    });
    // Add logo icon on the left
    doc.addImage(logoImg, "PNG", margin, yPosition - 3, 15, 15);
  } catch (error) {
    console.error("Error adding logo:", error);
  }

  doc.setFontSize(16);
  doc.setTextColor(98, 49, 19); // Brown color #623113
  const title = t.pdfFormTitle;
  doc.text(title, margin + 18, yPosition + 3);
  yPosition += 7;

  doc.setFontSize(14);
  const subtitle = t.pdfFormSubtitle;
  doc.text(subtitle, margin + 18, yPosition + 3);
  yPosition += 15;

  // Section header style function
  const addSectionHeader = (title: string) => {
    doc.setFillColor(98, 49, 19); // Brown #623113
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 8, 2, 2, "F");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255); // White text
    doc.text(title, margin + 3, yPosition + 5.5);
    yPosition += 12;
    doc.setTextColor(0, 0, 0); // Reset to black
  };

  // Field style function
  const addField = (label: string, value: string) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${label}`, margin + 3, yPosition);
    doc.setFont("helvetica", "normal");
    const labelWidth = doc.getTextWidth(`${label}`);
    doc.text(` : ${value}`, margin + 3 + labelWidth, yPosition);
    yPosition += 6;
  };

  // ETAT CIVIL
  addSectionHeader(t.pdfEtatCivil);
  addField(t.pdfNom, data.lastName);
  addField(t.pdfPrenom, data.firstName);
  addField(t.pdfDateNaissance, format(data.birthDate, "dd/MM/yyyy"));
  addField(t.pdfLieuNaissance, data.birthPlace);
  yPosition += 5;

  // COORDONNÉES
  addSectionHeader(t.pdfCoordonnees);
  addField(t.pdfQuartier, data.neighborhood);
  addField(t.pdfArrondissement, data.district);
  addField(t.pdfTelephone, data.phone);
  yPosition += 5;

  // CARACTÉRISTIQUES
  addSectionHeader(t.pdfCaracteristiques);
  addField(t.pdfAge, `${data.age} ${t.pdfAns}`);
  addField(t.pdfTaille, `${data.height} ${t.pdfCm}`);
  addField(t.pdfProfession, data.occupation);
  yPosition += 5;

  // ENGAGEMENTS
  addSectionHeader(t.pdfEngagements);

  // Checkboxes
  doc.setFontSize(9);
  const addCheckbox = (label: string, checked: boolean) => {
    // Checkbox square
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.rect(margin + 3, yPosition - 3, 4, 4);
    if (checked) {
      doc.setFontSize(11);
      doc.text("X", margin + 3.8, yPosition + 0.5);
      doc.setFontSize(9);
    }
    doc.text(label, margin + 9, yPosition);
    yPosition += 5;
  };

  addCheckbox(t.nationalityCamerounaise, data.nationalityCamerounaise);
  addCheckbox(t.residenceDouala, data.residenceDouala);
  addCheckbox(t.ageRange, data.ageRange);
  addCheckbox(t.celibataire, data.celibataire);
  addCheckbox(t.disponibilite, data.disponibilite);
  addCheckbox(t.representation, data.representation);

  yPosition += 3;

  // Documents fournis
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(t.pdfDocumentsFournis, margin + 3, yPosition);
  yPosition += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  addCheckbox(t.pdfPhotoIdentite, data.hasIdPhoto);
  addCheckbox(t.pdfPhotocopieCI, data.hasIdCard);
  if (data.age < 21) {
    addCheckbox(t.pdfAutorisationParentale, data.hasParentalAuth);
  }

  yPosition += 5;

  // Engagement text
  doc.setFontSize(9);
  const engagementText = `${t.pdfEngagementText} ${data.firstName} ${data.lastName}${t.pdfEngagementTextEnd}`;

  const splitText = doc.splitTextToSize(engagementText, pageWidth - 2 * margin - 6);
  doc.text(splitText, margin + 3, yPosition);
  yPosition += splitText.length * 5 + 10;

  // Signature box
  const signatureBoxHeight = pageHeight - yPosition - margin;
  doc.setFillColor(236, 217, 206); // Color #ECD9CE
  doc.rect(pageWidth - margin - 60, yPosition, 55, signatureBoxHeight, "F");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(t.pdfSignature, pageWidth - margin - 57, yPosition + 5);
  doc.text(t.pdfSignature2, pageWidth - margin - 57, yPosition + 10);

  // ============ PAGE 2 - RÈGLEMENT INTÉRIEUR ============
  doc.addPage();
  yPosition = 20;

  // Add watermark on page 2
  try {
    const img = new Image();
    img.src = logoWatermark;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;

    if (ctx) {
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        const gray = pixels[i] * 0.3 + pixels[i + 1] * 0.59 + pixels[i + 2] * 0.11;
        pixels[i] = gray;
        pixels[i + 1] = gray;
        pixels[i + 2] = gray;
      }

      ctx.putImageData(imageData, 0, 0);
      const grayscaleImage = canvas.toDataURL("image/png");
      doc.addImage(grayscaleImage, "PNG", pageWidth / 2 - 60, pageHeight / 2 - 60, 120, 120, "", "NONE", 0.05);
    }
  } catch (error) {
    console.error("Error adding watermark on page 2:", error);
  }

  // Title with logo on page 2
  try {
    const logoImg = new Image();
    logoImg.src = logoDoualaFiesta;
    await new Promise((resolve) => {
      logoImg.onload = resolve;
    });
    doc.addImage(logoImg, "PNG", margin, yPosition - 3, 15, 15);
  } catch (error) {
    console.error("Error adding logo on page 2:", error);
  }

  doc.setFontSize(16);
  doc.setTextColor(98, 49, 19);
  doc.text(t.pdfReglementTitle, margin + 18, yPosition + 3);
  yPosition += 7;

  doc.setFontSize(14);
  doc.text(t.pdfReglementSubtitle, margin + 18, yPosition + 3);
  yPosition += 10;

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(t.pdfReglementPeriode, margin + 18, yPosition + 3);
  yPosition += 10;

  // Helper function for article content
  const addArticleText = (text: string, isBold: boolean = false) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    const splitText = doc.splitTextToSize(text, pageWidth - 2 * margin - 6);
    doc.text(splitText, margin + 3, yPosition);
    yPosition += splitText.length * 4.5;
  };

  const addAlineaText = (title: string, text: string) => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    const splitTitle = doc.splitTextToSize(title, pageWidth - 2 * margin - 6);
    doc.text(splitTitle, margin + 5, yPosition);
    yPosition += splitTitle.length * 4;
    doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(text, pageWidth - 2 * margin - 6);
    doc.text(splitText, margin + 5, yPosition);
    yPosition += splitText.length * 4;
  };

  // Article 1
  addArticleText(t.pdfArticle1Title, true);
  yPosition += 2;
  addArticleText(t.pdfArticle1Text);
  yPosition += 3;

  // Article 2
  addArticleText(t.pdfArticle2Title, true);
  yPosition += 2;
  addAlineaText(t.pdfArticle2Alinea1Title, t.pdfArticle2Alinea1Text);
  addAlineaText(t.pdfArticle2Alinea2Title, t.pdfArticle2Alinea2Text);
  addAlineaText(t.pdfArticle2Alinea3Title, t.pdfArticle2Alinea3Text);
  addAlineaText(t.pdfArticle2Alinea4Title, t.pdfArticle2Alinea4Text);
  addAlineaText(t.pdfArticle2Alinea5Title, t.pdfArticle2Alinea5Text);
  yPosition += 3;

  // Article 2 bis
  addArticleText(t.pdfArticle2bisTitle, true);
  yPosition += 2;
  addArticleText(t.pdfArticle2bisText);
  yPosition += 3;

  // Article 3
  addArticleText(t.pdfArticle3Title, true);
  yPosition += 2;
  addAlineaText(t.pdfArticle3Alinea1Title, t.pdfArticle3Alinea1Text);
  addAlineaText(t.pdfArticle3Alinea2Title, t.pdfArticle3Alinea2Text);
  addAlineaText(t.pdfArticle3Alinea3Title, t.pdfArticle3Alinea3Text);
  addAlineaText(t.pdfArticle3Alinea4Title, t.pdfArticle3Alinea4Text);
  yPosition += 3;

  // Article 4
  addArticleText(t.pdfArticle4Title, true);
  yPosition += 2;
  addAlineaText(t.pdfArticle4Alinea1Title, t.pdfArticle4Alinea1Text);
  addAlineaText(t.pdfArticle4Alinea2Title, t.pdfArticle4Alinea2Text);
  addAlineaText(t.pdfArticle4Alinea3Title, t.pdfArticle4Alinea3Text);
  yPosition += 3;

  // ============ PAGE 3 - RÈGLEMENT INTÉRIEUR ============
  doc.addPage();
  yPosition = 20;

  // Add watermark on page 2
  try {
    const img = new Image();
    img.src = logoWatermark;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;

    if (ctx) {
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        const gray = pixels[i] * 0.3 + pixels[i + 1] * 0.59 + pixels[i + 2] * 0.11;
        pixels[i] = gray;
        pixels[i + 1] = gray;
        pixels[i + 2] = gray;
      }

      ctx.putImageData(imageData, 0, 0);
      const grayscaleImage = canvas.toDataURL("image/png");
      doc.addImage(grayscaleImage, "PNG", pageWidth / 2 - 60, pageHeight / 2 - 60, 120, 120, "", "NONE", 0.05);
    }
  } catch (error) {
    console.error("Error adding watermark on page 2:", error);
  }

  // Title with logo on page 2
  try {
    const logoImg = new Image();
    logoImg.src = logoDoualaFiesta;
    await new Promise((resolve) => {
      logoImg.onload = resolve;
    });
    doc.addImage(logoImg, "PNG", margin, yPosition - 3, 15, 15);
  } catch (error) {
    console.error("Error adding logo on page 2:", error);
  }

  doc.setFontSize(16);
  doc.setTextColor(98, 49, 19);
  doc.text(t.pdfReglementTitle, margin + 18, yPosition + 3);
  yPosition += 7;

  doc.setFontSize(14);
  doc.text(t.pdfReglementSubtitle, margin + 18, yPosition + 3);
  yPosition += 10;

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(t.pdfReglementPeriode, margin + 18, yPosition + 3);
  yPosition += 10;

  // Article 5
  addArticleText(t.pdfArticle5Title, true);
  yPosition += 2;
  addAlineaText(t.pdfArticle5Alinea1Title, t.pdfArticle5Alinea1Text);
  addAlineaText(t.pdfArticle5Alinea2Title, t.pdfArticle5Alinea2Text);
  yPosition += 3;

  // Article 6
  addArticleText(t.pdfArticle6Title, true);
  yPosition += 2;
  addArticleText(t.pdfArticle6Text);
  yPosition += 3;

  // Article 7
  addArticleText(t.pdfArticle7Title, true);
  yPosition += 2;
  addAlineaText(t.pdfArticle7Alinea1Title, t.pdfArticle7Alinea1Text);
  addAlineaText(t.pdfArticle7Alinea2Title, t.pdfArticle7Alinea2Text);
  yPosition += 3;

  // Article 8
  addArticleText(t.pdfArticle8Title, true);
  yPosition += 2;
  addArticleText(t.pdfArticle8Text);
  yPosition += 5;

  // Fait à Douala
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(`${t.pdfFaitA} ……………………`, margin + 3, yPosition);
  yPosition += 10;

  // Signature box on page 3
  const signatureBoxHeightPage3 = pageHeight - yPosition - 6 * margin;
  const signatureBoxX = pageWidth - margin - 60;
  doc.setFillColor(236, 217, 206);
  doc.rect(signatureBoxX, yPosition, 55, signatureBoxHeightPage3, "F");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(t.pdfSignature, signatureBoxX + 3, yPosition + 5);
  doc.text(t.pdfSignature2, signatureBoxX + 3, yPosition + 10);

  // Save PDF
  const fileName = `inscription_${data.lastName}_${data.firstName}_${format(new Date(), "yyyyMMdd")}.pdf`;
  doc.save(fileName);
}
