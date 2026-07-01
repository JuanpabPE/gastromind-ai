import { useState, useEffect } from "react";
import { obtenerMenu, obtenerCategorias } from "./menuApi";
import { usePerfil } from "../perfil_nutricional/usePerfil";
import { supabase } from "../compartido/api/cliente";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function useMenu() {
  const [platos, setPlatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtros, setFiltros] = useState({
    categoria: "",
    busqueda: "",
    vegetariano: false,
    vegano: false,
    sinGluten: false,
    diabetes: false,
    hipertension: false,
    caloriasMax: 1000,
    proteinasMin: 0,
  });
  const [perfil, setPerfil] = useState(null);
  const [alertasPorPlato, setAlertasPorPlato] = useState({});
  const { obtenerPerfil } = usePerfil();

  useEffect(() => {
    async function init() {
      const [cats, perfilData] = await Promise.all([
        obtenerCategorias(),
        obtenerPerfil(),
      ]);
      setCategorias(cats);
      setPerfil(perfilData);

      if (perfilData) {
        setFiltros((f) => ({
          ...f,
          sinGluten: perfilData.alergias?.includes("Gluten") || false,
          diabetes: perfilData.enfermedades?.includes("Diabetes") || false,
          hipertension:
            perfilData.enfermedades?.some(
              (e) => normalizarTexto(e) === "hipertension",
            ) || false,
          vegano: perfilData.preferencias?.includes("Vegano") || false,
          vegetariano:
            perfilData.preferencias?.includes("Vegetariano") || false,
        }));
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      const data = await obtenerMenu(filtros);
      setPlatos(data);
      await cargarAlertasMenu();
      setCargando(false);
    }
    cargar();
  }, [filtros]);

  async function cargarAlertasMenu() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setAlertasPorPlato({});
        return;
      }

      const response = await fetch(`${API}/alertas/`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) {
        setAlertasPorPlato({});
        return;
      }

      const data = await response.json();
      const porId = {};
      (data.alertas || []).forEach((alerta) => {
        porId[alerta.plato_id] = alerta;
      });
      setAlertasPorPlato(porId);
    } catch {
      setAlertasPorPlato({});
    }
  }

  function tieneAlergeno(plato) {
    const alerta = alertasPorPlato[plato.id];
    if (alerta?.advertencias?.some((a) => a.nivel === "peligro")) return true;
    if (!perfil?.alergias) return false;
    const alergenosPlato = (plato.alergenos || []).map(normalizarTexto);
    return perfil.alergias.some(
      (a) =>
        normalizarTexto(a) !== "ninguna" &&
        alergenosPlato.includes(normalizarTexto(a)),
    );
  }

  return {
    platos,
    categorias,
    cargando,
    filtros,
    setFiltros,
    perfil,
    tieneAlergeno,
    alertasPorPlato,
  };
}

function normalizarTexto(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
