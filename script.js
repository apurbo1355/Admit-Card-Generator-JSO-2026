const $ = (id) => document.getElementById(id);

const inputs = {
  fullName: $("fullName"),
  institution: $("institution"),
  rollId: $("rollId"),
  category: $("category"),
  mobile: $("mobile"),
  photoInput: $("photoInput"),
};

const preview = {
  pFullName: $("pFullName"),
  pInstitution: $("pInstitution"),
  pRollId: $("pRollId"),
  pCategory: $("pCategory"),
  pMobile: $("pMobile"),
  photoPreview: $("photoPreview"),
  photoPlaceholder: $("photoPlaceholder"),
};

const admitCardEl = $("admitCard");
const btnPreview = $("btnPreview");
const btnDownload = $("btnDownload");

function safeText(v){
  const t = (v || "").trim();
  return t.length ? t : "—";
}

function updatePreview(){
  preview.pFullName.textContent = safeText(inputs.fullName.value);
  preview.pInstitution.textContent = safeText(inputs.institution.value);
  preview.pRollId.textContent = safeText(inputs.rollId.value);
  preview.pCategory.textContent = safeText(inputs.category.value);
  preview.pMobile.textContent = safeText(inputs.mobile.value);
}

["fullName","institution","rollId","category","mobile"].forEach((k)=>{
  inputs[k].addEventListener("input", updatePreview);
  inputs[k].addEventListener("change", updatePreview);
});

inputs.photoInput.addEventListener("change", (e)=>{
  const file = e.target.files && e.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    preview.photoPreview.src = reader.result;
    preview.photoPreview.style.display = "block";
    preview.photoPlaceholder.style.display = "none";
  };
  reader.readAsDataURL(file);
});

btnPreview.addEventListener("click", ()=>{
  updatePreview();
  admitCardEl.scrollIntoView({behavior:"smooth", block:"start"});
});

function validateRequired(){
  const required = [
    {el: inputs.fullName, name:"Full Name"},
    {el: inputs.institution, name:"Institution"},
    {el: inputs.rollId, name:"Roll / ID"},
    {el: inputs.category, name:"Category"},
    {el: inputs.mobile, name:"Mobile No."},
  ];

  for(const r of required){
    const val = (r.el.value || "").trim();
    if(!val){
      alert(`Please fill: ${r.name}`);
      r.el.focus();
      return false;
    }
  }
  return true;
}

/* 🔥 Wait until all images inside admit card load */
async function waitForImages(rootEl){
  const imgs = [...rootEl.querySelectorAll("img")].filter(img => img.src);
  await Promise.all(imgs.map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(res => {
      img.onload = img.onerror = res;
    });
  }));
}

btnDownload.addEventListener("click", async () => {

  updatePreview();
  if (!validateRequired()) return;

  document.body.classList.add("exporting");

  await new Promise(r => setTimeout(r, 300));
  await waitForImages(admitCardEl);

  const { jsPDF } = window.jspdf;

  const isMobile = window.innerWidth < 600;
  const scaleValue = isMobile ? 1.5 : 2;

  try {
    const canvas = await html2canvas(admitCardEl, {
      scale: scaleValue,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pageWidth = 210;
    const pageHeight = 297;

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);

    pdf.save(`JSO_Admit_Card_${(inputs.rollId.value || "JSO26").trim()}.pdf`);

  } catch (err) {
    console.error(err);
    alert("PDF generation failed. Please use Chrome browser.");
  } finally {
    document.body.classList.remove("exporting");
  }
});

// initialize preview
updatePreview();