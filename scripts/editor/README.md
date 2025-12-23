# GodotJS Editor CLI

Command-line tool for [GodotJS](https://github.com/godotjs/GodotJS) project management.

## Contents

- [Overview](#overview)
- [Commands](#commands)
- [Use](#use)
- [API](#api)

## Overview

The GodotJS editor CLI tool helps you initialize new GodotJS projects, download required editor and export templates, start the development process, and build your game.

## Commands

- `init` - Initialize a new GodotJS project
- `prepare` - Download Godot editor and export templates
- `dev` - Start the development process
- `build` - Build the game for distribution

## Use

### Initialize a New Project

```bash
npx @godot-js/editor init my-game
cd my-game
```

### Download Editor and Templates

```bash
npm install @godot-js/editor
godot-js prepare
```

### Start Development

```bash
npm install @godot-js/editor
godot-js dev
```

### Build Game

```bash
npm install @godot-js/editor
godot-js build
```

## API

For detailed API documentation, see [API.md](./docs/API.md).
