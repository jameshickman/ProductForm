import {COLOR_BORDER, COLOR_NUTRAL, COLOR_ACTIVE, COLOR_DEACTIVATED, LBL_UNSET, LBL_YES, LBL_NO} from './trinary-template.js';

const STATE_UNDEFINED = '';
const STATE_TRUE = 'true';
const STATE_FALSE = 'false';

class TrinaryElement extends HTMLElement {
    #value = STATE_UNDEFINED;
    #shadow;
    #el_button_yes;
    #el_button_no;
    #el_button_nutral;
    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: "open" });
        this.#shadow.innerHTML = `
            <style>
                .trinary__widget_container {
                    display: flex;
                    position: relative;
                    box-sizing: border-box;
                }

                .trinary__widget_container button {
                    flex-grow: 1;
                    border: none;
                    background: none;
                    padding-left: 0px;
                    padding-right: 0px;
                    padding-top: 5px;
                    padding-bottom: 5px;
                    cursor: pointer;
                    -webkit-transition: all 200ms linear;
                    -ms-transition: all 200ms linear;
                    transition: all 200ms linear;
                }

                .trinary__option_no {
                    border-top-left-radius: 0.5rem;
                    border-bottom-left-radius: 0.5rem;
                    border-top: 1px solid ${COLOR_BORDER} !important;
                    border-bottom: 1px solid ${COLOR_BORDER} !important;
                    border-left: 1px solid ${COLOR_BORDER} !important;
                }

                .trinary__option_nutral {
                    border-top: 1px solid ${COLOR_BORDER} !important;
                    border-bottom: 1px solid ${COLOR_BORDER} !important;
                }

                .trinary__option_yes {
                    border-top-right-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                    border-top: 1px solid ${COLOR_BORDER} !important;
                    border-bottom: 1px solid ${COLOR_BORDER} !important;
                    border-right: 1px solid ${COLOR_BORDER} !important;
                }

                .trinary__button_selected_undefined {
                    background-color: ${COLOR_NUTRAL} !important;
                    color: white;
                }

                .trinary__button_selected_yes {
                    background-color: ${COLOR_ACTIVE} !important;
                    color: white;
                }

                .trinary__button_selected_no {
                    background-color: ${COLOR_DEACTIVATED} !important;
                    color: white;
                }
            </style>
            <div class='trinary__widget_container'>
                <button class='trinary__option_no'>${LBL_NO}</button>
                <button class='trinary__option_nutral'>${LBL_UNSET}</button>
                <button class='trinary__option_yes'>${LBL_YES}</button>
            </div>
        `;

        this.#el_button_yes = this.#shadow.querySelector('.trinary__option_yes');
        this.#el_button_nutral = this.#shadow.querySelector('.trinary__option_nutral');
        this.#el_button_no = this.#shadow.querySelector('.trinary__option_no');

        this.#el_button_yes.addEventListener('click', () => {
            this.#value = STATE_TRUE;
            this.#set_state();
            this.#send_change();
        });
        this.#el_button_nutral.addEventListener('click', () => {
            this.#value = STATE_UNDEFINED;
            this.#set_state();
            this.#send_change();
        });
        this.#el_button_no.addEventListener('click', () => {
            this.#value = STATE_FALSE;
            this.#set_state();
            this.#send_change();
        });
    }

    connectedCallback() {
        this.#set_state();
    }

    get value() {
        return this.#value;
    }

    set value(v) {
        if (v === true || v === 1 || (typeof v === 'string' && v.toLowerCase() === 'true')) {
            this.#value = STATE_TRUE;
        }
        else if (v === false || v === 0 || (typeof v === 'string' && v.toLowerCase() === 'false')) {
            this.#value = STATE_FALSE;
        }
        else {
            this.#value = STATE_UNDEFINED;
        }
        this.#set_state();
    }

    get name() {
        return this.getAttribute('name');
    }

    set name(value) {
        if (value) {
            this.setAttribute('name', value);
        } else {
            this.removeAttribute('name');
        }
    }

    #set_state() {
        switch(this.#value) {
            case STATE_TRUE:
                this.#el_button_yes.classList.add("trinary__button_selected_yes");
                this.#el_button_no.classList.remove("trinary__button_selected_no");
                this.#el_button_nutral.classList.remove("trinary__button_selected_undefined");
                break;
            case STATE_FALSE:
                this.#el_button_no.classList.add("trinary__button_selected_no");
                this.#el_button_yes.classList.remove("trinary__button_selected_yes");
                this.#el_button_nutral.classList.remove("trinary__button_selected_undefined");
                break;
            default:
                this.#el_button_yes.classList.remove("trinary__button_selected_yes");
                this.#el_button_no.classList.remove("trinary__button_selected_no");
                this.#el_button_nutral.classList.add("trinary__button_selected_undefined");
        }
    }

    #send_change() {
        this.dispatchEvent(new Event('change', {'bubbles': true}));
    }
}

customElements.define('trinary-input', TrinaryElement);

export {TrinaryElement};