const mainContainer = document.getElementById("main-container");
const jsonContainer = document.getElementById("json-container");
const title = document.getElementById("title");
const errorMessage = document.getElementById("error-message");
const loader = document.getElementById("loader");
const output = document.getElementById("output");
const more = document.getElementById("more");

const worker = new Worker("./worker.min.js");

document.getElementById("file").addEventListener("change", async (e) => {
  loader.style.display = 'block';
  const file = e.target.files[0];
  if (!file) return;

  worker.postMessage({
    type: "load",
    file,
  });
});

worker.addEventListener("message", ({ data }) => {
  handleMessage(data);
});

const handleMessage = (data) => {
  const { isValid, json, fileName, keyName } = data;

  if (!isValid) {
    errorMessage.style.display = "block";
    errorMessage.textContent = "Invalid file. Please load a valid JSON file.";
    return;
  }

  loader.style.display = 'none';
  mainContainer.style.display = "none";
  jsonContainer.style.display = "block";

  title.textContent = fileName;

  if (keyName === "root") {
    output.appendChild(createStructure(json));
    return;
  }

  const target = output.querySelector(
    `[data-key-name="${keyName}"]`
  )?.parentElement;

  if (!target) return;

  target.innerHTML = "";
  const res = createStructure(json);
  const resCount = res.childElementCount;

  for (let i = 0; i < resCount; i++) {
    target.appendChild(res.children.item(0));
  }
};



const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    worker.postMessage({
      type: "more",
    });
  }
});

observer.observe(more);

function createStructure(json) {
  const keys = Object.keys(json);

  const ul = document.createElement("ul");

  for (let key of keys) {
    const li = document.createElement("li");
    const span = document.createElement("span");

    span.classList.add("key");
    span.textContent = key + ":";

    li.appendChild(span);

    const value = json[key];

    if (key === "...") {
      li.appendChild(createLoadMoreButton(value));
      ul.appendChild(li);
      continue;
    }

    const isValueNull = value === null;

    if (isValueNull || typeof value !== "object") {
      const span = document.createElement("span");
      span.classList.add("value");

      if (isValueNull) {
        span.textContent = "null";
      } else if (typeof value === "string") {
        span.textContent = `"${value}"`;
      } else {
        span.textContent = value;
      }

      li.appendChild(span);
    } else {
      if (Array.isArray(value)) {
        li.classList.add("array");
      }

      li.appendChild(createStructure(value));
    }

    ul.appendChild(li);
  }

  return ul;
}

const createLoadMoreButton = (keyName) => {
  const button = document.createElement("button");
  button.textContent = keyName;
  button.dataset.keyName = keyName;
  button.addEventListener("click", (e) => {
    const keyName = e.target.dataset.keyName;

    worker.postMessage({
      type: "more",
      keyName,
    });
  });

  return button;
};
