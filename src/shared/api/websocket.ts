import { Client, IFrame, IMessage, StompSubscription } from "@stomp/stompjs";
import { v4 as uuidv4 } from "uuid";
import SockJS from "sockjs-client";
import posthog from "posthog-js";
import { ANALYTICS_EVENTS } from "@/shared/config/analytics-events";
import type { QuickSettings } from "@/entities/session";
import { createLogger } from "@/shared/lib/logger";

const log = createLogger("ws");

type SubscriptionHandle = {
  unsubscribe: () => void;
};

type RetainedSubscription = {
  handle: SubscriptionHandle | null;
  // Raw STOMP frame handler, retained so an auto-reconnect can replay the
  // subscription. Absent for test-transport subscriptions (never drop).
  messageHandler?: (message: IMessage) => void;
};

type ConnectOptions = {
  // Fired on an unexpected socket drop (not on intentional disconnect()), so
  // consumers can flip readiness state and re-subscribe fresh after reconnect.
  onDisconnect?: () => void;
  // Telemetry label. Callers know their role; the URL sniff is only a fallback.
  channel?: "presenter" | "audience";
};

type TestTransportKind = "json" | "text";

type TestTransportConnectArgs = {
  serviceId: string;
  wsUrl: string;
  token: string;
  onConnect?: (frame: IFrame) => void;
  onError?: (frame: IFrame) => void;
};

type TestTransportSubscribeArgs = {
  serviceId: string;
  destination: string;
  kind: TestTransportKind;
  callback: (payload: unknown) => void;
};

type TestTransportPublishArgs = {
  serviceId: string;
  destination: string;
  headers?: Record<string, string>;
  body: unknown;
};

interface TestWebSocketTransport {
  connect: (args: TestTransportConnectArgs) => void;
  disconnect: (serviceId: string) => void;
  subscribe: (args: TestTransportSubscribeArgs) => (() => void) | SubscriptionHandle;
  publish: (args: TestTransportPublishArgs) => void;
  isConnected?: (serviceId: string) => boolean;
}

declare global {
  interface Window {
    __BOINI_TEST_MODE__?: boolean;
    __BOINI_TEST_WS__?: TestWebSocketTransport;
  }
}

let nextServiceId = 0;

const toSubscriptionHandle = (
  subscription: StompSubscription | (() => void) | SubscriptionHandle
): SubscriptionHandle =>
  typeof subscription === "function"
    ? { unsubscribe: subscription }
    : "unsubscribe" in subscription
      ? subscription
      : { unsubscribe: () => {} };

const getTestTransport = () =>
  typeof window !== "undefined" && window.__BOINI_TEST_MODE__
    ? window.__BOINI_TEST_WS__
    : undefined;

export class WebSocketService {
  private client: Client | null = null;
  private _isConnected = false;
  private subscriptions = new Map<string, RetainedSubscription>();
  private readonly serviceId = `ws-service-${nextServiceId++}`;
  // Telemetry: distinguish unexpected drops (analytics-worthy) from intentional disconnect().
  private disconnectedAt: number | null = null;
  private intentionalDisconnect = false;
  private channel: "presenter" | "audience" = "presenter";

  get isConnected() {
    return this._isConnected;
  }

  connect(
    wsUrl: string,
    token: string,
    onConnect?: (frame: IFrame) => void,
    onError?: (frame: IFrame) => void,
    options?: ConnectOptions
  ) {
    this.intentionalDisconnect = false;
    this.channel = options?.channel ?? (wsUrl.includes("/audience") ? "audience" : "presenter");

    const testTransport = getTestTransport();
    if (testTransport) {
      if (this.getIsConnected()) return;

      testTransport.connect({
        serviceId: this.serviceId,
        wsUrl,
        token,
        onConnect: (frame) => {
          this._isConnected = true;
          onConnect?.(frame);
        },
        onError: (frame) => {
          this._isConnected = false;
          onError?.(frame);
        },
      });
      return;
    }

    if (this._isConnected) return;

    // A previous client may still be auto-reconnecting after a drop — retire it
    // so two live Clients can't double-subscribe.
    if (this.client) {
      this.client.deactivate().catch(() => {});
      this.client = null;
    }

    let httpUrl = wsUrl;
    const isSecure = window.location.protocol === "https:";

    if (wsUrl.startsWith("ws://")) {
      httpUrl = wsUrl.replace("ws://", isSecure ? "https://" : "http://");
    } else if (wsUrl.startsWith("wss://")) {
      httpUrl = wsUrl.replace("wss://", "https://");
    } else if (wsUrl.startsWith("http://") && isSecure) {
      httpUrl = wsUrl.replace("http://", "https://");
    }

    // Callbacks close over `client` and bail when a newer connect() has replaced
    // this.client — an orphaned client's async events must not clobber live state.
    const client: Client = new Client({
      // SockJS instances are single-use — a fresh one per (re)connect attempt,
      // otherwise stompjs' auto-reconnect reuses a dead socket and never recovers.
      webSocketFactory: () => new SockJS(httpUrl),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        if (this.client !== client) return;
        this._isConnected = true;
        log.log("Connected");
        const resubscribed = this.resubscribeRetained();
        if (this.disconnectedAt != null) {
          posthog.capture(ANALYTICS_EVENTS.WS_RECONNECTED, {
            channel: this.channel,
            service_id: this.serviceId,
            downtime_ms: Date.now() - this.disconnectedAt,
            resubscribed_topics: resubscribed,
          });
          this.disconnectedAt = null;
        }
        onConnect?.(frame);
      },
      onStompError: (frame) => {
        if (this.client !== client) return;
        this._isConnected = false;
        log.error("STOMP error", frame);
        onError?.(frame);
      },
      onWebSocketClose: () => {
        if (this.client !== client) return;
        // Only report drops of an established connection; deactivate() closes are expected.
        const wasConnected = this._isConnected && !this.intentionalDisconnect;
        if (wasConnected) {
          this.disconnectedAt = Date.now();
          posthog.capture(ANALYTICS_EVENTS.WS_DISCONNECTED, {
            channel: this.channel,
            service_id: this.serviceId,
          });
        }
        this._isConnected = false;
        this.invalidateSubscriptions();
        if (wasConnected) options?.onDisconnect?.();
      },
      onDisconnect: () => {
        if (this.client !== client) return;
        this._isConnected = false;
        this.invalidateSubscriptions();
      },
    });

    this.client = client;
    client.activate();
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
    const testTransport = getTestTransport();
    if (testTransport) {
      if (!this.getIsConnected()) {
        log.warn("Cannot send end session — not connected");
        return;
      }

      testTransport.publish({
        serviceId: this.serviceId,
        destination: `/app/presentation/${sessionId}/end`,
        headers: { "Content-Type": "text/plain", "Idempotency-Key": uuidv4() },
        body: "end",
      });
      return;
    }

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

  // The socket died: STOMP subscription handles are gone with it. Keep the specs
  // so resubscribeRetained() can replay them after auto-reconnect — unless the app
  // disconnected on purpose, in which case drop everything.
  private invalidateSubscriptions() {
    if (this.intentionalDisconnect) {
      this.subscriptions.clear();
      return;
    }
    this.subscriptions.forEach((entry) => {
      entry.handle = null;
    });
  }

  // Replay retained subscriptions on a fresh STOMP session. Returns how many.
  private resubscribeRetained(): number {
    if (!this.client) return 0;
    let count = 0;
    this.subscriptions.forEach((entry, destination) => {
      if (entry.handle || !entry.messageHandler) return;
      entry.handle = toSubscriptionHandle(
        this.client!.subscribe(destination, entry.messageHandler)
      );
      count += 1;
    });
    if (count > 0) log.log(`Resubscribed ${count} topics after reconnect`);
    return count;
  }

  subscribe<T = any>(destination: string, callback: (data: T) => void): () => void {
    const testTransport = getTestTransport();
    if (testTransport) {
      if (!this.getIsConnected()) return () => {};

      if (this.subscriptions.has(destination)) {
        this.unsubscribe(destination);
      }

      const subscription = toSubscriptionHandle(
        testTransport.subscribe({
          serviceId: this.serviceId,
          destination,
          kind: "json",
          callback: (data) => callback(data as T),
        })
      );

      this.subscriptions.set(destination, { handle: subscription });
      return () => this.unsubscribe(destination);
    }

    if (this.subscriptions.has(destination)) {
      this.unsubscribe(destination);
    }

    const messageHandler = (message: IMessage) => {
      try {
        const data = JSON.parse(message.body) as T;
        callback(data);
      } catch {
        if (typeof message.body === "string") {
          callback(message.body as any);
        }
      }
    };

    // While disconnected, retain the spec as pending — resubscribeRetained()
    // replays it on (re)connect instead of silently dropping the subscription.
    const handle =
      this._isConnected && this.client
        ? toSubscriptionHandle(this.client.subscribe(destination, messageHandler))
        : null;

    this.subscriptions.set(destination, { handle, messageHandler });
    return () => this.unsubscribe(destination);
  }

  subscribeText(destination: string, callback: (body: string) => void): () => void {
    const testTransport = getTestTransport();
    if (testTransport) {
      if (!this.getIsConnected()) return () => {};

      if (this.subscriptions.has(destination)) {
        this.unsubscribe(destination);
      }

      const subscription = toSubscriptionHandle(
        testTransport.subscribe({
          serviceId: this.serviceId,
          destination,
          kind: "text",
          callback: (body) => callback(String(body ?? "")),
        })
      );

      this.subscriptions.set(destination, { handle: subscription });
      return () => this.unsubscribe(destination);
    }

    if (this.subscriptions.has(destination)) {
      this.unsubscribe(destination);
    }

    const messageHandler = (message: IMessage) => {
      callback(message?.body ?? "");
    };

    const handle =
      this._isConnected && this.client
        ? toSubscriptionHandle(this.client.subscribe(destination, messageHandler))
        : null;

    this.subscriptions.set(destination, { handle, messageHandler });
    return () => this.unsubscribe(destination);
  }

  unsubscribe(destination: string) {
    const entry = this.subscriptions.get(destination);
    if (entry) {
      entry.handle?.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  send(destination: string, body: any, headers: Record<string, string> = {}) {
    const testTransport = getTestTransport();
    if (testTransport) {
      if (!this.getIsConnected()) return;

      testTransport.publish({
        serviceId: this.serviceId,
        destination,
        headers: { "Content-Type": "application/json", ...headers },
        body,
      });
      return;
    }

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
    this.intentionalDisconnect = true;
    this.disconnectedAt = null;

    const testTransport = getTestTransport();
    if (testTransport) {
      this.subscriptions.forEach((entry) => entry.handle?.unsubscribe());
      this.subscriptions.clear();
      testTransport.disconnect(this.serviceId);
      this.client = null;
      this._isConnected = false;
      return;
    }

    if (this.client) {
      this.subscriptions.forEach((entry) => entry.handle?.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
      this._isConnected = false;
    }
  }

  getIsConnected() {
    const testTransport = getTestTransport();
    if (testTransport?.isConnected) {
      return testTransport.isConnected(this.serviceId);
    }

    return this._isConnected;
  }
}

const websocketService = new WebSocketService();
export default websocketService;
