import { Routes, Route, Navigate } from "react-router-dom";
import Playground from "../pages/Playground";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/playground" />} />
      <Route path="/playground" element={<Playground />} />
    </Routes>
  );
}
