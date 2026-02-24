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

function safeText(v) {
  const s = (v || "").trim();
  return s.length ? s : "—";
}

function updateQR() {
  const qrBox = document.getElementById("qrBox");
  qrBox.innerHTML = "";

  // QR content = venue location name
  const venueQRText = "Joypurhat Govt. College";

  new QRCode(qrBox, {
    text: venueQRText,
    width: 98,
    height: 98
  });
}

function updatePreview() {
  pName.textContent = safeText(nameEl.value);
  pInstitution.textContent = safeText(institutionEl.value);
  pRoll.textContent = safeText(rollEl.value);
  pCategory.textContent = safeText(categoryEl.value);
  pMobile.textContent = safeText(mobileEl.value);
  updateQR();
}

function validateRequired() {
  if (!nameEl.value.trim()) return "Full Name is required.";
  if (!institutionEl.value.trim()) return "Institution is required.";
  if (!rollEl.value.trim()) return "Roll/ID is required.";
  if (!categoryEl.value.trim()) return "Category is required.";
  if (!mobileEl.value.trim()) return "Mobile No. is required.";
  return "";
}

photoEl.addEventListener("change", () => {
  const file = photoEl.files && photoEl.files[0];
  if (!file) return;

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

downloadBtn.addEventListener("click", async () => {
  const err = validateRequired();
  if (err) return alert(err);

  updatePreview();

  const card = document.getElementById("admitCard");
  const canvas = await html2canvas(card, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const maxW = pageWidth - margin * 2;

  const imgProps = pdf.getImageProperties(imgData);
  const imgRatio = imgProps.width / imgProps.height;

  let w = maxW;
  let h = w / imgRatio;

  if (h > pageHeight - margin * 2) {
    h = pageHeight - margin * 2;
    w = h * imgRatio;
  }

  const x = (pageWidth - w) / 2;
  const y = 12;

  pdf.addImage(imgData, "PNG", x, y, w, h);

  // open in new tab
  const blobUrl = pdf.output("bloburl");
  window.open(blobUrl, "_blank");

  // download
  const filenameRoll = rollEl.value.trim().replace(/\s+/g, "_");
  pdf.save(`JSO_Admit_${filenameRoll}.pdf`);
});

// live preview
[nameEl, institutionEl, rollEl, categoryEl, mobileEl].forEach((el) => {
  el.addEventListener("input", () => updatePreview());
});

updatePreview();