class Modal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.onsave = null;
    this.onclose = null;
    this.setupModal();
  }

  static get observedAttributes() {
    return ['onclose', 'onsave', 'title'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'onclose' || name === 'onsave') {
      try {
        // Store the callback function name
        this[name] = newValue;
      } catch (e) {
        console.error(`Error setting ${name} callback:`, e);
      }
    }
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
        border-radius: 15px;
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
      .text-error {
        color: red;
      }
      h2 {
        color: #333;
      }
    `;

    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2 id="modalTitle"></h2>
        <p id="modalError" class="text-error"></p>
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

  setTitle(t){
    this.shadowRoot.getElementById('modalTitle').textContent = t;
  }

  setError(e){
    this.shadowRoot.getElementById('modalError').textContent = e;
  }

  openModal() {
    this.modal.style.display = 'block';
  }

  closeModal() {
    this.modal.style.display = 'none';

    if (this.onclose) {
      // Dispatch custom event that parent can listen to
      this.dispatchEvent(new CustomEvent('modalClose', {
        bubbles: true,
        composed: true
      }));
      // Execute the callback if it's a function name in the global scope
      if (typeof window[this.onclose] === 'function') {
        window[this.onclose]();
      }
    }
  }

  handleSave(){
    if (this.onsave) {
      // Dispatch custom event that parent can listen to
      this.dispatchEvent(new CustomEvent('modalSave', {
        bubbles: true,
        composed: true
      }));
      // Execute the callback if it's a function name in the global scope
      if (typeof window[this.onsave] === 'function') {
        window[this.onsave]().then(() => this.closeModal());
      }
    }
  }
}

export default Modal;
