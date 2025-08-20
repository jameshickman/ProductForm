import {multicall} from './jsum.js';
import {any_active} from './util.js';


export class ActivateFormSectionButton extends HTMLElement {
    #shadow;
    #section_name = '';
    #is_active = false;
    #check_mark;
    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: "open" });
        this.#shadow.innerHTML = `
        <style>
            button {
                border: none;
                background: none;
            }
        </style>
        <button>
            <span id="check" style="display: none;">&#10004;</span><slot />
        </button>
        `;
        this.#section_name = this.dataset.name;
        this.#check_mark = this.#shadow.getElementById("check");
    }

    connectedCallback() {
        this.addEventListener("click", () => {
            this.#is_active = !this.#is_active;
            this.#update_state();
            multicall(
                {
                    target: "show_hide",
                    query: "form-section-container",
                    params: [this.#section_name, this.#is_active]
                }
            );
        });
    }

    load(form_data) {
        if (form_data.hasOwnProperty(this.#section_name) && any_active(form_data[this.#section_name])) {
            // Section active
            this.#is_active = true;
            this.#update_state();
        }
        else {
            // Inactive
            this.#is_active = false;
            this.#update_state();
        }
    }

    clear() {
        this.#is_active = false;
        this.#update_state();
    }

    #update_state() {
        //this.classList.remove("active");
        //this.classList.remove("inactive");
        if (this.#is_active) {
            //this.classList.add("active");
            this.#check_mark.style.display = "inline-block";
        }
        else {
            // this.classList.add("inactive");
            this.#check_mark.style.display = "none";
        }
    }
}


customElements.define('form-section-button', ActivateFormSectionButton);