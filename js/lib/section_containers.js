import {any_active} from './util.js';



export class FormSectionContainer extends HTMLElement {
    #shadow;
    #name;
    #content;
    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: "open" });
        this.#shadow.innerHTML = `
            <div>
                <slot id="content" />
            </div>
        `;
        this.#name = this.dataset.name;
        const slot_content = this.#shadow.getElementById("content").assignedElements();
        this.#content = slot_content[0].parentElement;
    }

    connectedCallback() {
        this.style.display = "none";
    }

    show_hide(name, state) {
        if (name == this.#name) {
            if (state) {
                this.style.display = "block";
            }
            else {
                this.style.display = "none";
            }
        }
        
    }

    clear() {
        this.style.display = "none";
    }

    load(form_data) {
        if (form_data.hasOwnProperty(this.#name) && form_data[this.#name] !== null && any_active(form_data[this.#name])) {
            this.style.display = 'block';
            for (const element_name in form_data[this.#name]) {
                const el_field = this.#content.querySelector(`[name="${CSS.escape(element_name)}"]`);
                const value = form_data[this.#name][element_name];
                switch (el_field.tagName) {
                    case "select":
                        if (Array.isArray(value)) {
                            for (let i = 0; i < el_field.options.length; i++) {
                                el_field.options[i].selected = false;
                            }
                            for (const v of value) {
                                for (let i = 0; i < el_field.options.length; i++) {
                                    if (el_field.options[i].value == v) {
                                        el_field.options[i].selected = true;
                                    }
                                }
                            }
                        }
                        else {
                            el_field.value = value;
                        }
                        break;
                    case "input":
                    case "textarea":
                        el_field.value = value;
                        break;
                }
            }
        }
        else {
            this.style.display = 'none';
        }
    }

    get_values() {
        const values = {};
        const el_fields = this.#content.querySelectorAll("[name]");
        for (const el_field of el_fields) {
            let element_name = el_field.name;
            if (element_name === undefined) {
                element_name = el_field.attributes.name.value;
            }
            if (el_field.tagName === 'select') {
                values[element_name] = [];
                for (const el_option of el_field.options) {
                    if (el_option.selected) {
                        values[element_name].push(el_option.value);
                    }
                }
            }
            else {
                values[element_name] = el_field.value;
            }
        }
        if (any_active(values)) {
            return {
                "name": this.#name,
                "fields": values
            };
        }
        else {
            return {
                "name": this.#name,
                "fields": null
            };
        }
    }
}

customElements.define('form-section-container', FormSectionContainer);