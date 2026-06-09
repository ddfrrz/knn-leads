const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxIBRdpzjd_hgfcZcLmkgEp4MqKtfcQb3-i2OTKUJAowoseRm6G2Xh0-DBQptTsipXjlA/exec";

let submitted = false;

function maskPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
}

function setFieldError(inputEl, errorEl, message) {
  if (message) { inputEl.classList.add("is-error"); errorEl.textContent = message; }
  else { inputEl.classList.remove("is-error"); errorEl.textContent = ""; }
}

function showSubmitError(msg) {
  const el = document.getElementById("submit-error");
  el.textContent = msg; el.classList.add("visible");
}

function hideSubmitError() {
  document.getElementById("submit-error").classList.remove("visible");
}

function setLoading(isLoading) {
  const btn = document.getElementById("btn-submit");
  btn.disabled = isLoading;
  btn.querySelector(".btn-text").hidden = isLoading;
  btn.querySelector(".btn-loader").hidden = !isLoading;
}

function showSuccess() {
  document.getElementById("form-view").hidden = true;
  document.getElementById("success-view").hidden = false;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("lead-form");
  const nomeEl = document.getElementById("nome");
  const wppEl = document.getElementById("whatsapp");
  const emailEl = document.getElementById("email");

  wppEl.addEventListener("input", (e) => {
    e.target.value = maskPhone(e.target.value);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submitted) return;

    const nome = nomeEl.value.trim();
    const wpp = wppEl.value.trim();
    const email = emailEl.value.trim();

    let ok = true;
    if (!nome || nome.length < 3) { setFieldError(nomeEl, document.getElementById("erro-nome"), "Nome obrigatório."); ok = false; }
    else setFieldError(nomeEl, document.getElementById("erro-nome"), null);

    if (!wpp || wpp.replace(/\D/g,"").length < 10) { setFieldError(wppEl, document.getElementById("erro-whatsapp"), "WhatsApp obrigatório."); ok = false; }
    else setFieldError(wppEl, document.getElementById("erro-whatsapp"), null);

    if (!ok) return;

    hideSubmitError();
    setLoading(true);
    submitted = true;

    const timestamp = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const params = new URLSearchParams({ nome, whatsapp: wpp, email, timestamp });
    const url = APPS_SCRIPT_URL + "?" + params.toString();

    try {
      await fetch(url, { method: "GET", mode: "no-cors" });
      showSuccess();
    } catch (err) {
      showSubmitError("Não foi possível enviar. Tente novamente.");
      submitted = false;
      setLoading(false);
    }
  });
});
