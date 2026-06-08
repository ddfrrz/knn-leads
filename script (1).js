/* ===================================================
   CONFIGURAÇÃO — substitua a URL abaixo pela sua
   =================================================== */
const APPS_SCRIPT_URL = "COLE_AQUI_A_URL_DO_SEU_APPS_SCRIPT";
// Exemplo: "https://script.google.com/macros/s/AKfycb.../exec"

/* ===================================================
   ESTADO
   =================================================== */
let submitted = false;

/* ===================================================
   MÁSCARA DE TELEFONE BRASILEIRO
   =================================================== */
function maskPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2)  return `(${digits}`;
  if (digits.length <= 6)  return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  // Celular com 9º dígito
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
}

/* ===================================================
   VALIDAÇÕES
   =================================================== */
function validateNome(value) {
  const v = value.trim();
  if (!v) return "Nome é obrigatório.";
  if (v.length < 3) return "Nome muito curto.";
  return null;
}

function validateWhatsApp(value) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "WhatsApp é obrigatório.";
  if (digits.length < 10) return "Número incompleto.";
  return null;
}

function validateEmail(value) {
  const v = value.trim();
  if (!v) return null; // opcional
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(v)) return "E-mail inválido.";
  return null;
}

/* ===================================================
   UI HELPERS
   =================================================== */
function setFieldError(inputEl, errorEl, message) {
  if (message) {
    inputEl.classList.add("is-error");
    errorEl.textContent = message;
  } else {
    inputEl.classList.remove("is-error");
    errorEl.textContent = "";
  }
}

function showSubmitError(msg) {
  const el = document.getElementById("submit-error");
  el.textContent = msg;
  el.classList.add("visible");
}

function hideSubmitError() {
  const el = document.getElementById("submit-error");
  el.classList.remove("visible");
}

function setLoading(isLoading) {
  const btn   = document.getElementById("btn-submit");
  const text  = btn.querySelector(".btn-text");
  const loader= btn.querySelector(".btn-loader");
  btn.disabled = isLoading;
  text.hidden  = isLoading;
  loader.hidden = !isLoading;
}

function showSuccess() {
  document.getElementById("form-view").hidden = true;
  document.getElementById("success-view").hidden = false;
}

/* ===================================================
   INICIALIZAÇÃO
   =================================================== */
document.addEventListener("DOMContentLoaded", () => {

  const form      = document.getElementById("lead-form");
  const nomeEl    = document.getElementById("nome");
  const wppEl     = document.getElementById("whatsapp");
  const emailEl   = document.getElementById("email");

  // --- Máscara dinâmica no WhatsApp ---
  wppEl.addEventListener("input", (e) => {
    const cursor = e.target.selectionStart;
    const raw    = e.target.value;
    const masked = maskPhone(raw);
    e.target.value = masked;
    // Reposiciona cursor evitando que fique no fim sempre
    try { e.target.setSelectionRange(cursor, cursor); } catch (_) {}
  });

  // --- Validação inline ao sair do campo ---
  nomeEl.addEventListener("blur", () => {
    setFieldError(nomeEl, document.getElementById("erro-nome"), validateNome(nomeEl.value));
  });
  wppEl.addEventListener("blur", () => {
    setFieldError(wppEl, document.getElementById("erro-whatsapp"), validateWhatsApp(wppEl.value));
  });
  emailEl.addEventListener("blur", () => {
    setFieldError(emailEl, document.getElementById("erro-email"), validateEmail(emailEl.value));
  });

  // --- Submit ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submitted) return;

    // Valida tudo
    const nomeErr  = validateNome(nomeEl.value);
    const wppErr   = validateWhatsApp(wppEl.value);
    const emailErr = validateEmail(emailEl.value);

    setFieldError(nomeEl,  document.getElementById("erro-nome"),      nomeErr);
    setFieldError(wppEl,   document.getElementById("erro-whatsapp"),  wppErr);
    setFieldError(emailEl, document.getElementById("erro-email"),     emailErr);

    if (nomeErr || wppErr || emailErr) return;

    // Verifica URL configurada
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === "COLE_AQUI_A_URL_DO_SEU_APPS_SCRIPT") {
      showSubmitError("⚠️ URL do Apps Script não configurada. Veja o README.");
      return;
    }

    hideSubmitError();
    setLoading(true);
    submitted = true;

    const payload = {
      nome:      nomeEl.value.trim(),
      whatsapp:  wppEl.value.trim(),
      email:     emailEl.value.trim() || "",
      timestamp: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
    };

    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // necessário para Apps Script
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // no-cors não retorna status, assumimos sucesso se não lançou exceção
      showSuccess();
    } catch (err) {
      console.error("Erro ao enviar:", err);
      showSubmitError("Não conseguimos enviar. Verifique sua conexão e tente novamente.");
      submitted = false;
      setLoading(false);
    }
  });
});
