# FasTris


# 3D Adventure Game for Interactive Graphics Project (Sapienza)

## Overview

This project is a **3D Game** built using **Three.js** for rendering 3D graphics and **Cannon.js** for physics simulation.  
The game is a mix between Tris and Snake games. The goal is to win a match of Tris while navigating a grid filled with objects that can help or hinder the player.  
For detailed instructions and gameplay mechanics, refer to the `presentation.pdf`.



## Requirements
- **Node.js**: Version 18 or later.
- **npm**: For package management.
- **Modern Browser**: Supports WebGL and JavaScript ES6 modules.

## Setup
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## File Structure
- **`index.html`**: Entry point containing the basic structure and scripts.
- **`main.js`**: Core game logic, including rendering, physics, character control, and more.
- **`package.json` & `package-lock.json`**: Dependency management for the project.

## Key Dependencies
- **Three.js**: For rendering 3D content.
- **Cannon.js**: For physics simulations.
- **Vite**: For local development and build processes.

---