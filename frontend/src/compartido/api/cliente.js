import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Inicialización: detectar tokens inválidos (p. ej. "Invalid Refresh Token")
// y limpiar la sesión para evitar errores al cargar la app.
(async function initAuthCleanup() {
	try {
		const { data, error } = await supabase.auth.getUser();
		if (error && typeof error.message === "string") {
			const msg = error.message.toLowerCase();
			if (msg.includes("refresh token") || msg.includes("invalid refresh")) {
				console.warn("Auth init: token inválido detectado, limpiando sesión...");
				try {
					await supabase.auth.signOut();
				} catch (e) {
					console.warn("Error durante signOut de limpieza:", e);
				}
				try {
					localStorage.clear();
					sessionStorage.clear();
				} catch (e) {
					console.warn("No se pudo limpiar storage:", e);
				}
			}
		}
	} catch (e) {
		console.warn("Inicialización de auth falló:", e);
	}
})();
