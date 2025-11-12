import { Client } from "@stomp/stompjs";
import { v4 as uuidv4 } from "uuid";
import SockJS from "sockjs-client";

class WebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.subscriptions = new Map();
  }

  // 웹소켓 연결
  connect(wsUrl, token, onConnect, onError) {
    if (this.isConnected) {
      return;
    }

    // SockJS는 http:// 또는 https:// URL만 받을 수 있으므로 변환
    let httpUrl = wsUrl;
    
    // 현재 페이지가 HTTPS인지 확인
    const isSecurePage = window.location.protocol === "https:";
    
    if (wsUrl.startsWith("ws://")) {
      // HTTPS 페이지에서는 반드시 https:// 사용
      if (isSecurePage) {
        httpUrl = wsUrl.replace("ws://", "https://");
      } else {
        httpUrl = wsUrl.replace("ws://", "http://");
      }
    } else if (wsUrl.startsWith("wss://")) {
      httpUrl = wsUrl.replace("wss://", "https://");
    } else if (wsUrl.startsWith("http://") && isSecurePage) {
      // HTTP URL인데 HTTPS 페이지라면 HTTPS로 변환
      httpUrl = wsUrl.replace("http://", "https://");
    }

    // SockJS를 사용하여 연결
    const socket = new SockJS(httpUrl);

    this.client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (_frame) => {
        this.isConnected = true;
        if (onConnect) onConnect(_frame);
      },
      onStompError: (frame) => {
        this.isConnected = false;
        if (onError) onError(frame);
      },
      onWebSocketClose: (_event) => {
        this.isConnected = false;
        this.subscriptions.clear();
      },
      onDisconnect: () => {
        this.isConnected = false;
        this.subscriptions.clear();
      },
    });

    this.client.activate();
  }

  // 발표자: 페이지 변경 이벤트 전송
  sendPageChange(sessionId, beforePage, changedPage) {
    this.send(
      `/app/presentation/${sessionId}/pageChange/presenter`,
      { beforePage, changedPage },
      { "Idempotency-Key": uuidv4() }
    );
  }

  // 청중: 페이지 변경 이벤트 전송
  sendAudiencePageChange(sessionId, audienceId, beforePage, changedPage) {
    this.send(
      `/app/presentation/${sessionId}/pageChange/audience`,
      { audienceId, beforePage, changedPage },
      { "Idempotency-Key": uuidv4() }
    );
  }

  // 발표자: 집중 유도 전송
  sendFocusOn(sessionId) {
    const destination = `/app/presentation/${sessionId}/focusOn`;
    this.send(destination, {}, { "Idempotency-Key": uuidv4() });
  }

  // 발표자: 옵션 변경 전송 (리액션 스티커, 질문, 실시간 피드백)
  sendOptionChange(sessionId, options) {
    const body = {
      sticker: String(options.sticker),
      question: String(options.question),
      feedback: String(options.feedback),
    };
    
    this.send(
      `/app/presentation/${sessionId}/option`,
      body,
      { "Idempotency-Key": uuidv4() }
    );
  }

  // 발표자: 다음 슬라이드 공개 옵션 변경 전송
  sendUnlockChange(sessionId, unlock) {
    const destination = `/app/presentation/${sessionId}/option/unlock/${unlock}`;

    this.send(destination, {}, { "Idempotency-Key": uuidv4() });
  }

  subscribe(destination, callback) {
    if (!this.isConnected || !this.client) {
      return () => {};
    }

    // 이미 구독 중이면 해제 후 재구독
    if (this.subscriptions.has(destination)) {
      this.unsubscribe(destination);
    }

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        if (callback) callback(data);
      } catch (_error) {
        // ignore parse error
      }
    });

    this.subscriptions.set(destination, subscription);

    // 구독 해제 함수 반환
    return () => this.unsubscribe(destination);
  }

  subscribeText(destination, callback) {
    if (!this.isConnected || !this.client) {
      return () => {};
    }

    if (this.subscriptions.has(destination)) {
      this.unsubscribe(destination);
    }

    const subscription = this.client.subscribe(destination, (message) => {
      const rawBody = message?.body ?? "";
      if (callback) {
        callback(rawBody);
      }
    });

    this.subscriptions.set(destination, subscription);

    return () => this.unsubscribe(destination);
  }

  // 구독 해제
  // destination: 구독 해제할 토픽
  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  send(destination, body, headers = {}) {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      this.client.publish({
        destination,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(body),
      });
    } catch (_error) {
      // ignore publish error
    }
  }

  // 웹소켓 연결 해제
  disconnect() {
    if (this.client) {
      this.subscriptions.forEach((subscription, destination) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();

      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
    }
  }

  getIsConnected() {
    return this.isConnected;
  }
}

const websocketService = new WebSocketService();

export { WebSocketService };
export default websocketService;
