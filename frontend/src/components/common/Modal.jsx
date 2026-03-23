function Modal({ open, title, children }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{title}</h3>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default Modal;