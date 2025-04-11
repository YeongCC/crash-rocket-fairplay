export function getOrCreateUsername(): string {
    let username = localStorage.getItem("crash-username");
    if (!username) {
      username = "Player_" + crypto.randomUUID().slice(0, 8);  
      localStorage.setItem("crash-username", username);
    }
    return username;
  }
  