import React from "react";
import { Button } from "./Button";

interface Props {
  folderPath: string | null;
  isLoading: boolean;
  openFolder: () => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const SelectWorkspaceForm: React.FC<Props> = (props) => {
  const { folderPath, isLoading, openFolder, handleSubmit } = props;

  return (
    <form className="space-y-6 mb-8" onSubmit={handleSubmit}>
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
            readOnly
          />
          <Button
            type="button"
            variant="secondary"
            className="min-w-[80px]"
            onClick={openFolder}
            disabled={isLoading}
          >
            Browse
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          A new workspace will be created if the folder doesn't contain one
        </p>
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={!folderPath || isLoading}
      >
        {isLoading ? "Opening..." : "Open Workspace"}
      </Button>
    </form>
  );
};

export default SelectWorkspaceForm;
