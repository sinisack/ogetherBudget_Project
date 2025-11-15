import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ authenticated, children }) {
  if (authenticated === null) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}