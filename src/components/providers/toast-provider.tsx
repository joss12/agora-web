"use client";

import { ToastContainer } from "react-toastify";

export function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={2000}
      hideProgressBar
      newestOnTop
      closeOnClick
      pauseOnFocusLoss={false}
      pauseOnHover={false}
      draggable
      limit={2}
      theme="light"
      style={{
        width: "auto",
        maxWidth: "calc(100vw - 32px)",
      }}
      toastStyle={{
        minHeight: "48px",
        borderRadius: "12px",
        fontSize: "13px",
        fontWeight: 500,
        padding: "8px 12px",
        boxShadow:
          "0 4px 20px rgba(0, 0, 0, 0.08)",
      }}
    />
  );
}
