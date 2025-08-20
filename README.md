# Product Form Component

A modern, feature-rich product form component built with Web Components. This component provides a sophisticated form system with multiple subforms, validation, database identity management, and support for custom form elements.

## Features

### 🎯 **Core Functionality**
- **Multi-section Forms**: Primary form with navigable subforms
- **Real-time Validation**: Field-level validation with visual feedback
- **Database Integration**: Identity management with UUID4 + MD5 hashing
- **Version Control**: Database ID tracking for record versioning
- **Custom Elements**: Support for specialized form controls

### 🎨 **User Experience**
- **Navigation Buttons**: Color-coded subform navigation (blue for data, red for errors)
- **Responsive Design**: Mobile-friendly layout
- **Modern UI**: Gradient styling with smooth animations
- **Validation Messages**: Inline error display
- **State Management**: Dirty state tracking and unsaved changes protection

### ⚙️ **Technical Features**
- **Web Components**: Built with modern Custom Elements API
- **Shadow DOM**: Encapsulated styling and structure
- **Event System**: Comprehensive callback system
- **Data Persistence**: JSON-based data structure
- **Form Clearing**: Smart form reset functionality

## Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="styles.css" />
</head>
<body>
    <product-form>
        <form slot="primary">
            <label>Product Name</label>
            <input name="product_name" identity data-required />
        </form>
        
        <div slot="subforms">
            <form title="Details">
                <label>Description</label>
                <input name="description" data-length="10" />
            </form>
        </div>
        
        <div slot="actions">
            <button name="save">Save</button>
            <button name="clear">Clear</button>
        </div>
    </product-form>

    <script type="module">
        import './js/lib/product-form.js';
        
        const form = document.querySelector('product-form');
        form.set_callbacks(
            (data) => console.log('Saved:', data),
            () => console.log('Cleared'),
            () => confirm('Discard changes?')
        );
    </script>
</body>
</html>
```

## Form Structure

### Slots

The component uses three main slots:

- **`primary`**: Main form section (always visible)
- **`subforms`**: Secondary forms with navigation
- **`actions`**: Action buttons (save, clear, etc.)

### Data Structure

The component returns data in this format:

```json
{
    "identity": "uuid4-md5hash-string",
    "version": 234,
    "validation": true,
    "data": {
        "field_name": "value"
    }
}
```

## Validation System

### Validation Attributes

- **`data-required`**: Field must have a value
- **`data-length="N"`**: Minimum length validation
- **`data-regex="pattern"`**: Regular expression validation

### Example

```html
<input name="email" 
       data-required 
       data-length="5"
       data-regex="^[^\s@]+@[^\s@]+\.[^\s@]+$" />
```

## Identity Management

### Automatic Identity Generation

Fields marked with the `identity` attribute trigger automatic identity generation:

```html
<input name="product_name" identity />
```

This creates a unique identity string: `UUID4 + MD5(field_value)`

## Custom Elements

### Trinary Input

The system includes a three-state input control:

```html
<trinary-input name="is_featured" data-required></trinary-input>
```

**Values**: `'true'`, `'false'`, `''` (unset)

## API Reference

### Methods

#### `set_callbacks(onSubmit, onClear, onDirty)`
Set up form event callbacks.

```javascript
form.set_callbacks(
    (data) => {
        // Handle form submission
        console.log('Form data:', data);
    },
    () => {
        // Handle form clear
        console.log('Form cleared');
    },
    () => {
        // Handle unsaved changes
        return confirm('Discard changes?');
    }
);
```

#### `get value()`
Retrieve current form data.

```javascript
const formData = form.value;
```

#### `set value(data)`
Load data into the form.

```javascript
form.value = {
    identity: 'existing-record-id',
    version: 123,
    data: {
        product_name: 'Sample Product',
        description: 'Product description'
    }
};
```

### Events

- **Change Events**: Triggered on field modifications
- **Validation Events**: Real-time validation feedback
- **Navigation Events**: Subform switching

## File Structure

```
product_form_new/
├── index.html              # Demo page
├── styles.css              # Global styles
├── js/lib/
│   ├── product-form.js     # Main component
│   ├── trinary_ce.js       # Trinary input component
│   ├── trinary-template.js # Trinary styling
│   └── util.js             # Utility functions
└── README.md               # This file
```

## Browser Support

- **Modern Browsers**: Chrome 54+, Firefox 63+, Safari 10.1+, Edge 79+
- **Requirements**: ES6+, Custom Elements v1, Shadow DOM v1

## Development

### Local Development

1. Clone the repository
2. Open `index.html` in a modern browser
3. No build process required - uses native ES modules

### Testing

The demo page includes:
- Form validation examples
- Database simulation
- All feature demonstrations

## Examples

### Complete Product Form

```html
<product-form>
    <form slot="primary">
        <input name="name" identity data-required data-length="3" />
        <select name="category" data-required>
            <option value="electronics">Electronics</option>
        </select>
        <trinary-input name="featured" data-required></trinary-input>
    </form>
    
    <div slot="subforms">
        <form title="Details">
            <input name="description" data-length="10" />
            <input name="weight" type="number" />
        </form>
        
        <form title="Inventory">
            <input name="stock" data-required type="number" />
            <select name="warehouse" data-required>
                <option value="main">Main Warehouse</option>
            </select>
        </form>
    </div>
    
    <div slot="actions">
        <button name="save">Save Product</button>
        <button name="clear">Clear Form</button>
        <button name="save_clear">Save & Clear</button>
    </div>
</product-form>
```

### Database Integration Example

```javascript
import './js/lib/product-form.js';

const form = document.querySelector('product-form');

// Set up callbacks
form.set_callbacks(
    async (data) => {
        // Save to database
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            const saved = await response.json();
            console.log('Saved with version:', saved.version);
        }
    },
    () => {
        console.log('Form cleared');
    },
    () => {
        return confirm('You have unsaved changes. Continue?');
    }
);

// Load existing record
async function loadProduct(id) {
    const response = await fetch(`/api/products/${id}`);
    const product = await response.json();
    form.value = product;
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For questions and support, please open an issue on the project repository.