import React, { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderClosed } from "lucide-react";
import { Button } from "../components";

interface Props {}

const MainPage: React.FC<Props> = () => {
  const [folderPath, setFolderPath] = useState<string | null>(null);

  const openFolder = async () => {
    const folder = await open({
      multiple: false,
      directory: true,
    });

    if (folder) {
      setFolderPath(folder);
    }

    console.log(folder);
  };

  return (
    <div className="min-h-screen min-w-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 w-full max-w-4xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <FolderClosed className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Images Manager
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Select or create a workspace to organize your images
            </p>
          </div>

          <form className="space-y-6">
            <div>
              <label
                htmlFor="workspace-path"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Workspace Path
              </label>
              <div className="flex space-x-2">
                <input
                  id="workspace-path"
                  type="text"
                  {...(folderPath
                    ? { value: folderPath }
                    : { placeholder: "Select a folder..." })}
                  className="input-base flex-1"
                  required
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="min-w-[80px]"
                  onClick={openFolder}
                >
                  Browse
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                A new workspace will be created if the folder doesn't contain
                one
              </p>
            </div>

            <Button type="submit" variant="primary" fullWidth>
              Open Workspace
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
