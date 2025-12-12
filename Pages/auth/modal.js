// ----- MODAL UTILS -----
const modal = document.getElementById("modalPopup");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const modalClose = document.getElementById("modalClose");

const showModal = (title, message, callback) => {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modal.classList.remove("hidden");

  const handler = () => {
    modal.classList.add("hidden");
    modalClose.removeEventListener("click", handler);
    if (callback) callback();
  };

  modalClose.addEventListener("click", handler);
};

export { showModal };