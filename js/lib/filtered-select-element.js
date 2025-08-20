/**
 * Filtered Select Custom Element
 * A modern ES6 implementation of the filtered select widget using Web Components
 * 
 * Copyright 2022-2025. Omer James Hickman.
 * Released under the GNU LGPL V2
 */

// Import or use existing themes
// Check if we're in a module context
if (typeof require !== 'undefined') {
  const themeModule = require('./select-template.js');
  const { FilteredSelectDefaultTheme: importedDefaultTheme, createFilteredSelectTheme: importedCreateTheme } = themeModule;
  // Use imported values
  window.FilteredSelectDefaultTheme = importedDefaultTheme;
  window.createFilteredSelectTheme = importedCreateTheme;
} else if (!window.FilteredSelectDefaultTheme) {
  // In browser, if theme variables aren't globally available, create minimal defaults
  window.FilteredSelectDefaultTheme = {
    generateStyles: () => {
      return `
        :host {
          display: block;
          position: relative;
        }
        
        .select-widget__display-current {
          display: block;
          border: 1px solid black;
          background-color: white;
          text-align: left;
          width: 100%;
          box-sizing: border-box;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
        }
        
        .select-widget__chevron-container {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          position: absolute;
          top: 0px;
          bottom: 0px;
          right: 0px;
          padding-right: 0.3rem;
          width: 0.6rem;
        }
        
        .select-widget__chevron {
          display: block;
          width: 0px;
          height: 0px;
          border-left: 0.3rem solid transparent;
          border-right: 0.3rem solid transparent;
          border-top: 0.3rem solid black;
          cursor: pointer;
        }
        
        .select-widget__dropdown-container {
          display: none;
          position: absolute;
          top: 0px;
          left: 0px;
          right: 0px;
          background-color: white;
          border: 1px solid black;
          padding: 1rem;
          z-index: 99999;
          padding-top: 2.5rem;
        }
        
        .select-widget__dropdown-close {
          display: block;
          position: absolute;
          width: 1.5rem;
          height: 1.5rem;
          top: 0.5rem;
          right: 1rem;
          border: transparent;
          background-color: transparent;
          cursor: pointer;
        }
        
        .select-widget__dropdown-close::before,
        .select-widget__dropdown-close::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 2px;
          background-color: black;
          top: 50%;
          left: 0;
        }
        
        .select-widget__dropdown-close::before {
          transform: rotate(45deg);
        }
        
        .select-widget__dropdown-close::after {
          transform: rotate(-45deg);
        }
        
        .select-widget__input-text {
          display: block;
          position: absolute;
          top: 0.5rem;
          left: 1rem;
          right: 3rem;
          padding: 0.25rem;
          border: 1px solid #ccc;
        }
        
        .select-widget__results {
          max-height: 10rem;
          overflow-y: auto;
          padding: 2px;
        }
        
        .select-widget__item {
          background-color: white;
          width: 100%;
          box-sizing: border-box;
          text-align: left;
          cursor: pointer;
          margin: 1px 0;
          border: 1px solid transparent;
          padding: 0.25rem;
        }
        
        .select-widget__item:hover {
          border: 1px solid black;
        }
        
        .select-widget__group-title {
          font-weight: bold;
          padding: 0.25rem 0;
        }
        
        .select-widget__group-item {
          padding-left: 1rem;
          cursor: pointer;
          background-color: white;
          width: 100%;
          box-sizing: border-box;
          text-align: left;
          margin: 1px 0;
          border: 1px solid transparent;
          padding: 0.25rem;
        }
        
        .select-widget__group-item:hover {
          border: 1px solid black;
        }
        
        .select-widget__item__selected {
          color: white;
          background-color: black;
        }
        
        .select-widget__group-label {
          position: sticky;
          top: 0;
          background-color: white;
          border-bottom: 1px solid #ccc;
          padding: 0.25rem 0;
          font-weight: bold;
          display: none;
        }
        
        /* Hide the slot */
        ::slotted(select) {
          display: none;
        }
      `;
    }
  };
  
  window.createFilteredSelectTheme = window.createFilteredSelectTheme || ((customTheme) => {
    return window.FilteredSelectDefaultTheme;
  });
}

class FilteredSelect extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.hasGroups = false;
    this.opened = false;
    this.options = [];
    this.selected = null;
    this.elSelect = null;
    
    // Get theme from attribute or use default
    this._theme = window.FilteredSelectDefaultTheme;
    
    // Bind methods to this
    this.handleDisplayClick = this.handleDisplayClick.bind(this);
    this.handleChevronClick = this.handleChevronClick.bind(this);
    this.handleBackgroundClick = this.handleBackgroundClick.bind(this);
    this.handleWidgetClick = this.handleWidgetClick.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleResultClick = this.handleResultClick.bind(this);
    this.handleResultScroll = this.handleResultScroll.bind(this);
    this.handleKeyup = this.handleKeyup.bind(this);
  }

  // Add setTheme method to the prototype
  setTheme(theme) {
    if (typeof theme === 'string') {
      // Check if the named theme exists in the window
      if (window[theme]) {
        this._theme = window[theme];
      } else {
        console.warn(`Theme "${theme}" not found. Using default theme.`);
        this._theme = window.FilteredSelectDefaultTheme;
      }
    } else if (typeof theme === 'object') {
      // Custom theme object provided
      this._theme = window.createFilteredSelectTheme(theme);
    } else {
      // Default
      this._theme = window.FilteredSelectDefaultTheme;
    }
    
    // Re-render with new theme
    this.updateStyles();
  }
  
  // Method to update just the styles without re-rendering everything
  updateStyles() {
    const styleEl = this.shadowRoot.querySelector('style');
    if (styleEl) {
      styleEl.textContent = this._theme.generateStyles();
    }
  }

  static get observedAttributes() {
    return ['theme', 'placeholder', 'disabled'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'theme' && oldValue !== newValue) {
      this.setTheme(newValue);
    }
    
    if (name === 'placeholder' && this.elSearch) {
      this.elSearch.placeholder = newValue || 'Search...';
    }
    
    if (name === 'disabled') {
      const isDisabled = newValue !== null;
      if (this.elDisplay) {
        this.elDisplay.disabled = isDisabled;
      }
    }
  }

  connectedCallback() {
    // Check for theme attribute
    if (this.hasAttribute('theme')) {
      this.setTheme(this.getAttribute('theme'));
    }
    
    // Render initial HTML
    this.render();
    
    // Initialize the component after rendering
    this.initializeSelect();
    
    // Add event listeners
    this.addEventListeners();
  }

  disconnectedCallback() {
    // Clean up event listeners
    this.removeEventListeners();
  }

  render() {
    // Prepare the HTML structure and styles
    this.shadowRoot.innerHTML = `
      <style>
        ${this._theme.generateStyles()}
      </style>
      
      <slot></slot>
      
      <button class="select-widget__display-current" ${this.hasAttribute('disabled') ? 'disabled' : ''}></button>
      
      <div class="select-widget__chevron-container">
        <div class="select-widget__chevron"></div>
      </div>
      
      <div class="select-widget__dropdown-container">
        <button class="select-widget__dropdown-close"></button>
        <input type="text" class="select-widget__input-text" placeholder="${this.getAttribute('placeholder') || 'Search...'}">
        <div class="select-widget__group-label"></div>
        <div class="select-widget__results"></div>
      </div>
    `;
  }

  initializeSelect() {
    // Get references to DOM elements
    this.elDisplay = this.shadowRoot.querySelector('.select-widget__display-current');
    this.elDownChevron = this.shadowRoot.querySelector('.select-widget__chevron');
    this.elWidget = this.shadowRoot.querySelector('.select-widget__dropdown-container');
    this.elSearch = this.shadowRoot.querySelector('.select-widget__input-text');
    this.elSectionLabel = this.shadowRoot.querySelector('.select-widget__group-label');
    this.elResults = this.shadowRoot.querySelector('.select-widget__results');
    this.elClose = this.shadowRoot.querySelector('.select-widget__dropdown-close');
    
    // Get the slotted select element using proper slot events
    const slot = this.shadowRoot.querySelector('slot');
    if (slot) {
      slot.addEventListener('slotchange', () => {
        this.initializeSlottedSelect(slot);
      });
      // Also try immediate initialization in case slot is already populated
      this.initializeSlottedSelect(slot);
    }
  }

  initializeSlottedSelect(slot) {
      if (!slot) {
        console.error('No slot found in filtered-select');
        return;
      }
      
      const slottedElements = slot.assignedElements();
      
      if (slottedElements.length > 0) {
        this.elSelect = slottedElements.find(el => el.tagName === 'SELECT');
        
        if (this.elSelect) {
          // Check for optgroups
          this.checkForGroups();
          
          // Load options data
          this.loadOptionsData();
          
          // Set initial display value if there's a selected option
          if (this.elSelect.selectedIndex >= 0) {
            this.elDisplay.innerText = this.elSelect.options[this.elSelect.selectedIndex].text;
          }
          
          // Attach widget reference to the select element
          this.elSelect.widget = this;
        } else {
          // If no SELECT element found in slot, try finding it directly in children
          const selectElement = this.querySelector('select');
          if (selectElement) {
            this.elSelect = selectElement;
            
            // Check for optgroups
            this.checkForGroups();
            
            // Load options data
            this.loadOptionsData();
            
            // Set initial display value if there's a selected option
            if (this.elSelect.selectedIndex >= 0) {
              this.elDisplay.innerText = this.elSelect.options[this.elSelect.selectedIndex].text;
            }
            
            // Attach widget reference to the select element
            this.elSelect.widget = this;
          } else {
            console.error('No SELECT element found in filtered-select');
          }
        }
      } else {
        // Try finding select element directly in children if slot is empty
        const selectElement = this.querySelector('select');
        if (selectElement) {
          this.elSelect = selectElement;
          
          // Check for optgroups
          this.checkForGroups();
          
          // Load options data
          this.loadOptionsData();
          
          // Set initial display value if there's a selected option
          if (this.elSelect.selectedIndex >= 0) {
            this.elDisplay.innerText = this.elSelect.options[this.elSelect.selectedIndex].text;
          }
          
          // Attach widget reference to the select element
          this.elSelect.widget = this;
        } else {
          console.error('No content in slot and no SELECT element found in filtered-select');
        }
      }
  }

  checkForGroups() {
    const elsOptgroups = this.elSelect.querySelectorAll('OPTGROUP');
    this.hasGroups = elsOptgroups !== null && elsOptgroups.length > 0;
  }

  loadOptionsData() {
    this.options = [];
    
    if (this.hasGroups) {
      const elsOptgroups = this.elSelect.querySelectorAll('OPTGROUP');
      
      for (let i = 0; i < elsOptgroups.length; i++) {
        const groupName = elsOptgroups[i].label;
        const elsOptions = elsOptgroups[i].querySelectorAll('OPTION');
        
        if (elsOptions.length > 0) {
          const optgroup = {
            label: groupName,
            options: []
          };
          
          for (let j = 0; j < elsOptions.length; j++) {
            optgroup.options.push({
              label: elsOptions[j].innerText,
              value: elsOptions[j].value
            });
          }
          
          this.options.push(optgroup);
        }
      }
    } else {
      const elOptions = this.elSelect.querySelectorAll('OPTION');
      
      for (let i = 0; i < elOptions.length; i++) {
        this.options.push({
          label: elOptions[i].innerText,
          value: elOptions[i].value
        });
      }
    }
  }

  addEventListeners() {
    this.elDisplay.addEventListener('click', this.handleDisplayClick);
    this.elDownChevron.addEventListener('click', this.handleChevronClick);
    document.addEventListener('click', this.handleBackgroundClick);
    this.elWidget.addEventListener('click', this.handleWidgetClick);
    this.elClose.addEventListener('click', this.handleCloseClick);
    this.elSearch.addEventListener('keyup', this.handleSearchChange);
    this.elResults.addEventListener('click', this.handleResultClick);
    this.elResults.addEventListener('scroll', this.handleResultScroll);
    document.addEventListener('keyup', this.handleKeyup);
  }

  removeEventListeners() {
    this.elDisplay.removeEventListener('click', this.handleDisplayClick);
    this.elDownChevron.removeEventListener('click', this.handleChevronClick);
    document.removeEventListener('click', this.handleBackgroundClick);
    this.elWidget.removeEventListener('click', this.handleWidgetClick);
    this.elClose.removeEventListener('click', this.handleCloseClick);
    this.elSearch.removeEventListener('keyup', this.handleSearchChange);
    this.elResults.removeEventListener('click', this.handleResultClick);
    this.elResults.removeEventListener('scroll', this.handleResultScroll);
    document.removeEventListener('keyup', this.handleKeyup);
  }

  handleDisplayClick(e) {
    if (!this.hasAttribute('disabled')) {
      this.activateDropdown(e);
    }
  }

  handleChevronClick(e) {
    if (!this.hasAttribute('disabled')) {
      this.activateDropdown(e);
    }
  }

  handleBackgroundClick(e) {
    if (this.opened) {
      this.closeDropdown();
    }
  }

  handleWidgetClick(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  handleCloseClick(e) {
    this.closeDropdown();
  }

  handleKeyup(e) {
    if (e.key === 'Escape') {
      this.closeDropdown();
    }
  }

  handleSearchChange(e) {
    this.filterOptions();
  }

  handleResultClick(e) {
    const val = e.target.dataset.value;
    const txt = e.target.innerText;
    
    if (val !== undefined) {
      this.elSelect.value = val;
      this.elDisplay.innerText = txt;
      this.closeDropdown();
      
      // Dispatch change event
      this.dispatchChangeEvent();
    }
  }

  handleResultScroll(e) {
    if (this.hasGroups) {
      this.elSectionLabel.innerText = this.findGroupName();
    }
  }

  activateDropdown(e) {
    // Check if select is initialized
    if (!this.elSelect) {
      console.error('Cannot activate dropdown: Select element not initialized');
      // Try to initialize again
      const selectElement = this.querySelector('select');
      if (selectElement) {
        this.elSelect = selectElement;
        this.checkForGroups();
        this.loadOptionsData();
      } else {
        return; // Cannot proceed without select element
      }
    }
    
    this.elWidget.style.display = 'block';
    this.elSearch.value = '';
    this.elSearch.focus();
    this.buildResults(this.options);
    this.opened = true;
    e.stopPropagation();
    e.preventDefault();
  }

  closeDropdown() {
    this.elWidget.style.display = 'none';
    this.opened = false;
  }

  buildResults(results) {
    // Make sure elSelect exists before trying to access it
    if (!this.elSelect) {
      console.error('Cannot build results: Select element not initialized');
      return;
    }
    
    if (this.elSelect.selectedIndex >= 0) {
      this.selected = this.elSelect.options[this.elSelect.selectedIndex].value;
    }
    
    this.elResults.innerHTML = '';
    
    if (this.hasGroups) {
      for (let i = 0; i < results.length; i++) {
        const groupName = results[i].label;
        const elGroupContainer = document.createElement('DIV');
        const elGroupTitle = document.createElement('DIV');
        elGroupTitle.classList.add('select-widget__group-title');
        elGroupTitle.innerText = groupName;
        elGroupContainer.appendChild(elGroupTitle);
        
        const elOptionsContainer = document.createElement('DIV');
        elGroupContainer.appendChild(elOptionsContainer);
        
        for (let j = 0; j < results[i].options.length; j++) {
          const elOption = document.createElement('BUTTON');
          elOption.classList.add('select-widget__group-item');
          elOption.innerText = results[i].options[j].label;
          elOption.dataset.value = results[i].options[j].value;
          
          if (results[i].options[j].value == this.selected) {
            this.elDisplay.innerText = results[i].options[j].label;
            elOption.classList.add('select-widget__item__selected');
          }
          
          elOptionsContainer.appendChild(elOption);
        }
        
        this.elResults.appendChild(elGroupContainer);
      }
      
      this.elSectionLabel.style.display = 'block';
      this.elSectionLabel.innerText = this.findGroupName();
    } else {
      for (let i = 0; i < results.length; i++) {
        const elOption = document.createElement('BUTTON');
        elOption.classList.add('select-widget__item');
        elOption.innerText = results[i].label;
        elOption.dataset.value = results[i].value;
        
        if (results[i].value == this.selected) {
          this.elDisplay.innerText = results[i].label;
          elOption.classList.add('select-widget__item__selected');
        }
        
        this.elResults.appendChild(elOption);
      }
      
      this.elSectionLabel.style.display = 'none';
    }
    
    const elSelectedItem = this.elResults.querySelector('.select-widget__item__selected');
    if (elSelectedItem) {
      let backoff = 
        elSelectedItem.offsetTop 
        - elSelectedItem.clientHeight
        - (this.elResults.clientHeight / 2);
      this.elResults.scrollTop = backoff;
    }
  }

  filterOptions() {
    const term = this.elSearch.value.toLowerCase();
    let filtered = [];
    
    if (this.hasGroups) {
      for (let i = 0; i < this.options.length; i++) {
        const groupLbl = this.options[i].label;
        let groupMatching = [];
        
        for (let j = 0; j < this.options[i].options.length; j++) {
          if (term === '' || this.options[i].options[j].label.toLowerCase().includes(term)) {
            groupMatching.push(this.options[i].options[j]);
          }
        }
        
        if (groupMatching.length > 0) {
          filtered.push({
            label: groupLbl,
            options: groupMatching
          });
        }
      }
    } else {
      for (let i = 0; i < this.options.length; i++) {
        if (term === '' || this.options[i].label.toLowerCase().includes(term)) {
          filtered.push(this.options[i]);
        }
      }
    }
    
    this.buildResults(filtered);
  }

  findGroupName() {
    const scrollPos = this.elResults.scrollTop;
    const elsGroups = this.elResults.children;
    
    for (let i = 0; i < elsGroups.length; i++) {
      if (scrollPos >= elsGroups[i].offsetTop && 
          scrollPos <= elsGroups[i].offsetTop + elsGroups[i].clientHeight) {
        return elsGroups[i].children[0].innerText;
      }
    }
    
    return elsGroups.length > 0 ? elsGroups[0].children[0].innerText : '';
  }

  dispatchChangeEvent() {
    if ("createEvent" in document) {
      const evt = document.createEvent('HTMLEvents');
      evt.initEvent("change", false, true);
      this.elSelect.dispatchEvent(evt);
    } else {
      this.elSelect.fireEvent("onchange");
    }
  }

  // Public API
  reload() {
    this.elDisplay.innerText = '';
    this.checkForGroups();
    this.loadOptionsData();
    this.buildResults(this.options);
  }
}

// Register the custom element
customElements.define('filtered-select', FilteredSelect);