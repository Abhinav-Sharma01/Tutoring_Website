import PDFDocument from "pdfkit";

const generateCertificate = async (req, res) => {
  const { courseTitle, studentName } = req.body;

  const doc = new PDFDocument({ size: "A4", layout: "landscape" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=certificate.pdf");

  doc.pipe(res);

  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

  doc.fontSize(30).text("Certificate of Completion", {
    align: "center",
  });

  doc.moveDown(2);

  doc.fontSize(18).text("This certifies that", { align: "center" });

  doc.moveDown();

  doc.fontSize(24).text(studentName, { align: "center" });

  doc.moveDown();

  doc.fontSize(18).text("has successfully completed the course", {
    align: "center",
  });

  doc.moveDown();

  doc.fontSize(22).text(courseTitle, { align: "center" });

  doc.moveDown(3);

  doc.fontSize(14).text("____________________", 100, doc.page.height - 100);
  doc.text("Instructor Signature", 100, doc.page.height - 80);

  doc.end();
};

export { generateCertificate };
