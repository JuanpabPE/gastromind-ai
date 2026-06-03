// Mock de Supabase para desarrollo - evita rate limiting
// En producción, cambiar a supabase real

const STORAGE_KEY = "supabase_users";
const SESSION_KEY = "supabase_session";

function getUsers() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getSession() {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

function saveSession(session) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export const supabase = {
  auth: {
    signUp: async ({ email, password, options }) => {
      const users = getUsers();

      // Validar que el email no exista
      if (users[email]) {
        return {
          data: null,
          error: { message: "El usuario ya existe" },
        };
      }

      // Crear usuario
      const userId = "user_" + Math.random().toString(36).substr(2, 9);
      users[email] = {
        id: userId,
        email,
        password, // En producción NUNCA guardar en plain text
        data: options?.data || {},
      };
      saveUsers(users);

      return {
        data: {
          user: {
            id: userId,
            email,
            user_metadata: options?.data || {},
          },
        },
        error: null,
      };
    },

    signInWithPassword: async ({ email, password }) => {
      const users = getUsers();
      const user = users[email];

      // Validar credenciales
      if (!user || user.password !== password) {
        return {
          data: null,
          error: { message: "Email o contraseña incorrectos" },
        };
      }

      // Crear sesión
      const session = {
        user: {
          id: user.id,
          email,
          user_metadata: user.data,
        },
        access_token: "mock_token_" + Math.random().toString(36),
      };

      saveSession(session);

      return {
        data: { session, user: session.user },
        error: null,
      };
    },

    signOut: async () => {
      saveSession(null);
      return { error: null };
    },

    getUser: async () => {
      const session = getSession();
      if (session) {
        return {
          data: { user: session.user },
          error: null,
        };
      }
      return {
        data: { user: null },
        error: null,
      };
    },
  },

  from: (table) => ({
    upsert: async (data, options) => {
      // Mock de tabla "perfiles"
      if (table === "perfiles") {
        const profiles = JSON.parse(localStorage.getItem("perfiles") || "{}");
        profiles[data.usuario_id] = data;
        localStorage.setItem("perfiles", JSON.stringify(profiles));
        return { data, error: null };
      }

      // Mock de tabla "menu"
      if (table === "menu") {
        const menu = JSON.parse(localStorage.getItem("menu") || "[]");
        return { data: menu, error: null };
      }

      return { data: null, error: { message: "Tabla no encontrada" } };
    },

    select: function (columns) {
      return {
        eq: function (field, value) {
          return {
            single: async () => {
              if (table === "perfiles") {
                const profiles = JSON.parse(
                  localStorage.getItem("perfiles") || "{}",
                );
                const profile = profiles[value];
                if (profile) {
                  return { data: profile, error: null };
                }
                return { data: null, error: { message: "No encontrado" } };
              }
              return { data: null, error: null };
            },
          };
        },
      };
    },
  }),
};
