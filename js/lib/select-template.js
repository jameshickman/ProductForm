/**
 * Filtered Select Custom Element Theming
 * This file provides theming variables for the filtered-select-element
 * 
 * Copyright 2022-2025. Omer James Hickman.
 * MIT License
 */

// Default theme settings
const FilteredSelectDefaultTheme = {
  // Colors
  backgroundColor: 'white',
  textColor: 'black',
  borderColor: 'black',
  hoverBorderColor: 'black',
  selectedBgColor: 'black',
  selectedTextColor: 'white',
  inputBorderColor: '#ccc',
  groupLabelColor: '#333',
  groupLabelBgColor: 'white',
  groupLabelBorderColor: '#ccc',
  
  // Sizes
  borderWidth: '1px',
  borderRadius: '0px',
  fontSize: '14px',
  padding: '0.25rem 0.5rem',
  itemPadding: '0.25rem',
  groupItemPadding: '0.25rem 1rem',
  maxHeight: '10rem',
  width: '100%',
  
  // Shadows
  dropdownShadow: '0 2px 4px rgba(0,0,0,0.2)',
  
  // Animation
  transitionSpeed: '0.2s',
  
  // Custom CSS
  additionalStyles: '',
  
  // Generate CSS styles based on theme settings
  generateStyles: function() {
    return `
      :host {
        display: block;
        position: relative;
        font-size: ${this.fontSize};
      }
      
      .select-widget__display-current {
        display: block;
        border: ${this.borderWidth} solid ${this.borderColor};
        border-radius: ${this.borderRadius};
        background-color: ${this.backgroundColor};
        color: ${this.textColor};
        text-align: left;
        width: ${this.width};
        box-sizing: border-box;
        cursor: pointer;
        padding: ${this.padding};
        transition: border-color ${this.transitionSpeed} ease;
      }
      
      .select-widget__display-current:hover {
        border-color: ${this.hoverBorderColor};
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
        border-top: 0.3rem solid ${this.textColor};
        cursor: pointer;
      }
      
      .select-widget__dropdown-container {
        display: none;
        position: absolute;
        top: 0px;
        left: 0px;
        right: 0px;
        background-color: ${this.backgroundColor};
        border: ${this.borderWidth} solid ${this.borderColor};
        border-radius: ${this.borderRadius};
        padding: 1rem;
        z-index: 99999;
        padding-top: 2.5rem;
        box-shadow: ${this.dropdownShadow};
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
        background-color: ${this.textColor};
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
        border: ${this.borderWidth} solid ${this.inputBorderColor};
        border-radius: ${this.borderRadius};
        color: ${this.textColor};
        background-color: ${this.backgroundColor};
      }
      
      .select-widget__results {
        max-height: ${this.maxHeight};
        overflow-y: auto;
        padding: 2px;
      }
      
      .select-widget__item {
        background-color: ${this.backgroundColor};
        color: ${this.textColor};
        width: 100%;
        box-sizing: border-box;
        text-align: left;
        cursor: pointer;
        margin: 1px 0;
        border: ${this.borderWidth} solid transparent;
        border-radius: ${this.borderRadius};
        padding: ${this.itemPadding};
        transition: border-color ${this.transitionSpeed} ease;
      }
      
      .select-widget__item:hover {
        border: ${this.borderWidth} solid ${this.hoverBorderColor};
      }
      
      .select-widget__group-title {
        font-weight: bold;
        padding: 0.25rem 0;
        color: ${this.groupLabelColor};
      }
      
      .select-widget__group-item {
        padding: ${this.groupItemPadding};
        cursor: pointer;
        background-color: ${this.backgroundColor};
        color: ${this.textColor};
        width: 100%;
        box-sizing: border-box;
        text-align: left;
        margin: 1px 0;
        border: ${this.borderWidth} solid transparent;
        border-radius: ${this.borderRadius};
        transition: border-color ${this.transitionSpeed} ease;
      }
      
      .select-widget__group-item:hover {
        border: ${this.borderWidth} solid ${this.hoverBorderColor};
      }
      
      .select-widget__item__selected {
        color: ${this.selectedTextColor};
        background-color: ${this.selectedBgColor};
      }
      
      .select-widget__group-label {
        position: sticky;
        top: 0;
        background-color: ${this.groupLabelBgColor};
        border-bottom: ${this.borderWidth} solid ${this.groupLabelBorderColor};
        padding: 0.25rem 0;
        font-weight: bold;
        display: none;
        color: ${this.groupLabelColor};
      }
      
      /* Hide the slot */
      ::slotted(select) {
        display: none;
      }
      
      ${this.additionalStyles}
    `;
  }
};

// Create a theme helper function to merge custom theme with defaults
function createFilteredSelectTheme(customTheme = {}) {
  // Create a new object with default theme settings
  const theme = {...FilteredSelectDefaultTheme};
  
  // Override with custom settings
  Object.keys(customTheme).forEach(key => {
    theme[key] = customTheme[key];
  });
  
  return theme;
}

// Example themes
const FilteredSelectDarkTheme = createFilteredSelectTheme({
  backgroundColor: '#333',
  textColor: '#eee',
  borderColor: '#666',
  hoverBorderColor: '#999',
  selectedBgColor: '#0066cc',
  selectedTextColor: 'white',
  inputBorderColor: '#666',
  groupLabelColor: '#ccc',
  groupLabelBgColor: '#333',
  groupLabelBorderColor: '#666',
  borderRadius: '4px',
  dropdownShadow: '0 2px 8px rgba(0,0,0,0.5)'
});

const FilteredSelectRoundedTheme = createFilteredSelectTheme({
  borderColor: '#ccc',
  hoverBorderColor: '#0066cc',
  selectedBgColor: '#0066cc',
  borderRadius: '20px',
  itemPadding: '0.5rem 1rem',
  groupItemPadding: '0.5rem 1.5rem',
  fontSize: '16px',
  dropdownShadow: '0 4px 8px rgba(0,0,0,0.1)',
  transitionSpeed: '0.3s'
});

// Export themes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FilteredSelectDefaultTheme,
    FilteredSelectDarkTheme,
    FilteredSelectRoundedTheme,
    createFilteredSelectTheme
  };
}