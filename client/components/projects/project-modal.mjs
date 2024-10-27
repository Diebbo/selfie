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
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = '/style/project-o.css';
    this.shadowRoot.appendChild(style);
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
