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

### Tag Management

- **Create Custom Tags**: Add descriptive tags with customizable colors
- **Tag Images**: Assign multiple tags to images for better organization
- **Tag-based Filtering**: Filter gallery by one or multiple tags (AND/OR logic)
- **Tag Statistics**: View tag usage counts across workspace

### Connection System (Obsidian-style Graph)

- **Image Connections**: Create bidirectional links between related images
- **Graph Visualization**: Interactive force-directed graph showing image relationships
- **Visual Representation**: Nodes represent images (color-coded by format), edges represent connections
- **Interactive Navigation**: Click nodes to see details, double-click to open image
- **Connection Management**: Add/remove connections directly from image details page
- **Connection Statistics**: Track total connections and connected images

### User Interface

- **Gallery Page**: Browse all images in a responsive grid layout
- **Image Details Page**: View individual image with metadata, tags, and connections
- **Tags Page**: Manage workspace tags with creation, editing, and statistics
- **Connections Page**: Interactive graph view of all image relationships
- **Search & Filtering**: Find images quickly with text search, format filters, and tag filters
- **Dark/Light Theme**: Automatic theme support

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Tauri 2.0, Rust
- **Database**: SQLite (via tauri-plugin-sql)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Graph Visualization**: react-force-graph-2d

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

CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE image_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (image_id) REFERENCES images (id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE,
  UNIQUE (image_id, tag_id)
);

CREATE TABLE connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_a_id INTEGER NOT NULL,
  image_b_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (image_a_id) REFERENCES images (id) ON DELETE CASCADE,
  FOREIGN KEY (image_b_id) REFERENCES images (id) ON DELETE CASCADE,
  UNIQUE (image_a_id, image_b_id),
  CHECK (image_a_id != image_b_id)
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
│   ├── ImageConnections.tsx # Connection management component
│   ├── TagChip.tsx      # Tag display component
│   └── ...
├── contexts/            # React contexts
│   ├── WorkspaceContext.tsx
│   ├── ImageContext.tsx # Image state management
│   ├── TagContext.tsx   # Tag state management
│   └── ConnectionContext.tsx # Connection state management
├── pages/               # Application pages
│   ├── GalleryPage.tsx  # Main gallery view
│   ├── ImageDetailsPage.tsx # Individual image details
│   ├── TagsPage.tsx     # Tag management page
│   ├── ConnectionsPage.tsx # Graph visualization page
│   └── ...
├── utils/
│   └── database/        # Database operations
│       ├── manager.ts   # Main database manager
│       ├── image.ts     # Image-related operations
│       ├── tag.ts       # Tag-related operations
│       ├── connection.ts # Connection-related operations
│       └── types.ts     # TypeScript types
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
5. **Tag Images**: Add descriptive tags to organize images by content or category
6. **Create Connections**: Link related images together (e.g., before/after shots, image series)
7. **Graph Exploration**: Use the connections page to visualize relationships between images
8. **Image Operations**: Click images to view details, rename, delete, or manage tags/connections
9. **Real-time Updates**: All operations update both filesystem and database

## Connection System Features

### Creating Connections

- Open any image's detail page
- Scroll to the "Connected Images" section
- Click "Add Connection" to link with another image
- Select target image from the list (already connected images are marked)
- Connections are bidirectional (appear on both images)

### Graph Visualization

- Navigate to the "Connections" page to see the full graph
- **Nodes**: Represent images, color-coded by file type
  - Red: JPG/JPEG files
  - Teal: PNG files
  - Blue: GIF files
  - Green: WebP files
  - Yellow: SVG files
  - Purple: BMP files
- **Edges**: Represent connections between images
- **Interactions**:
  - Click and drag to pan around
  - Mouse wheel to zoom in/out
  - Click nodes to see image details
  - Double-click nodes to open image detail page
  - Drag nodes to reposition them

### Connection Management

- View all connections for an image on its detail page
- Remove connections with the "X" button
- Connection removal is bidirectional (removes from both images)
- Connections are automatically cleaned up when images are deleted

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

- Advanced graph analytics (centrality measures, clustering)
- Image collections/albums with nested structures
- Advanced metadata extraction (EXIF data, image dimensions)
- Image editing capabilities
- Export/import functionality for connections and tags
- Workspace synchronization
- Tag hierarchies and categories
- Bulk connection operations
- Connection types (e.g., "similar", "sequence", "reference")

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
