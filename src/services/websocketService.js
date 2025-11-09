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
      console.warn("[WebSocket] 이미 연결되어 있습니다.");
      return;
    }

    // SockJS는 http:// 또는 https:// URL만 받을 수 있으므로 변환
    let httpUrl = wsUrl;
    if (wsUrl.startsWith("ws://")) {
      httpUrl = wsUrl.replace("ws://", "http://");
      console.log("[WebSocket] ws:// -> http:// 변환:", httpUrl);
    } else if (wsUrl.startsWith("wss://")) {
      httpUrl = wsUrl.replace("wss://", "https://");
      console.log("[WebSocket] wss:// -> https:// 변환:", httpUrl);
    }

    // SockJS를 사용하여 연결
    const socket = new SockJS(httpUrl);

    this.client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log("[STOMP Debug]", str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        console.log("[WebSocket] 연결 성공:", frame);
        this.isConnected = true;
        if (onConnect) onConnect(frame);
      },
      onStompError: (frame) => {
        console.error("[WebSocket] STOMP 에러:", frame);
        this.isConnected = false;
        if (onError) onError(frame);
      },
      onWebSocketClose: (event) => {
        console.log("[WebSocket] 연결 종료:", event);
        this.isConnected = false;
        this.subscriptions.clear();
      },
      onDisconnect: () => {
        console.log("[WebSocket] 연결 해제");
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

  subscribe(destination, callback) {
    if (!this.isConnected || !this.client) {
      console.warn("[WebSocket] 연결되지 않았습니다.");
      return () => {};
    }

    // 이미 구독 중이면 해제 후 재구독
    if (this.subscriptions.has(destination)) {
      this.unsubscribe(destination);
    }

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log("[WebSocket] 메시지 수신:", destination, data);
        if (callback) callback(data);
      } catch (err) {
        console.error("[WebSocket] 메시지 파싱 실패:", err);
      }
    });

    this.subscriptions.set(destination, subscription);
    console.log("[WebSocket] 구독 시작:", destination);

    // 구독 해제 함수 반환
    return () => this.unsubscribe(destination);
  }

  // 구독 해제
  // destination: 구독 해제할 토픽
  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
      console.log("[WebSocket] 구독 해제:", destination);
    }
  }

  send(destination, body, headers = {}) {
    if (!this.isConnected || !this.client) {
      console.warn(
        "[WebSocket] 연결되지 않았습니다. 메시지 전송 실패:",
        destination
      );
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
      console.log("[WebSocket] 메시지 전송:", destination, body);
    } catch (err) {
      console.error("[WebSocket] 메시지 전송 실패:", err);
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
      console.log("[WebSocket] 연결 해제 완료");
    }
  }

  getIsConnected() {
    return this.isConnected;
  }
}

const websocketService = new WebSocketService();

export { WebSocketService };
export default websocketService;
