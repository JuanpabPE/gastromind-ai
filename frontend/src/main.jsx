import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PaginaLogin from "./autenticacion/PaginaLogin";
import PaginaRegister from "./autenticacion/PaginaRegister";
import PaginaPerfil from "./perfil_nutricional/PaginaPerfil";
import PaginaMenu from "./menu_digital/PaginaMenu";
import PaginaDashboard from "./dashboard_nutricional/PaginaDashboard";
import PaginaAdmin from "./analitica_tanta/PaginaAdmin";
import RutaAdmin from "./compartido/components/RutaAdmin";
import PaginaMozo from "./mozo/PaginaMozo";
import PaginaGestionMesa from "./mozo/PaginaGestionMesa";
import GeneradorQR from "./mozo/GeneradorQR";
import PaginaMesaQR from "./mesa_qr/PaginaMesaQR";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<PaginaLogin />} />
        <Route path="/register" element={<PaginaRegister />} />

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
