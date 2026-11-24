const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MARGIN_MM = 10;

function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

/**
 * Capture a print root to a PDF blob.
 * Clones off-DOM so open dialogs / aria-hidden do not blank the capture.
 * Avoids allowTaint (tainted canvas cannot call toDataURL).
 */
export async function exportPrintRootToPdfBlob(
  element: HTMLElement
): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const host = document.createElement("div");
  host.setAttribute("data-pdf-capture-host", "true");
  host.style.cssText = [
    "position:fixed",
    "left:-10000px",
    "top:0",
    "width:794px",
    "background:#ffffff",
    "color:#000000",
    "z-index:-1",
    "pointer-events:none",
    "opacity:1",
  ].join(";");

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.cssText = [
    "width:794px",
    "max-width:794px",
    "margin:0",
    "padding:24px",
    "background:#ffffff",
    "color:#000000",
    "box-shadow:none",
    "border:none",
    "border-radius:0",
    "position:static",
    "transform:none",
  ].join(";");
  clone.querySelectorAll<HTMLElement>("*").forEach((node) => {
    node.style.boxShadow = "none";
  });

  host.appendChild(clone);
  document.body.appendChild(host);
  await waitForNextFrame();

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      foreignObjectRendering: false,
      imageTimeout: 15_000,
      onclone: (_doc, cloned) => {
        cloned.style.background = "#ffffff";
        cloned.style.color = "#000000";
      },
    });

    if (!canvas.width || !canvas.height) {
      throw new Error("Captured page was empty");
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const usableWidth = A4_WIDTH_MM - MARGIN_MM * 2;
    const usableHeight = A4_HEIGHT_MM - MARGIN_MM * 2;
    const imgWidth = usableWidth;
    const pageCanvasHeight = Math.max(
      1,
      Math.floor((usableHeight * canvas.width) / imgWidth)
    );

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
  } finally {
    host.remove();
  }
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
