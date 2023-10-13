const mainContainer = document.getElementById("main-container");
const jsonContainer = document.getElementById("json-container");
const title = document.getElementById("title");
const errorMessage = document.getElementById("error-message");
const loader = document.getElementById("loader");

const resetProps = () => {};

document.getElementById("file").addEventListener("change", (event) => {
  loader.style.display = "block";
  const file = event.target.files[0];
  const outputPre = document.getElementById("output");
  const chunkSize = 1024 * 1024;
  let offset = 0;
  let jsonString = "";

  const reader = new FileReader();

  reader.onload = function () {
    const chunk = reader.result;
    jsonString += chunk;

    if (offset >= file.size) {
      try {
        const jsonData = JSON.parse(jsonString);
        outputPre.textContent = JSON.stringify(jsonData, null, 2);
        title.textContent = file.name;
        jsonContainer.style.display = "block";
        mainContainer.style.display = "none";
      } catch (error) {
        errorMessage.style.display = "block";
      } finally {
        loader.style.display = "none";
      }
    } else {
      offset += chunkSize;
      readNextChunk();
    }
  };

  function readNextChunk() {
    const blob = file.slice(offset, offset + chunkSize);
    reader.readAsText(blob);
  }

  if (file) {
    offset = 0;
    jsonString = "";
    outputPre.textContent = "";
    readNextChunk();
  }
});
