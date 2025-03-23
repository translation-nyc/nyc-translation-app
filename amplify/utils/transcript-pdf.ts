import {jsPDF} from "jspdf";
import type {BaseTranscriptPart, Font, TranscriptComment} from "./types";

export function createPdf(
    transcriptParts: BaseTranscriptPart[],
    comments: TranscriptComment[],
    font?: Font,
): jsPDF {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth() - 20;
    const pageHeight = pdf.internal.pageSize.getHeight() - 20;

    pdf.setFontSize(16);
    pdf.text("Transcript with comments", 10, 10);

    let fullTranscription = "";
    transcriptParts.forEach((part, partIndex) => {
        part.text.split(" ").forEach((word, textIndex) => {
            const comment = comments.find(comment =>
                comment.index === textIndex
                && comment.partIndex === partIndex
                && !comment.isTranslated
            );
            const text = comment ? `${word} [${comment.text}]` : word;
            fullTranscription += text + " ";
        });

        fullTranscription += "\n";

        part.translatedText.split(" ").forEach((word, translatedTextIndex) => {
            const comment = comments.find(comment =>
                comment.index === translatedTextIndex
                && comment.partIndex === partIndex
                && comment.isTranslated
            );
            const text = comment ? `${word} [${comment.text}]` : word;
            fullTranscription += text + " ";
        });

        fullTranscription += "\n\n";
    });

    if (font !== undefined) {
        const filename = `${font.name}.ttf`;
        pdf.addFileToVFS(filename, font.base64);
        pdf.addFont(filename, font.name, "normal");
        pdf.setFont(font.name);
    }

    pdf.setFontSize(12);

    const lines = pdf.splitTextToSize(fullTranscription.trim(), pageWidth) as string[];

    let y = 20;

    lines.forEach(line => {
        if (y + 10 > pageHeight) {
            pdf.addPage();
            y = 10;
        }
        pdf.text(line, 10, y);
        y += 10;
    });

    return pdf;
}
