import { Client, IFrame, IMessage, StompSubscription } from "@stomp/stompjs";
import { v4 as uuidv4 } from "uuid";
import SockJS from "sockjs-client";
import type { QuickSettings } from "@/entities/session";
import { createLogger } from "@/shared/lib/logger";

const log = createLogger("ws");

export class WebSocketService {
  private client: Client | null = null;
  private _isConnected = false;
  private subscriptions = new Map<string, StompSubscription>();

  get isConnected() {
    return this._isConnected;
  }

  connect(
    wsUrl: string,
    token: string,
    onConnect?: (frame: IFrame) => void,
    onError?: (frame: IFrame) => void
  ) {
    if (this._isConnected) return;

    let httpUrl = wsUrl;
    const isSecure = window.location.protocol === "https:";

    if (wsUrl.startsWith("ws://")) {
      httpUrl = wsUrl.replace("ws://", isSecure ? "https://" : "http://");
    } else if (wsUrl.startsWith("wss://")) {
      httpUrl = wsUrl.replace("wss://", "https://");
    } else if (wsUrl.startsWith("http://") && isSecure) {
      httpUrl = wsUrl.replace("http://", "https://");
    }

    const socket = new SockJS(httpUrl);

    this.client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        this._isConnected = true;
        log.log("Connected");
        onConnect?.(frame);
      },
      onStompError: (frame) => {
        this._isConnected = false;
        log.error("STOMP error", frame);
        onError?.(frame);
      },
      onWebSocketClose: () => {
        this._isConnected = false;
        this.subscriptions.clear();
      },
      onDisconnect: () => {
        this._isConnected = false;
        this.subscriptions.clear();
      },
    });

    this.client.activate();
  }

  // * Presenter: page change (0-based indices → 1-based for server)
  sendPageChange(sessionId: string, beforePageIndex: number, changedPageIndex: number) {
    const body = { beforePage: beforePageIndex + 1, changedPage: changedPageIndex + 1 };
    log.log("Page change", body);
    this.send(`/app/presentation/${sessionId}/pageChange/presenter`, body, {
      "Idempotency-Key": uuidv4(),
    });
  }

  sendAudiencePageChange(
    sessionId: string,
    audienceId: string,
    beforePage: number,
    changedPage: number
  ) {
    const body = { audienceId, beforePage, changedPage };
    log.log("Audience page change", body);
    this.send(`/app/presentation/${sessionId}/pageChange/audience`, body, {
      "Idempotency-Key": uuidv4(),
    });
  }

  sendFocusOn(sessionId: string) {
    this.send(`/app/presentation/${sessionId}/focusOn`, {}, { "Idempotency-Key": uuidv4() });
  }

  sendOptionChange(sessionId: string, options: Omit<QuickSettings, "unlock">) {
    const body = {
      sticker: String(options.sticker),
      question: String(options.question),
      feedback: String(options.feedback),
    };
    this.send(`/app/presentation/${sessionId}/option`, body, { "Idempotency-Key": uuidv4() });
  }

  sendUnlockChange(sessionId: string, unlock: boolean | string) {
    this.send(
      `/app/presentation/${sessionId}/option/unlock/${unlock}`,
      {},
      { "Idempotency-Key": uuidv4() }
    );
  }

  sendEndSession(sessionId: string) {
    if (!this._isConnected || !this.client) {
      log.warn("Cannot send end session — not connected");
      return;
    }

    try {
      this.client.publish({
        destination: `/app/presentation/${sessionId}/end`,
        headers: { "Content-Type": "text/plain", "Idempotency-Key": uuidv4() },
        body: "end",
      });
      log.log("End session sent", sessionId);
    } catch (error) {
      log.error("Failed to send end session", error);
    }
  }

  subscribe<T = any>(destination: string, callback: (data: T) => void): () => void {
    if (!this._isConnected || !this.client) return () => {};

    if (this.subscriptions.has(destination)) {
      this.unsubscribe(destination);
    }

    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body) as T;
        callback(data);
      } catch {
        if (typeof message.body === "string") {
          callback(message.body as any);
        }
      }
    });

    this.subscriptions.set(destination, subscription);
    return () => this.unsubscribe(destination);
  }

  subscribeText(destination: string, callback: (body: string) => void): () => void {
    if (!this._isConnected || !this.client) return () => {};

    if (this.subscriptions.has(destination)) {
      this.unsubscribe(destination);
    }

    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      callback(message?.body ?? "");
    });

    this.subscriptions.set(destination, subscription);
    return () => this.unsubscribe(destination);
  }

  unsubscribe(destination: string) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  send(destination: string, body: any, headers: Record<string, string> = {}) {
    if (!this._isConnected || !this.client) return;

    try {
      this.client.publish({
        destination,
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body),
      });
    } catch {
      // ignore publish error
    }
  }

  disconnect() {
    if (this.client) {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
      this._isConnected = false;
    }
  }

  getIsConnected() {
    return this._isConnected;
  }
}

const websocketService = new WebSocketService();
export default websocketService;
