const voiceCommands = [
  { keywords: ["dashboard", "dash", "home", "dashboard kholo", "open dashboard"], route: "/dashboard" },

  { keywords: ["product", "products", "products kholo", "open products"], route: "/products" },

  { keywords: ["bill", "billing", "billing kholo", "open billing"], route: "/billing" },

  { keywords: ["report", "reports", "reports kholo", "open reports"], route: "/reports" },

  { keywords: ["setting", "settings", "settings kholo", "open settings"], route: "/settings" },

  { keywords: ["staff", "staff kholo", "open staff"], route: "/staff" },

  { keywords: ["customer", "customers", "open customer", "customer page", "customers kholo"], route: "/customers" },

  { keywords: ["back", "go back", "peeche", "peeche jao", "back jao"], action: "back" },

  { keywords: ["logout", "log out", "sign out", "logout karo"], action: "logout" },

  { keywords: ["mic off", "stop listening", "band karo", "stop", "close"], action: "mic_off" },
];

export default voiceCommands;