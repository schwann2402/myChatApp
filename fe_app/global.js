import { create } from "zustand";
import { save, remove, getValueFor } from "@/secure";
import api, { address } from "@/api";
import utils from "@/utils";

// Socket response handlers
function responseThumbnail(set, get, data) {
  // Log the received data for debugging
  utils.log("Thumbnail response received:", data);

  // Get the current user state
  const currentUser = get().user;

  // Extract the user data from the response
  // The data comes in as { source: 'thumbnail', data: userData }
  const userData = data.data || data;

  // Create a new user object by merging the current user with the new data
  const updatedUser = {
    ...currentUser,
    ...userData,
  };

  utils.log("Updated user with new thumbnail:", updatedUser);

  // Update the state with the merged user object
  set((state) => ({
    user: updatedUser,
  }));
}

function responseSearch(set, get, data) {
  utils.log("Search response received:", data);

  const searchResults = data.results || data;

  // Create a new user object by merging the current user with the new data
  utils.log("Updated user with search results:", searchResults);

  // Update the state with the merged user object
  set((state) => ({
    searchResults: searchResults,
  }));
}

function responseRequestConnect(set, get, connection) {
  const user = get().user;
  // If I make the request, update search list
  if (user.username === connection.username) {
    const searchResults = [...get().searchResults];
    const index = searchResults.findIndex(
      (request) => request.username === connection.username
    );
    if (index !== -1) {
      searchResults[index].status = "pending-them";
      set((state) => ({
        searchResults: searchResults,
      }));
    }
    // If I receive the request add to requests list
  } else {
    return;
  }
}

function responseRequestList(set, get, data) {
  utils.log("Request list response received:", data);

  const requests = data.data;

  // Create a new user object by merging the current user with the new data
  utils.log("Updated user with request list:", requests);

  // Update the state with the merged user object
  set((state) => ({
    requests: requests,
  }));
}
const useGlobal = create((set, get) => ({
  // initialization...
  initialized: false,
  async init() {
    try {
      console.log("Initializing app...");

      // First check if we have tokens (faster than re-authenticating)
      const tokensString = await getValueFor("tokens");
      if (tokensString) {
        try {
          const tokens = JSON.parse(tokensString);
          console.log("Found existing tokens");

          // We have tokens, so we can set authenticated to true immediately
          // This will prevent the login screen flash
          set({ authenticated: true });

          // Now try to get the user data if we have credentials
          const credentialsString = await getValueFor("credentials");
          if (credentialsString) {
            // Parse the credentials string into an object
            const credentials = JSON.parse(credentialsString);
            console.log("Retrieved credentials, refreshing user data");

            // Refresh the user data in the background
            try {
              const response = await api.post("/chat/signin/", {
                username: credentials.username,
                password: credentials.password,
              });

              if (response.status === 200) {
                const user = response.data.user;
                const newTokens = response.data.tokens;

                // Update tokens if they exist
                if (newTokens) {
                  console.log("Refreshed tokens");
                  save("tokens", newTokens);
                }

                // Update user data
                set({ user: user || {} });
                console.log("User data refreshed");
              }
            } catch (refreshError) {
              console.warn(
                "Could not refresh user data, using existing authentication",
                refreshError
              );
            }
          }
        } catch (tokenError) {
          console.error("Error parsing tokens:", tokenError);
          set({ authenticated: false });
        }
      } else {
        // No tokens found, try to authenticate with credentials
        const credentialsString = await getValueFor("credentials");
        if (credentialsString) {
          try {
            // Parse the credentials string into an object
            const credentials = JSON.parse(credentialsString);
            console.log(
              "No tokens found, trying to authenticate with credentials"
            );

            const response = await api.post("/chat/signin/", {
              username: credentials.username,
              password: credentials.password,
            });

            if (response.status === 200) {
              const user = response.data.user;
              const tokens = response.data.tokens;

              // Save tokens if they exist
              if (tokens) {
                console.log("Authentication successful, saving tokens");
                save("tokens", tokens);
              } else {
                console.warn("No tokens received from authentication");
              }

              set({ authenticated: true, user: user || {} });
            } else {
              throw new Error(
                `Authentication failed with status ${response.status}`
              );
            }
          } catch (authError) {
            console.error("Authentication error:", authError);
            set({ authenticated: false });
          }
        } else {
          // No credentials or tokens found
          console.log(
            "No credentials or tokens found, user is not authenticated"
          );
          set({ authenticated: false });
        }
      }
    } catch (error) {
      console.error("Initialization error:", error);
      set({ authenticated: false });
    } finally {
      // Always set initialized to true when we're done
      set({ initialized: true });
      console.log(
        "Initialization complete, authenticated:",
        get().authenticated
      );
      return get().authenticated; // Return the authentication state for convenience
    }
  },

  // Authentication...
  authenticated: false,
  user: {},

  login: (credentials, user, tokens) => {
    console.log("Login called with:", {
      hasCredentials: !!credentials,
      hasUser: !!user,
      hasTokens: !!tokens,
    });

    // Only save credentials if they exist
    if (credentials) {
      save("credentials", credentials);
    } else {
      console.warn("No credentials provided to login function");
    }

    // Only save tokens if they exist
    if (tokens) {
      console.log("Login tokens", tokens);
      save("tokens", tokens);
    } else {
      console.warn("No tokens provided to login function");
    }

    set({ authenticated: true, user: user || {} });
  },
  logout: () => {
    remove("credentials");
    remove("tokens");
    get().socketClose();
    set({ authenticated: false, user: {} });
  },

  // search //
  searchResults: [],

  searchUsers: async (query) => {
    if (query) {
      const socket = get().socket;
      console.log("socket", socket);
      if (!socket) {
        return;
      }
      socket.send(
        JSON.stringify({
          source: "search",
          query: query,
        })
      );
    } else {
      set({ searchResults: [] });
    }
  },

  // Requests
  requests: [],
  requestConnect: async (username) => {
    const socket = get().socket;
    if (!socket) {
      return;
    }
    socket.send(
      JSON.stringify({
        source: "request.connect",
        username: username,
      })
    );
  },

  // Socket
  socket: null,
  socketConnect: async () => {
    const tokensString = await getValueFor("tokens");
    if (!tokensString) {
      return;
    }
    const tokens = JSON.parse(tokensString);

    const socket = new WebSocket(
      `ws://${address}/chat/?token=${tokens.access}`
    );
    socket.onopen = () => {
      utils.log("socket opened");

      socket.send(
        JSON.stringify({
          source: "request.list",
        })
      );
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      utils.log("Socket message received - RAW DATA:", e.data);
      utils.log("Socket message received - PARSED:", data);
      utils.log("Socket message source:", data.source);

      const responses = {
        "request.list": responseRequestList,
        "request.connect": responseRequestConnect,
        thumbnail: responseThumbnail,
        search: responseSearch,
      };

      const resp = responses[data.source];
      if (!resp) {
        utils.log("data.source not found", data.source);
        return;
      }

      // Call the response function
      resp(set, get, data);
    };
    socket.onerror = (e) => {
      utils.log("socket error", e.message);
    };
    socket.onclose = () => {
      utils.log("socket closed");
    };
    set({ socket });
  },
  socketClose: () => {
    const socket = get().socket;
    if (socket) {
      socket.close();
      set({ socket: null });
    }
  },

  uploadThumbnail: (image) => {
    const socket = get().socket;
    if (!socket || !image) {
      return;
    }

    let filename = image.fileName;
    if (!filename && image.uri) {
      const uriParts = image.uri.split("/");
      filename = uriParts[uriParts.length - 1];

      if (!filename.includes(".")) {
        filename += ".jpg";
      }
    }

    socket.send(
      JSON.stringify({
        source: "thumbnail",
        base64: image.base64,
        filename: filename,
      })
    );
  },
}));

export default useGlobal;
