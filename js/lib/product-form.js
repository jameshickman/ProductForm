import { any_active, create_identity } from './util.js';

const STATE_CLEAR = 1;
const STATE_DIRTY = 2;

const STYLES = `
<style>
.container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}
.main-form-container {
    display: flex;
    gap: 20px;
}
.main-form {
    flex: 1;
}
.actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 140px;
    margin-left: 20px;
}
.actions button {
    width: 100%;
    padding: 12px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.actions button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}
.actions button[name="save"] {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}
.actions button[name="save"]:hover {
    box-shadow: 0 8px 25px rgba(72, 187, 120, 0.3);
}
.actions button[name="clear"] {
    background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
}
.actions button[name="clear"]:hover {
    box-shadow: 0 8px 25px rgba(237, 137, 54, 0.3);
}
.actions button[name="save_clear"] {
    background: linear-gradient(135deg, #9f7aea 0%, #805ad5 100%);
}
.actions button[name="save_clear"]:hover {
    box-shadow: 0 8px 25px rgba(159, 122, 234, 0.3);
}
.secondary-forms-container {
    display: flex;
    gap: 20px;
}
#subform-navigation {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 120px;
    padding-left: 20px;
}
.subform-nav-btn {
    padding: 10px;
    padding-left: 16px;
    border: 1px solid #ccc;
    background: white;
    cursor: pointer;
    text-align: left;
}
.subform-nav-btn.active {
    background: #e0e0e0;
}
.subform-nav-btn.has-data {
    border-color: blue;
    background: #e6f3ff;
}
.subform-nav-btn.has-errors {
    border-color: red;
    background: #ffe6e6;
}
.subforms-container {
    flex: 1;
}
.validation-message {
    color: red;
    font-size: 12px;
    margin-bottom: 5px;
    display: none;
}
.validation-message.show {
    display: block;
}
</style>
`;

const MAIN_INTERFACE = `
<div class="container">
    <div class="main-form-container">
        <div class="main-form">
            <slot name="primary" />
        </div>
        <div class="actions">
            <slot name="actions" />
        </div>
    </div>
    <div class="secondary-forms-container">
        <div id="subform-navigation"></div>
        <div class="subforms-container">
            <slot name="subforms" />
        </div>
    </div>
</div>
`;


export class ProductForm extends HTMLElement {
    #shadow;
    #bindings;
    #state = STATE_CLEAR;
    #on_submit;
    #on_clear;
    #on_dirty;
    #field_identity = null;
    #current_subform = 0;
    #subforms = [];
    #nav_buttons = [];
    #identity_field = null;
    #version_field = null;
    
    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: "open" });
        this.#shadow.innerHTML = STYLES + MAIN_INTERFACE;
    }

    connectedCallback() {
        this.#setup_form();
    }

    set_callbacks(on_submit, on_clear, on_dirty) {
        this.#on_submit = on_submit;
        this.#on_clear = on_clear;
        this.#on_dirty = on_dirty;
    }

    get value() {
        const data = { 
            identity: this.#get_identity(), 
            validation: this.#validate_all_forms(),
            data: {} 
        };
        
        // Include version if it exists (for database records)
        const version = this.#get_version();
        if (version !== null) {
            data.version = version;
        }
        
        // Get primary form data
        const primaryForm = this.querySelector('[slot="primary"]');
        if (primaryForm) {
            this.#extract_form_data(primaryForm, data.data);
        }
        
        // Get subform data
        this.#subforms.forEach(form => {
            this.#extract_form_data(form, data.data);
        });
        
        return data;
    }

    set value(data) {
        if (this.#state === STATE_DIRTY && this.#has_unsaved_changes()) {
            const proceed = this.#on_dirty ? this.#on_dirty() : confirm("Discard unsaved changes?");
            if (!proceed) return;
        }
        
        this.#set_identity(data.identity);
        this.#set_version(data.version);
        this.#populate_forms(data.data);
        this.#state = STATE_CLEAR;
        this.#update_nav_buttons();
    }

    #setup_form() {
        this.#setup_subforms();
        this.#setup_action_buttons();
        this.#setup_primary_form();
        this.#setup_identity_field();
        this.#setup_version_field();
    }
    
    #setup_subforms() {
        const subformsSlot = this.querySelector('[slot="subforms"]');
        if (!subformsSlot) return;
        
        this.#subforms = Array.from(subformsSlot.querySelectorAll('form'));
        const navContainer = this.#shadow.getElementById('subform-navigation');
        
        this.#subforms.forEach((form, index) => {
            // Hide all subforms initially
            form.style.display = 'none';
            
            // Create navigation button
            const button = document.createElement('button');
            button.textContent = form.title || `Form ${index + 1}`;
            button.className = 'subform-nav-btn';
            button.addEventListener('click', () => this.#show_subform(index));
            
            navContainer.appendChild(button);
            this.#nav_buttons.push(button);
            
            // Setup validation messages and field listeners
            this.#setup_form_validation(form, index);
        });
        
        // Show first subform if any exist
        if (this.#subforms.length > 0) {
            this.#show_subform(0);
        }
    }
    
    #setup_action_buttons() {
        const actionsSlot = this.querySelector('[slot="actions"]');
        if (!actionsSlot) return;
        
        const saveBtn = actionsSlot.querySelector('[name="save"]');
        const clearBtn = actionsSlot.querySelector('[name="clear"]');
        const saveClearBtn = actionsSlot.querySelector('[name="save_clear"]');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.#handle_save());
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.#handle_clear());
        }
        if (saveClearBtn) {
            saveClearBtn.addEventListener('click', () => this.#handle_save_clear());
        }
    }
    
    #setup_primary_form() {
        const primaryForm = this.querySelector('[slot="primary"]');
        if (!primaryForm) return;
        
        this.#setup_form_validation(primaryForm, -1); // -1 indicates primary form
        
        // Find identity field
        const identityField = primaryForm.querySelector('[identity]');
        if (identityField) {
            this.#field_identity = identityField;
            identityField.addEventListener('input', () => {
                this.#update_identity();
                this.#mark_dirty();
            });
        }
    }
    
    #setup_identity_field() {
        const primaryForm = this.querySelector('[slot="primary"]');
        if (!primaryForm) return;
        
        // Check if hidden identity field exists, create if not
        this.#identity_field = primaryForm.querySelector('input[name="identity"]');
        if (!this.#identity_field) {
            this.#identity_field = document.createElement('input');
            this.#identity_field.type = 'hidden';
            this.#identity_field.name = 'identity';
            primaryForm.appendChild(this.#identity_field);
        }
    }
    
    #setup_form_validation(form, formIndex) {
        const fields = form.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            // Create validation messages
            this.#create_validation_messages(field);
            
            // Add event listeners for validation
            const validateAndUpdate = () => {
                this.#validate_field(field);
                this.#mark_dirty();
                if (formIndex >= 0) {
                    this.#update_nav_button_state(formIndex);
                }
            };

            field.addEventListener('input', validateAndUpdate);
            field.addEventListener('change', validateAndUpdate);
            field.addEventListener('blur', validateAndUpdate);
            field.addEventListener('keyup', validateAndUpdate);
        });
    }
    
    #create_validation_messages(field) {
        const container = field.parentElement;
        
        if (field.hasAttribute('data-required')) {
            const msg = document.createElement('div');
            msg.className = 'validation-message';
            msg.setAttribute('data-validation', 'required');
            msg.textContent = 'This field is required';
            container.insertBefore(msg, field);
        }
        
        if (field.hasAttribute('data-length')) {
            const msg = document.createElement('div');
            msg.className = 'validation-message';
            msg.setAttribute('data-validation', 'length');
            msg.textContent = `Minimum length: ${field.getAttribute('data-length')}`;
            container.insertBefore(msg, field);
        }
        
        if (field.hasAttribute('data-regex')) {
            const msg = document.createElement('div');
            msg.className = 'validation-message';
            msg.setAttribute('data-validation', 'regex');
            msg.textContent = 'Invalid format';
            container.insertBefore(msg, field);
        }
    }
    
    #validate_field(field) {
        let isValid = true;
        const container = field.parentElement;
        
        // Clear previous validation messages
        container.querySelectorAll('.validation-message').forEach(msg => {
            msg.classList.remove('show');
            msg.style.display = 'none';
        });
        
        // Required validation
        if (field.hasAttribute('data-required') && !field.value.trim()) {
            const reqMsg = container.querySelector('[data-validation="required"]');
            if (reqMsg) {
                reqMsg.classList.add('show');
                reqMsg.style.display = 'block';
            }
            isValid = false;
        }
        
        // Length validation
        if (field.hasAttribute('data-length')) {
            const minLength = parseInt(field.getAttribute('data-length'));
            if (field.value.length < minLength) {
                const lengthMsg = container.querySelector('[data-validation="length"]');
                if (lengthMsg) {
                    lengthMsg.classList.add('show');
                    lengthMsg.style.display = 'block';
                }
                isValid = false;
            }
        }
        
        // Regex validation
        if (field.hasAttribute('data-regex') && field.value.trim()) {
            const pattern = new RegExp(field.getAttribute('data-regex'));
            if (!pattern.test(field.value)) {
                const regexMsg = container.querySelector('[data-validation="regex"]');
                if (regexMsg) {
                    regexMsg.classList.add('show');
                    regexMsg.style.display = 'block';
                }
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    #validate_form(form) {
        const fields = form.querySelectorAll('input, select, textarea');
        let allValid = true;
        
        fields.forEach(field => {
            if (!this.#validate_field(field)) {
                allValid = false;
            }
        });
        
        return allValid;
    }
    
    #show_subform(index) {
        this.#subforms.forEach((form, i) => {
            form.style.display = i === index ? 'block' : 'none';
        });
        
        this.#nav_buttons.forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
        
        this.#current_subform = index;
    }
    
    #update_nav_button_state(formIndex) {
        const form = this.#subforms[formIndex];
        const button = this.#nav_buttons[formIndex];
        if (!form || !button) return;
        
        const formData = {};
        this.#extract_form_data(form, formData);
        const hasData = any_active(formData);
        const isValid = this.#validate_form_silently(form);
        
        button.classList.toggle('has-data', hasData);
        button.classList.toggle('has-errors', hasData && !isValid);
    }
    
    #update_nav_buttons() {
        this.#nav_buttons.forEach((_, index) => {
            this.#update_nav_button_state(index);
        });
    }
    
    #validate_form_silently(form) {
        const fields = form.querySelectorAll('input, select, textarea');
        
        for (const field of fields) {
            if (field.hasAttribute('data-required') && !field.value.trim()) {
                return false;
            }
            
            if (field.hasAttribute('data-length')) {
                const minLength = parseInt(field.getAttribute('data-length'));
                if (field.value.length < minLength) {
                    return false;
                }
            }
            
            if (field.hasAttribute('data-regex') && field.value) {
                const pattern = new RegExp(field.getAttribute('data-regex'));
                if (!pattern.test(field.value)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    #validate_all_forms() {
        // Validate primary form
        const primaryForm = this.querySelector('[slot="primary"]');
        if (primaryForm && !this.#validate_form_silently(primaryForm)) {
            return false;
        }
        
        // Validate all subforms
        for (const form of this.#subforms) {
            if (!this.#validate_form_silently(form)) {
                return false;
            }
        }
        
        return true;
    }
    
    #setup_version_field() {
        const primaryForm = this.querySelector('[slot="primary"]');
        if (!primaryForm) return;
        
        // Check if hidden version field exists, create if not
        this.#version_field = primaryForm.querySelector('input[name="version"]');
        if (!this.#version_field) {
            this.#version_field = document.createElement('input');
            this.#version_field.type = 'hidden';
            this.#version_field.name = 'version';
            primaryForm.appendChild(this.#version_field);
        }
    }

    #get_version() {
        const value = this.#version_field?.value;
        if (!value || value === '') {
            return null;
        }
        const parsed = parseInt(value);
        return isNaN(parsed) ? null : parsed;
    }
    
    #set_version(version) {
        if (this.#version_field) {
            this.#version_field.value = (version !== undefined && version !== null) ? version.toString() : '';
        }
    }

    #extract_form_data(form, data) {
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            if (field.name && field.name !== 'identity' && field.name !== 'version') {
                data[field.name] = field.value;
            }
        });
    }
    
    #populate_forms(data) {
        // Populate primary form
        const primaryForm = this.querySelector('[slot="primary"]');
        if (primaryForm) {
            this.#populate_form(primaryForm, data);
        }
        
        // Populate subforms
        this.#subforms.forEach(form => {
            this.#populate_form(form, data);
        });
    }
    
    #populate_form(form, data) {
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            if (field.name && data.hasOwnProperty(field.name)) {
                field.value = data[field.name];
            }
        });
    }
    
    async #update_identity() {
        if (!this.#field_identity || !this.#field_identity.value) return;
        
        const identity = await create_identity(this.#field_identity.value);
        this.#set_identity(identity);
    }
    
    #get_identity() {
        return this.#identity_field?.value || '';
    }
    
    #set_identity(identity) {
        if (this.#identity_field) {
            this.#identity_field.value = identity || '';
        }
    }
    
    #mark_dirty() {
        this.#state = STATE_DIRTY;
    }
    
    #has_unsaved_changes() {
        return this.#state === STATE_DIRTY;
    }
    
    #handle_save() {
        if (this.#on_submit) {
            this.#on_submit(this.value);
            this.#state = STATE_CLEAR;
        }
    }
    
    #handle_clear() {
        if (this.#has_unsaved_changes()) {
            const proceed = this.#on_dirty ? this.#on_dirty() : confirm("Discard unsaved changes?");
            if (!proceed) return;
        }
        
        this.#clear_forms();
        this.#state = STATE_CLEAR;
        
        if (this.#on_clear) {
            this.#on_clear();
        }
    }
    
    #handle_save_clear() {
        this.#handle_save();
        this.#clear_forms();
    }
    
    #clear_forms() {
        // Clear primary form
        const primaryForm = this.querySelector('[slot="primary"]');
        if (primaryForm) {
            this.#clear_form(primaryForm);
        }
        
        // Clear subforms
        this.#subforms.forEach(form => {
            this.#clear_form(form);
        });
        
        this.#set_identity('');
        this.#set_version(null);
        this.#update_nav_buttons();
    }
    
    #clear_form(form) {
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            if (field.type === 'checkbox' || field.type === 'radio') {
                field.checked = false;
            } else {
                field.value = '';
            }
        });
        
        // Hide validation messages
        form.querySelectorAll('.validation-message').forEach(msg => {
            msg.classList.remove('show');
            msg.style.display = 'none';
        });
    }
}

customElements.define("product-form", ProductForm);