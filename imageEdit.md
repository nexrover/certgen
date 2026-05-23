You are an expert Frontend Developer and UI/UX Designer. Your task is to implement an image editing toolbar functionality for a canvas-based design application (similar to Canva or Figma) based on the following specifications.

When a user selects an image element on the canvas, an active contextual editing toolbar must appear directly above the canvas or above the selected image bounding box 

### 1. UI Layout & Behavior
- **Top Toolbar:** All main features must be represented by clean, modern icons in a horizontal row.
- **Tooltips:** When the user hovers over any main icon, a smooth tooltip must display the title of the feature.
- **Sub-features & Controls:** Clicking on an icon must open a dropdown dialog box containing the respective sub-controls (sliders, inputs, or toggle buttons).

### 2. Functional Requirements & Sub-features

Implement the following features within the dropdown dialogs:

* **Crop:** * Enables an interactive cropping overlay grid on the selected image.
    * Allows users to drag corners/edges to adjust the crop area and confirm/cancel the action.

* **Border Radius:** * Provide a numeric input box.
    * Allows the user to input a pixel value (e.g., 0px to 500px) or use an incremental slider to round the corners of the image.

* **Flip:** * Provide two toggle buttons: "Flip Horizontal" and "Flip Vertical".
    * Instantly mirrors the image across the chosen axis when clicked.

* **Transparency (Opacity):** * Provide a slider control ranging from 0% (fully invisible) to 100% (fully opaque).
    * Real-time updating of the image opacity on the canvas.

* **Position:** * **Manual Control:** Allow the user to drag the image or input specific X and Y coordinates.
    * **Quick Alignment Buttons:** Provide 6 quick-align action buttons: Top, Bottom, Left, Right, Middle (vertical center), and Center (horizontal center).

* **Shadow:** * **Presets:** A dropdown/select menu with options: None, Glow, Drop, Outline, Backdrop.
    * **Shadow Customization Controls:** When a shadow preset (other than 'None') is active, show the following sliders/inputs:
        * Blur amount (px)
        * Direction / Offset (X and Y coordinates or angle)
        * Color (Color picker tool)
        * Intensity / Opacity (%)

### 3. Technical & Design Instructions
- Ensure smooth transitions and animations when the dropdown dialog boxes open and close.
- The UI should look clean, professional, and dark-themed/light-themed compatible.
