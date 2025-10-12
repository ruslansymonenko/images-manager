import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { databaseManager, ImageFile } from "../utils/database";
import { useWorkspace } from "./WorkspaceContext";

interface ImageContextType {
  images: ImageFile[];
  selectedImage: ImageFile | null;
  isLoading: boolean;
  loadImages: () => Promise<void>;
  scanImages: () => Promise<void>;
  refreshImages: () => Promise<void>;
  moveImage: (oldPath: string, newPath: string) => Promise<void>;
  renameImage: (
    oldName: string,
    newName: string,
    relativePath: string
  ) => Promise<void>;
  deleteImage: (relativePath: string) => Promise<void>;
  selectImage: (image: ImageFile | null) => void;
  getImageAbsolutePath: (relativePath: string) => Promise<string>;
  getImageAsBase64: (relativePath: string) => Promise<string>;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

interface ImageProviderProps {
  children: ReactNode;
}

export const ImageProvider: React.FC<ImageProviderProps> = ({ children }) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { currentWorkspace } = useWorkspace();

  // Auto-load images when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      loadImages();
    } else {
      setImages([]);
      setSelectedImage(null);
    }
  }, [currentWorkspace]);

  const loadImages = async () => {
    if (!currentWorkspace) {
      console.warn("No workspace available for loading images");
      return;
    }

    try {
      setIsLoading(true);
      console.log(
        "Loading images from database for workspace:",
        currentWorkspace.absolute_path
      );

      // First try to load existing images from database
      const existingImages = await databaseManager.getAllImages();

      if (existingImages.length > 0) {
        setImages(existingImages);
        console.log(`Loaded ${existingImages.length} images from database`);
      } else {
        // If no images in database, do a full scan
        console.log("No images in database, performing initial scan");
        await scanImages();
      }
    } catch (error) {
      console.error("Failed to load images:", error);
      // If loading fails, fall back to scanning
      try {
        await scanImages();
      } catch (scanError) {
        console.error("Failed to scan images as fallback:", scanError);
        throw scanError;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const scanImages = async () => {
    if (!currentWorkspace) {
      console.warn("No workspace available for scanning images");
      return;
    }

    try {
      console.log(
        "Scanning images in workspace:",
        currentWorkspace.absolute_path
      );

      const scannedImages = await databaseManager.scanAndStoreImages(
        currentWorkspace.absolute_path
      );

      setImages(scannedImages);
      console.log(`Found ${scannedImages.length} images`);
    } catch (error) {
      console.error("Failed to scan images:", error);
      throw error;
    }
  };

  const refreshImages = async () => {
    if (!currentWorkspace) {
      console.warn("No workspace available for refreshing images");
      return;
    }

    try {
      setIsLoading(true);
      const allImages = await databaseManager.getAllImages();
      setImages(allImages);
    } catch (error) {
      console.error("Failed to refresh images:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const moveImage = async (oldPath: string, newPath: string) => {
    if (!currentWorkspace) {
      throw new Error("No workspace available");
    }

    try {
      const newRelativePath = await databaseManager.moveImage(
        oldPath,
        newPath,
        currentWorkspace.absolute_path
      );

      // Update local state
      setImages((prevImages) =>
        prevImages.map((img) =>
          img.relative_path === oldPath
            ? { ...img, relative_path: newRelativePath }
            : img
        )
      );

      // Update selected image if it was moved
      if (selectedImage && selectedImage.relative_path === oldPath) {
        setSelectedImage({ ...selectedImage, relative_path: newRelativePath });
      }

      console.log("Image moved successfully");
    } catch (error) {
      console.error("Failed to move image:", error);
      throw error;
    }
  };

  const renameImage = async (
    oldName: string,
    newName: string,
    relativePath: string
  ) => {
    if (!currentWorkspace) {
      throw new Error("No workspace available");
    }

    try {
      const newRelativePath = await databaseManager.renameImage(
        oldName,
        newName,
        relativePath,
        currentWorkspace.absolute_path
      );

      // Update local state
      setImages((prevImages) =>
        prevImages.map((img) =>
          img.relative_path === relativePath
            ? { ...img, name: newName, relative_path: newRelativePath }
            : img
        )
      );

      // Update selected image if it was renamed
      if (selectedImage && selectedImage.relative_path === relativePath) {
        setSelectedImage({
          ...selectedImage,
          name: newName,
          relative_path: newRelativePath,
        });
      }

      console.log("Image renamed successfully");
    } catch (error) {
      console.error("Failed to rename image:", error);
      throw error;
    }
  };

  const deleteImage = async (relativePath: string) => {
    if (!currentWorkspace) {
      throw new Error("No workspace available");
    }

    try {
      await databaseManager.deleteImage(
        relativePath,
        currentWorkspace.absolute_path
      );

      // Remove from local state
      setImages((prevImages) =>
        prevImages.filter((img) => img.relative_path !== relativePath)
      );

      // Clear selected image if it was deleted
      if (selectedImage && selectedImage.relative_path === relativePath) {
        setSelectedImage(null);
      }

      console.log("Image deleted successfully");
    } catch (error) {
      console.error("Failed to delete image:", error);
      throw error;
    }
  };

  const selectImage = (image: ImageFile | null) => {
    setSelectedImage(image);
  };

  const getImageAbsolutePath = async (
    relativePath: string
  ): Promise<string> => {
    if (!currentWorkspace) {
      throw new Error("No workspace available");
    }

    return databaseManager.getImageAbsolutePath(
      relativePath,
      currentWorkspace.absolute_path
    );
  };

  const getImageAsBase64 = async (relativePath: string): Promise<string> => {
    if (!currentWorkspace) {
      throw new Error("No workspace available");
    }

    return databaseManager.getImageAsBase64(
      relativePath,
      currentWorkspace.absolute_path
    );
  };

  const contextValue: ImageContextType = {
    images,
    selectedImage,
    isLoading,
    loadImages,
    scanImages,
    refreshImages,
    moveImage,
    renameImage,
    deleteImage,
    selectImage,
    getImageAbsolutePath,
    getImageAsBase64,
  };

  return (
    <ImageContext.Provider value={contextValue}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImages = (): ImageContextType => {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error("useImages must be used within an ImageProvider");
  }
  return context;
};
