const voiceCommands = [
  { keywords: ["dashboard", "dash", "home", "dashboard kholo", "open dashboard page"], route: "/dashboard" },

  { keywords: ["product", "products", "products kholo", "open products page"], route: "/products" },

  { keywords: ["bill", "billing", "billing kholo", "open billing page"], route: "/billing" },

  { keywords: ["report", "reports", "reports kholo", "open reports page"], route: "/reports" },

  { keywords: ["setting", "settings", "settings kholo", "open settings page"], route: "/settings" },

  { keywords: ["staff", "staff kholo", "open staff page"], route: "/staff" },

  { keywords: ["customer", "customers", "open customer page", "customer page", "customers kholo"], route: "/customers" },

  { keywords: ["back", "go back", "peeche", "peeche jao", "back jao"], action: "back" },

  { keywords: ["logout", "log out", "sign out", "logout karo"], action: "logout" },

  { keywords: ["mic off", "stop listening", "band karo", "stop", "close"], action: "mic_off" },
];

export default voiceCommands;