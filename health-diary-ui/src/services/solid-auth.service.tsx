import {
  login,
  handleIncomingRedirect,
  getDefaultSession,
  logout,
} from "@inrupt/solid-client-authn-browser";

export const solidAuth = {
  login: async () => {
    await login({
      oidcIssuer: "https://datapod.igrant.io/",
      redirectUrl: window.location.href,
      clientName: "My React App",
    });
  },

  handleRedirect: async () => {
    await handleIncomingRedirect(window.location.href);
    return getDefaultSession();
  },

  getSession: () => getDefaultSession(),

  logout: async () => {
    await logout();
     window.location.href = "/";
  },
};
