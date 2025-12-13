// Pages/cms/dropdown.js
export class CustomDropdown {
    constructor(elementId, options = {}) {
        this.elementId = elementId;
        this.options = options.items || [];
        this.placeholder = options.placeholder || 'Select an option';
        this.selectedValue = options.defaultValue || '';
        this.onChange = options.onChange || (() => {});
        this.isOpen = false;
        this.init();
    }

    init() {
        const container = document.getElementById(this.elementId);
        if (!container) return;
        container.innerHTML = this.render();
        this.attachEventListeners();
        if (this.selectedValue) this.setValue(this.selectedValue);
    }

    render() {
        const selectedOption = this.options.find(opt => opt.value === this.selectedValue);
        const displayText = selectedOption ? selectedOption.label : this.placeholder;
        return `
            <div class="relative">
                <button 
                    type="button"
                    class="dropdown-trigger w-full bg-slate-800 bg-opacity-50 border border-slate-600 rounded-xl px-5 py-3 text-left focus:outline-none focus:border-pink-500 transition-all text-white flex items-center justify-between hover:bg-opacity-70"
                    data-dropdown="${this.elementId}">
                    <span class="${!this.selectedValue ? 'text-slate-400' : 'text-white'}">${displayText}</span>
                    <svg class="w-5 h-5 transition-transform dropdown-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div class="dropdown-menu hidden absolute z-50 w-full mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden">
                    <div class="max-h-60 overflow-y-auto">
                        ${this.options.map(option => `
                            <button 
                                type="button"
                                class="dropdown-option w-full text-left px-5 py-3 hover:bg-slate-700 transition-colors text-white ${this.selectedValue === option.value ? 'bg-slate-700 text-pink-400' : ''}"
                                data-value="${option.value}">
                                ${option.label}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const container = document.getElementById(this.elementId);
        const trigger = container.querySelector('.dropdown-trigger');
        const options = container.querySelectorAll('.dropdown-option');

        trigger.addEventListener('click', e => {
            e.stopPropagation();
            this.toggle();
        });

        options.forEach(option => {
            option.addEventListener('click', e => {
                e.stopPropagation();
                this.setValue(option.dataset.value);
                this.close();
                this.onChange(option.dataset.value);
            });
        });

        document.addEventListener('click', e => {
            if (!container.contains(e.target)) this.close();
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && this.isOpen) this.close();
        });
    }

    toggle() { this.isOpen ? this.close() : this.open(); }
    open() {
        const container = document.getElementById(this.elementId);
        container.querySelector('.dropdown-menu').classList.remove('hidden');
        container.querySelector('.dropdown-arrow').style.transform = 'rotate(180deg)';
        this.isOpen = true;
    }
    close() {
        const container = document.getElementById(this.elementId);
        container.querySelector('.dropdown-menu').classList.add('hidden');
        container.querySelector('.dropdown-arrow').style.transform = 'rotate(0deg)';
        this.isOpen = false;
    }

    setValue(value) {
        this.selectedValue = value;
        const container = document.getElementById(this.elementId);
        const trigger = container.querySelector('.dropdown-trigger span');
        const options = container.querySelectorAll('.dropdown-option');

        const selectedOption = this.options.find(opt => opt.value === value);
        if (selectedOption) {
            trigger.textContent = selectedOption.label;
            trigger.classList.remove('text-slate-400');
            trigger.classList.add('text-white');
        }

        options.forEach(option => {
            if (option.dataset.value === value) {
                option.classList.add('bg-slate-700', 'text-pink-400');
            } else {
                option.classList.remove('bg-slate-700', 'text-pink-400');
            }
        });
    }

    getValue() { return this.selectedValue; }
    reset() {
        this.selectedValue = '';
        const container = document.getElementById(this.elementId);
        const trigger = container.querySelector('.dropdown-trigger span');
        trigger.textContent = this.placeholder;
        trigger.classList.add('text-slate-400');
        trigger.classList.remove('text-white');
    }
}
