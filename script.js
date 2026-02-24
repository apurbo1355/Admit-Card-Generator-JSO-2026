const nameEl = document.getElementById("name");
const institutionEl = document.getElementById("institution");
const rollEl = document.getElementById("roll");
const categoryEl = document.getElementById("category");
const mobileEl = document.getElementById("mobile");
const photoEl = document.getElementById("photo");

const pName = document.getElementById("pName");
const pInstitution = document.getElementById("pInstitution");
const pRoll = document.getElementById("pRoll");
const pCategory = document.getElementById("pCategory");
const pMobile = document.getElementById("pMobile");

const photoPreview = document.getElementById("photoPreview");
const photoFallback = document.getElementById("photoFallback");

const previewBtn = document.getElementById("previewBtn");
const downloadBtn = document.getElementById("downloadBtn");

function safeText(v){
  const s = (v || "").trim();
  return s.length ? s : "—";
}

function updateQR(){
  const qrBox = document.getElementById("qrBox");
  qrBox.innerHTML = "";

  // Put venue name (or google maps link) inside QR
  const venueText = "Joypurhat Govt. College";

  new QRCode(qrBox, {
    text: venueText,
    width: 98,
    height: 98
  });
}

function updatePreview(){
  pName.textContent = safeText(nameEl.value);
  pInstitution.textContent = safeText(institutionEl.value);
  pRoll.textContent = safeText(rollEl.value);
  pCategory.textContent = safeText(categoryEl.value);
  pMobile.textContent = safeText(mobileEl.value);
  updateQR();
}

function validateRequired(){
  if (!nameEl.value.trim()) return "Full Name is required.";
  if (!institutionEl.value.trim()) return "Institution is required.";
  if (!rollEl.value.trim()) return "Roll/ID is required.";
  if (!categoryEl.value.trim()) return "Category is required.";
  if (!mobileEl.value.trim()) return "Mobile No. is required.";
  return "";
}

photoEl.addEventListener("change", () => {
  const file = photoEl.files && photoEl.files[0];
  if (!file) {
    photoPreview.style.display = "none";
    photoFallback.style.display = "grid";
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    photoPreview.src = e.target.result;
    photoPreview.style.display = "block";
    photoFallback.style.display = "none";
  };
  reader.readAsDataURL(file);
});

previewBtn.addEventListener("click", () => {
  const err = validateRequired();
  if (err) return alert(err);
  updatePreview();
});

/**
 * ✅ PDF Export Rules (A4 Landscape)
 * - temporarily apply export-a4 width (wide like A4)
 * - capture with html2canvas
 * - put into jsPDF A4 landscape with tiny margins
 * - fit to page to cover almost full A4
 */
downloadBtn.addEventListener("click", async () => {
  const err = validateRequired();
  if (err) return alert(err);

  updatePreview();

  const card = document.getElementById("admitCard");

  // Apply wide export layout
  card.classList.add("export-a4");
  await new Promise(r => setTimeout(r, 80)); // allow CSS apply

  const canvas = await html2canvas(card, {
    scale: 3,
    backgroundColor: "#ffffff",
    useCORS: true
  });

  // Restore normal
  card.classList.remove("export-a4");

  const imgData = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;

  // A4 landscape: 297 x 210 mm
  const pdf = new jsPDF("l", "mm", "a4");
  const pageW = 297;
  const pageH = 210;

  // Tiny printer-safe margin
  const margin = 4;
  const maxW = pageW - margin * 2;
  const maxH = pageH - margin * 2;

  const imgRatio = canvas.width / canvas.height;

  // Fit-to-page (max coverage)
  let drawW = maxW;
  let drawH = drawW / imgRatio;
  if (drawH > maxH){
    drawH = maxH;
    drawW = drawH * imgRatio;
  }

  const x = (pageW - drawW) / 2;
  const y = (pageH - drawH) / 2;

  pdf.addImage(imgData, "PNG", x, y, drawW, drawH);

  // Open + Download
  const blobUrl = pdf.output("bloburl");
  window.open(blobUrl, "_blank");

  const filenameRoll = rollEl.value.trim().replace(/\s+/g, "_");
  pdf.save(`JSO_Admit_${filenameRoll}_A4.pdf`);
});

// Live preview update while typing
[nameEl, institutionEl, rollEl, categoryEl, mobileEl].forEach(el => {
  el.addEventListener("input", updatePreview);
});

updateQR();
updatePreview();