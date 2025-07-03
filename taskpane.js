Office.onReady(() => {
  document.getElementById("uploadButton").onclick = uploadPDF;
});

async function uploadPDF() {
  const input = document.getElementById("fileInput");
  const files = input.files;
  if (files.length === 0) {
    return alert("Bitte wähle eine PDF-Datei aus.");
  }

  const formData = new FormData();
  formData.append("file", files[0]);

  try {
    const res = await fetch("https://vlp-upload.onrender.com/", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Fehler bei der Verarbeitung");
    }

    const data = await res.json();
    previewInTable(data);
  } catch (err) {
    console.error(err);
    alert("Fehler: " + err.message);
  }
}

function previewInTable(mapped) {
  const preview = document.getElementById("preview");
  preview.innerHTML = "";

  const headers = Object.keys(mapped);
  const maxLength = Math.max(...headers.map(k => mapped[k].length));

  const table = document.createElement("table");
  table.border = "1";

  const thead = table.createTHead();
  const headRow = thead.insertRow();
  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    headRow.appendChild(th);
  });

  const tbody = table.createTBody();
  for (let i = 0; i < maxLength; i++) {
    const row = tbody.insertRow();
    headers.forEach(h => {
      const cell = row.insertCell();
      cell.textContent = mapped[h][i] || "";
    });
  }

  preview.appendChild(table);

  const insertBtn = document.createElement("button");
  insertBtn.textContent = "In Excel einfügen";
  insertBtn.onclick = () => insertToExcel(mapped);
  preview.appendChild(insertBtn);
}

async function insertToExcel(mapped) {
  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    const headers = Object.keys(mapped);
    const maxLength = Math.max(...headers.map(k => mapped[k].length));

    const values = [headers];
    for (let i = 0; i < maxLength; i++) {
      values.push(headers.map(h => mapped[h][i] || ""));
    }

    const range = sheet.getRange("A1").getResized(values.length - 1, headers.length - 1);
    range.values = values;
    await context.sync();
  });
}
