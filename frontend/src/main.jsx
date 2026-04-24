import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PaginaLogin from "./autenticacion/PaginaLogin";
import PaginaRegister from "./autenticacion/PaginaRegister";
import PaginaPerfil from "./perfil_nutricional/PaginaPerfil";
import PaginaMenu from "./menu_digital/PaginaMenu";
import PaginaDashboard from "./dashboard_nutricional/PaginaDashboard";
import RutaAdmin from "./compartido/components/RutaAdmin";
import PaginaAdmin from "./analitica_tanta/PaginaAdmin";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PaginaLogin />} />
        <Route path="/register" element={<PaginaRegister />} />
        <Route path="/perfil/completar" element={<PaginaPerfil />} />
        <Route path="/menu" element={<PaginaMenu />} />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/dashboard" element={<PaginaDashboard />} />
        <Route
          path="/admin"
          element={
            <RutaAdmin>
              <PaginaAdmin />
            </RutaAdmin>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
