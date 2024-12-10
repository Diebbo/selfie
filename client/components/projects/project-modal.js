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

  setupStyle() {
    this.shadowRoot.innerHTML = `
      <style>

.modal {
  position: fixed;
  inset: 0; /* Imposta top, right, bottom, left a 0 */
  z-index: 9000;
  background-color: rgba(0, 0, 0, 0.4); /* bg-black bg-opacity-40 */
  display: flex;
  align-items: center; /* items-center */
  justify-content: center; /* justify-center */
  display: none; /* hidden */
  overflow: auto;
}

.modal-content {
  background-color: hsl(var(--nextui-content4, 255, 255, 255));  border-radius: 0.5rem; /* rounded-lg */
  padding: 1.25rem; /* p-5 */
  width: 80%; /* w-4/5 */
  max-width: 32rem; /* max-w-lg */
  margin: 5rem auto; /* mx-auto my-20 */
}

.modal-header {
  font-size: 1.25rem; /* text-xl */
  font-weight: 600; /* font-semibold */
  margin-bottom: 1rem; /* mb-4 */
}

.modal .close {
  color: hsl(var(--nextui-grey), 255, 255, 255); /* text-white */
  font-size: 1.5rem; /* text-2xl */
  font-weight: 700; /* font-bold */
  float: right;
  cursor: pointer;
  transition: color 0.2s;
}

.modal .close:hover {
  color: black; /* hover:text-black */
}

.modal .error-message {
  color: hsl(var(--nextui-error), 255, 255, 255); /* text-error */
  font-size: 0.875rem; /* text-sm */
  margin-top: 0.5rem; /* mt-2 */
}

.modal h2 {
  font-size: 1.5rem; /* text-2xl */
  text-align: center;
  font-weight: 600; /* font-semibold */
}

#modalError {
  color: hsl(var(--nextui-danger));
}
      </style>
`;
  }

  setupModal() {
    this.setupStyle();

    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
      <div class="modal-content">
        <div class="headers">
            <span class="close">&times;</span>
            <h2 id="modalTitle"></h2>
            <p id="modalError" class="text-error"></p>
        </div>
        <slot></slot>
      </div>
    `;

    this.shadowRoot.appendChild(modal);

    this.modal = this.shadowRoot.querySelector('.modal');
    this.closeBtn = this.shadowRoot.querySelector('.close');

    this.closeBtn.addEventListener('click', () => this.closeModal());
    window.addEventListener('click', (event) => {
      if (event.target === this.modal) {
        this.closeModal();
      }
    });
  }

  setTitle(t) {
    this.shadowRoot.getElementById('modalTitle').textContent = t;
  }

  setError(e) {
    this.shadowRoot.getElementById('modalError').textContent = e;
  }

  openModal() {
    this.modal.style.display = 'block';
  }

  closeModal() {
    this.setError('');
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

  handleSave() {
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

customElements.define('modal-component', Modal);

