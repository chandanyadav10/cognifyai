const pdfParse = require("pdf-parse");

/**
 * Extract text from PDF buffer
 * @param {Buffer} buffer - PDF file buffer
 */
const extractPdfText = async (buffer) => {
  const data = await pdfParse(buffer);
  if (!data.text || data.text.trim().length < 50) {
    throw new Error("Could not extract meaningful text from PDF");
  }
  return data.text.trim();
};

module.exports = { extractPdfText };
