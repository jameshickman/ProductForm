# Filtered Select

Copyright 2022. Omer James Hickman.
Released under the GNU LGPL V2

## Overview

Filtered Select is a lightweight JavaScript library that enhances standard HTML select elements with searchable dropdown functionality. It transforms regular select elements into interactive, filterable components that improve user experience, especially for dropdowns with many options.

## Features

- **Searchable Dropdowns**: Filter options as you type
- **Group Support**: Handles `<optgroup>` elements with proper hierarchical display
- **Keyboard Navigation**: Close the dropdown with Escape key
- **Custom Styling**: Fully customizable through CSS
- **Event Handling**: Preserves original select element events
- **No Dependencies**: Pure JavaScript with no external libraries required

## Usage

This library is available in two implementations:
1. Traditional JavaScript function (original implementation)
2. Modern ES6 Web Component (custom element)

### Traditional Implementation

1. Include the required files in your HTML:
   ```html
   <script src="filtered_select.js"></script>
   <link rel="stylesheet" href="selctor.css" />
   ```

2. Create a select element wrapped in a container:
   ```html
   <div class="select-container">
     <select id="my-select">
       <option value="1">Option 1</option>
       <option value="2">Option 2</option>
       <!-- More options... -->
     </select>
   </div>
   ```

3. Initialize the filtered select:
   ```javascript
   _filtered_select(document.querySelector(".select-container"));
   ```

### Modern ES6 Custom Element

1. Include the required scripts:
   ```html
   <!-- Include the theme system (optional but recommended) -->
   <script src="template.js"></script>
   
   <!-- Include the custom element -->
   <script src="filtered-select-element.js"></script>
   ```

2. Use the custom element with a slotted select:
   ```html
   <filtered-select>
     <select id="my-select">
       <option value="1">Option 1</option>
       <option value="2">Option 2</option>
       <!-- More options... -->
     </select>
   </filtered-select>
   ```

3. Optional: Apply a theme by attribute or JavaScript:
   ```html
   <!-- Using attribute -->
   <filtered-select theme="FilteredSelectDarkTheme">
     <select id="my-select">
       <!-- Options... -->
     </select>
   </filtered-select>
   
   <!-- Using JavaScript -->
   <script>
     // Get reference to the element
     const select = document.querySelector('filtered-select');
     
     // Apply a predefined theme
     select.setTheme(FilteredSelectDarkTheme);
     
     // Or create a custom theme
     select.setTheme(createFilteredSelectTheme({
       backgroundColor: '#f5f5f5',
       borderColor: '#0066cc',
       selectedBgColor: '#0066cc',
       borderRadius: '4px'
     }));
   </script>
   ```

## Examples

### Traditional Implementation

#### Basic Select

```html
<div class="select-container-simple">
    <select id="select-control">
        <option value="1">One</option>
        <option value="2">Two</option>
        <option value="3">Three</option>
        <option value="4">Four</option>
        <option value="5">Five</option>
    </select>
</div>
```

#### Grouped Select

```html
<div class="select-container-groups">
    <select id="select-control-groups">
        <optgroup label="Numbers">
            <option value="1">One</option>
            <!-- More options... -->
        </optgroup>
        <optgroup label="Letters">
            <option value="A">Alpha</option>
            <!-- More options... -->
        </optgroup>
    </select>
</div>
```

### Modern ES6 Custom Element

#### Basic Select

```html
<filtered-select>
  <select id="basic-select">
    <option value="1">One</option>
    <option value="2">Two</option>
    <option value="3">Three</option>
    <option value="4">Four</option>
    <option value="5">Five</option>
  </select>
</filtered-select>
```

#### Grouped Select

```html
<filtered-select>
  <select id="grouped-select">
    <optgroup label="Numbers">
      <option value="1">One</option>
      <option value="2">Two</option>
      <option value="3">Three</option>
    </optgroup>
    <optgroup label="Letters">
      <option value="A" selected="selected">Alpha</option>
      <option value="B">Bravo</option>
      <option value="C">Charlie</option>
    </optgroup>
  </select>
</filtered-select>
```

## API

### Traditional Implementation

#### Main Function

```javascript
const widgetController = _filtered_select(containerElement);
```

#### Methods

- `widgetController.reload()`: Reloads the options from the select element (useful after dynamically changing options)

### Modern ES6 Custom Element

#### Methods

- `filteredSelectElement.reload()`: Reloads the options from the select element (useful after dynamically changing options)
- `filteredSelectElement.setTheme(theme)`: Sets the theme for the component. Can accept a theme name, a theme object, or a custom theme object.

#### Attributes

- `theme`: Sets the name of a predefined theme to use (e.g., "FilteredSelectDarkTheme")
- `placeholder`: Sets the placeholder text for the search input (default: "Search...")
- `disabled`: When present, disables the select dropdown

### Theming System

The modern implementation includes a powerful theming system that allows complete customization of the component's appearance.

#### Predefined Themes

- `FilteredSelectDefaultTheme`: The default light theme
- `FilteredSelectDarkTheme`: A dark theme with light text
- `FilteredSelectRoundedTheme`: A theme with rounded corners and blue accents

#### Creating Custom Themes

```javascript
// Import the theming utilities
// This is done automatically in the browser when you include template.js

// Create a custom theme by extending the default theme
const myCustomTheme = createFilteredSelectTheme({
  // Override only the properties you want to change
  backgroundColor: '#f0f0f0',
  textColor: '#333',
  borderColor: '#0066cc',
  hoverBorderColor: '#004499',
  selectedBgColor: '#0066cc',
  selectedTextColor: 'white',
  
  // Customize sizes and shapes
  borderRadius: '4px',
  fontSize: '16px',
  maxHeight: '15rem',
  
  // Add shadows
  dropdownShadow: '0 4px 8px rgba(0,0,0,0.1)',
  
  // Add transitions
  transitionSpeed: '0.3s'
});

// Apply the theme to a select element
document.querySelector('filtered-select').setTheme(myCustomTheme);
```

```javascript
// Example of dynamically changing options and reloading
const select = document.querySelector('filtered-select > select');
// Clear and add new options to the select element
select.innerHTML = '';
// Add new options...
// Reload the filtered select
document.querySelector('filtered-select').reload();
```

### Events

Both implementations preserve the original select element's events:

```javascript
document.querySelector('#my-select').addEventListener('change', function(e) {
    // Handle change event
});
```

## Demo Files

- `index.html`: Demo of the traditional implementation
- `modern-demo.html`: Demo of the modern ES6 custom element implementation
- `themed-demo.html`: Demo of the theming capabilities with various examples

## Testing

This project includes comprehensive test coverage for both implementations using NightwatchJS.

### Setup

```bash
# Install dependencies
npm install

# Start the HTTP server in a separate terminal
npm run http-server
```

### Running Tests

```bash
# Run all tests
npm test

# Run only traditional implementation tests
npm run test:traditional

# Run only modern implementation tests
npm run test:modern
```

The tests cover:
- Basic functionality of both implementations
- Option selection
- Search filtering
- Group handling
- Dynamic option updates (for the modern implementation)

## Browser Compatibility

- Traditional Implementation: Compatible with all modern browsers
- Modern ES6 Custom Element: Compatible with browsers that support Web Components (all modern browsers, may require polyfills for older browsers)

## License

GNU LGPL V2