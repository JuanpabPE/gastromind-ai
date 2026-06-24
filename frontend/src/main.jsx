import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PaginaLogin from "./autenticacion/PaginaLogin";
import PaginaRegister from "./autenticacion/PaginaRegister";
import PaginaAuthCallback from "./autenticacion/PaginaAuthCallback";
import PaginaPerfil from "./perfil_nutricional/paginaPerfil";
import PaginaMenu from "./menu_digital/paginaMenu";
import PaginaDashboard from "./dashboard_nutricional/paginaDashboard";
import PaginaAdmin from "./analitica_tanta/paginaAdmin";
import RutaAdmin from "./compartido/components/rutaAdmin";
import PaginaMozo from "./mozo/paginaMozo";
import PaginaGestionMesa from "./mozo/paginaGestionMesa";
import GeneradorQR from "./mozo/generadorQR";
import PaginaMesaQR from "./mesa_qr/paginaMesaQR";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<PaginaLogin />} />
        <Route path="/register" element={<PaginaRegister />} />
        <Route path="/auth/callback" element={<PaginaAuthCallback />} />

        {/* Cliente */}
        <Route path="/perfil/completar" element={<PaginaPerfil />} />
        <Route path="/menu" element={<PaginaMenu />} />
        <Route path="/dashboard" element={<PaginaDashboard />} />

        {/* QR de mesa — acceso desde celular del cliente */}
        <Route path="/mesa/:sede/:numero" element={<PaginaMesaQR />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <RutaAdmin>
              <PaginaAdmin />
            </RutaAdmin>
          }
        />

        {/* Mozo */}
        <Route path="/mozo" element={<PaginaMozo />} />
        <Route path="/mozo/mesa/:mesaId" element={<PaginaGestionMesa />} />
        <Route path="/mozo/qr" element={<GeneradorQR />} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
