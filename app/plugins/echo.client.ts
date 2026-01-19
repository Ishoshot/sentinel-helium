/**
 * Laravel Echo plugin for WebSocket communication with Laravel Reverb
 *
 * This plugin initializes Echo with Reverb configuration and provides
 * a global $echo instance for real-time event listening.
 */

import Echo from "laravel-echo";
import Pusher, { type ChannelAuthorizationCallback } from "pusher-js";
import { getToken } from "~/services/core/api";

// Make Pusher available globally for Echo
if (typeof window !== "undefined") {
  (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  // Create Echo instance with Reverb configuration
  const echo = new Echo({
    broadcaster: "reverb",
    key: config.public.reverbAppKey as string,
    wsHost: config.public.reverbHost as string,
    wsPort: Number(config.public.reverbPort),
    wssPort: Number(config.public.reverbPort),
    forceTLS: (config.public.reverbScheme as string) === "https",
    enabledTransports: ["ws", "wss"],
    // Custom authorizer to get fresh auth headers on each request
    authorizer: (channel: { name: string }, _options: unknown) => {
      return {
        authorize: (
          socketId: string,
          callback: ChannelAuthorizationCallback
        ) => {
          const token = getToken();

          if (!token) {
            callback(new Error("No auth token available"), null);
            return;
          }

          fetch(`${config.public.apiBaseUrl}/broadcasting/auth`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              socket_id: socketId,
              channel_name: channel.name,
            }),
            credentials: "include",
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Auth failed with status ${response.status}`);
              }
              return response.json();
            })
            .then((data) => callback(null, data))
            .catch((error) => callback(error, null));
        },
      };
    },
  });

  return {
    provide: {
      echo,
    },
  };
});
