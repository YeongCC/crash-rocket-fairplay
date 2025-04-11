export function getOrCreateUsername(): string {
    let username = localStorage.getItem("crash-username");
    if (!username) {
      username = "Player_" + Math.floor(Math.random() * 99999);
      localStorage.setItem("crash-username", username);
    }
    return username;
  }
  