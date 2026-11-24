const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MARGIN_MM = 10;

export async function exportPrintRootToPdfBlob(
  element: HTMLElement
): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
    scrollX: 0,
    scrollY: -window.scrollY,
  });

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const usableWidth = A4_WIDTH_MM - MARGIN_MM * 2;
  const usableHeight = A4_HEIGHT_MM - MARGIN_MM * 2;
  const imgWidth = usableWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const pageCanvasHeight = (usableHeight * canvas.width) / imgWidth;

  let renderedHeight = 0;
  let pageIndex = 0;

  while (renderedHeight < canvas.height) {
    const sliceHeight = Math.min(
      pageCanvasHeight,
      canvas.height - renderedHeight
    );
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = Math.max(1, Math.floor(sliceHeight));

    const ctx = pageCanvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not create PDF canvas context");
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    ctx.drawImage(
      canvas,
      0,
      renderedHeight,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight
    );

    const pageData = pageCanvas.toDataURL("image/png");
    const sliceHeightMm = (sliceHeight * imgWidth) / canvas.width;

    if (pageIndex > 0) {
      pdf.addPage();
    }

    pdf.addImage(
      pageData,
      "PNG",
      MARGIN_MM,
      MARGIN_MM,
      imgWidth,
      sliceHeightMm
    );

    renderedHeight += sliceHeight;
    pageIndex += 1;
  }

  return pdf.output("blob");
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
