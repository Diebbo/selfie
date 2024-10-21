class Modal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.setupModal();
  }

  setupModal() {
    const style = document.createElement('style');
    style.textContent = `
      .modal {
        display: none;
        position: fixed;
        z-index: 1;
        left: 0;
        top: 0;
        border-radius: 15px;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0,0,0,0.4);
      }
      .modal-content {
        background-color: #fefefe;
        margin: 15% auto;
        padding: 20px;
        border: 1px solid #888;
        width: 80%;
        max-width: 500px;
      }
      .close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
      }
      .close:hover,
      .close:focus {
        color: black;
        text-decoration: none;
        cursor: pointer;
      }
    `;

    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2 id="modalTitle"></h2>
        <slot></slot>
      </div>
    `;

    this.shadowRoot.appendChild(modal);
    this.shadowRoot.appendChild(style);

    this.modal = this.shadowRoot.querySelector('.modal');
    this.closeBtn = this.shadowRoot.querySelector('.close');

    this.closeBtn.addEventListener('click', () => this.closeModal());
    window.addEventListener('click', (event) => {
      if (event.target === this.modal) {
        this.closeModal();
      }
    });
  }

  openModal() {
    this.modal.style.display = 'block';
  }

  closeModal() {
    this.modal.style.display = 'none';
  }
}

export default Modal;
