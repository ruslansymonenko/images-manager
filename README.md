# Images Manager

A Tauri-based desktop application for managing images within workspaces with SQLite database support.

## Features

### Workspace Management

- Create and manage multiple workspaces
- Each workspace has its own SQLite database
- Workspace settings stored in `.im_settings` folder

### Image Management

- **Automatic Image Scanning**: Scan workspace folders recursively for supported image formats
- **Supported Formats**: JPG, JPEG, PNG, GIF, BMP, WEBP, TIFF, SVG
- **Database Storage**: Store image metadata including path, size, dates, and format
- **File Operations**:
  - Move images between subfolders
  - Rename images with real-time updates
  - Delete images (with confirmation)
- **Gallery Display**: Grid-based gallery with thumbnails
- **Image Details**: Dedicated page for viewing individual image information
- **Search & Filter**: Search by name/path and filter by file format

### User Interface

- **Gallery Page**: Browse all images in a responsive grid layout
- **Image Details Page**: View individual image with metadata and operations
- **Search & Filtering**: Find images quickly with text search and format filters
- **Dark/Light Theme**: Automatic theme support

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Tauri 2.0, Rust
- **Database**: SQLite (via tauri-plugin-sql)
- **Routing**: React Router DOM
- **Icons**: Lucide React

## Database Schema

### Main Database (`main.db`)

```sql
CREATE TABLE workspaces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  absolute_path TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Workspace Database (`workspace.db`)

```sql
CREATE TABLE workspace_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  relative_path TEXT NOT NULL UNIQUE,
  file_size INTEGER NOT NULL,
  extension TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  modified_at DATETIME NOT NULL
);
```

## Development

### Prerequisites

- Node.js (v18+)
- Rust (latest stable)
- Tauri prerequisites for your platform

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run tauri dev

# Build for production
npm run tauri build
```

### Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ImageCard.tsx    # Image thumbnail component
│   └── ...
├── contexts/            # React contexts
│   ├── WorkspaceContext.tsx
│   └── ImageContext.tsx # Image state management
├── pages/               # Application pages
│   ├── GalleryPage.tsx  # Main gallery view
│   ├── ImageDetailsPage.tsx # Individual image details
│   └── ...
├── utils/
│   └── database.ts      # Database operations
└── main.tsx            # Application entry point

src-tauri/
├── src/
│   └── lib.rs          # Rust backend with image scanning
└── Cargo.toml          # Rust dependencies
```

## Image Management Workflow

1. **Open Workspace**: Select or create a workspace folder
2. **Auto-Scan**: Application automatically scans for images recursively
3. **Database Storage**: Image metadata stored in workspace's SQLite database
4. **Gallery View**: Browse images in responsive grid layout
5. **Image Operations**: Click images to view details, rename, or delete
6. **Real-time Updates**: All operations update both filesystem and database

## File Operations

### Scanning Images

- Recursively scans workspace folder and subfolders
- Preserves folder structure in database
- Skips hidden files and folders (starting with '.')
- Supported extensions: jpg, jpeg, png, gif, bmp, webp, tiff, svg

### Moving Images

- Move images between subfolders within workspace
- Updates database paths automatically
- Creates target directories if needed

### Renaming Images

- Rename images with extension validation
- Updates database records
- Prevents duplicate names

### Deleting Images

- Confirmation dialog for safety
- Removes from both filesystem and database
- Updates UI immediately

## Future Extensions

The modular architecture supports easy extension for:

- Tag management system
- Image collections/albums
- Advanced metadata extraction
- Image editing capabilities
- Export/import functionality
- Workspace synchronization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
