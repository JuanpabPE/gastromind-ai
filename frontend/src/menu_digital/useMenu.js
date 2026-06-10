import { useState, useEffect } from "react";
import { obtenerMenu, obtenerCategorias } from "./menuApi";
import { usePerfil } from "../perfil_nutricional/usePerfil";

export function useMenu() {
  const [platos, setPlatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtros, setFiltros] = useState({
    categoria: "",
    vegetariano: false,
    vegano: false,
    sinGluten: false,
    diabetes: false,
    hipertension: false,
    caloriasMax: 1000,
    proteinasMin: 0,
  });
  const [perfil, setPerfil] = useState(null);
  const { obtenerPerfil } = usePerfil();

  useEffect(() => {
    async function init() {
      const [cats, perfilData] = await Promise.all([
        obtenerCategorias(),
        obtenerPerfil(),
      ]);
      setCategorias(cats);
      setPerfil(perfilData);

      // Aplica filtros automáticos según el perfil del usuario
      if (perfilData) {
        setFiltros((f) => ({
          ...f,
          sinGluten: perfilData.alergias?.includes("Gluten") || false,
          diabetes: perfilData.enfermedades?.includes("Diabetes") || false,
          hipertension:
            perfilData.enfermedades?.includes("Hipertensión") || false,
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
      setCargando(false);
    }
    cargar();
  }, [filtros]);

  function tieneAlergeno(plato) {
    if (!perfil?.alergias) return false;
    return perfil.alergias.some((a) =>
      plato.alergenos?.includes(a.toLowerCase()),
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
  };
}
