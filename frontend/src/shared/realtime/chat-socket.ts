export function createChatSocketUrl(chatId: string, accessToken: string) {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const url = new URL(`${protocol}//${window.location.host}/api/v1/ws/chats/${chatId}`);
  url.searchParams.set("token", accessToken);
  return url.toString();
}
