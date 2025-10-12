import React from "react";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../contexts/ThemeContext";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

// Custom toast component wrapper
const CustomToast: React.FC<{
  type: "success" | "error" | "warning" | "info";
  message: string;
  icon?: React.ReactNode;
}> = ({ type, message, icon }) => {
  const iconMap = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  return (
    <div className="flex items-center gap-3">
      {icon || iconMap[type]}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

// Toast notification functions
export const notify = {
  success: (message: string, options?: any) => {
    toast.success(<CustomToast type="success" message={message} />, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  },

  error: (message: string, options?: any) => {
    toast.error(<CustomToast type="error" message={message} />, {
      position: "top-right",
      autoClose: 6000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  },

  warning: (message: string, options?: any) => {
    toast.warning(<CustomToast type="warning" message={message} />, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  },

  info: (message: string, options?: any) => {
    toast.info(<CustomToast type="info" message={message} />, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  },

  // Loading toast with promise handling
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      pending: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(
      promise,
      {
        pending: <CustomToast type="info" message={messages.pending} />,
        success: <CustomToast type="success" message={messages.success} />,
        error: <CustomToast type="error" message={messages.error} />,
      },
      {
        position: "top-right",
        autoClose: 4000,
      }
    );
  },

  // Dismiss all toasts
  dismiss: () => {
    toast.dismiss();
  },
};

// ToastContainer component with theme support
export const NotificationContainer: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={isDark ? "dark" : "light"}
      transition={Slide}
      className={() => "fixed top-4 right-4 z-50"}
      toastClassName={() =>
        `relative flex p-1 min-h-10 rounded-lg justify-between overflow-hidden cursor-pointer mb-2
         ${
           isDark
             ? "bg-gray-800 text-gray-100 border border-gray-700 shadow-lg"
             : "bg-white text-gray-900 border border-gray-200 shadow-lg"
         }`
      }
      closeButton={({ closeToast }) => (
        <button
          onClick={closeToast}
          className={`
            self-start p-1 rounded-lg transition-colors
            ${
              isDark
                ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }
          `}
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
      style={{
        zIndex: 9999,
      }}
    />
  );
};

export default notify;
