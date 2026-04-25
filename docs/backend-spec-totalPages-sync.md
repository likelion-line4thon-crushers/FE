# Backend Spec — Room `totalPages` 동기화

**우선순위**: High
**담당**: 백엔드
**관련 이슈**: Codex 어드버설 리뷰 Finding 1 (working tree review)

## 1. 문제 상황

현재 청크 업로드 플로우에서 프론트엔드는 `POST /api/rooms` 를 호출할 때 실제 PDF 페이지 수를 아직 모르는 상태다. 이유는 청크 업로드가 완료되기 전에는 PDFBox 파싱이 안 돼서 총 페이지 수를 알 수 없기 때문.

### 현재 프론트 동작

```ts
// src/pages/session-create/ui/SessionCreatePage.tsx
const room = await createRoom(1);                                   // placeholder
const ready = await uploadPdf(pdfFile, room.roomId, room.deckId);   // ready.totalPages = 실제값
setTotalPages(ready.totalPages);                                    // 프론트 상태만 갱신
```

`POST /api/rooms` 스펙이 `totalPages >= 1` 을 요구해서 1 을 placeholder 로 넘기고, 이후 `POST /api/upload/chunk` 의 201 응답에 실린 실제 `totalPages` 는 **프론트의 React state 와 sessionStorage 에만** 반영된다.

### 왜 문제인가

1. 청중/다른 클라이언트가 `GET /api/rooms/join/{code}` 또는 `POST /api/roomAudience/rooms/{roomId}/info` 같은 백엔드 엔드포인트로 방 정보를 가져오면 `totalPages = 1` 이 내려올 가능성이 있다. 실제 덱이 46장인데 1로 보이면:
   - 청중 사이드에서 슬라이드 로더가 1장만 요청
   - 언락 경계(`maxRevealedPage`) 계산이 어긋남
   - 프리젠터가 2페이지 이상 진행할 때 청중 화면이 깨짐
2. 발표자가 새로고침해 `GET /api/rooms/{roomId}` 류 엔드포인트로 복원하는 경우에도 동일한 위험.

## 2. 요청사항 (택일)

### Option A (권장) — 청크 조립 완료 시점에 BE 가 자동 업데이트

`POST /api/upload/chunk` 의 201 응답(READY 상태)을 돌려줄 때, 백엔드가 내부적으로 **해당 `roomId` 의 `totalPages` 를 PDFBox 파싱 결과로 덮어쓴다**.

- 프론트는 추가 호출 없이 기존 플로우 그대로.
- `POST /api/rooms` 의 `totalPages` 는 더 이상 의미 없는 placeholder 가 됨. (호환성 유지 위해 필드는 남겨두되, 무시하거나 optional 로 전환해도 됨.)
- 관련 컨트롤러: `ChunkUploadController` / `PdfChunkService` (청크 조립 직후)
- 영향 받는 응답: `JoinRoomResponse`, `RoomInfo` 등의 `totalPages` 가 정확해짐.

**테스트 시나리오**: 46페이지 PDF 업로드 → `GET /api/rooms/join/{code}` 응답에 `totalPages: 46` 확인.

### Option B — 별도 finalize 엔드포인트

새 엔드포인트 추가:

```
POST /api/rooms/{roomId}/total-pages
Content-Type: application/json

{ "totalPages": 46 }
```

응답: `BaseResponse<{ roomId, totalPages }>`

- 프론트는 `uploadPdf` 가 201 ready 를 받으면 즉시 이 엔드포인트를 호출한다.
- 장점: 청크 업로드 로직과 방 업데이트 로직 분리
- 단점: 추가 요청 1회, 네트워크 실패 시 방 상태가 일관되지 않을 수 있음

Option A 가 단순하고 원자적이어서 권장.

## 3. 추가 확인 사항

- `Room` 엔티티 스키마에서 `totalPages` 가 mutable 인지 (JPA @Column 제약) 확인
- Redis 캐시 / 읽기 모델이 있다면 invalidate 경로 점검
- 이 업데이트가 `canStartSession` 판정에 영향 주는지 — 지금은 `pageIndex == min(10, totalPages) - 1` 기준이라 영향 있음. BE 가 자체적으로 totalPages 를 바꾸므로 기존 로직과 정합성 OK.

## 4. 프론트 대응

Option A 선택 시: 프론트 코드 변경 없음.
Option B 선택 시: `SessionCreatePage` 의 `uploadPdf` 이후에 `await updateRoomTotalPages(room.roomId, ready.totalPages)` 추가.

어떤 Option 이든 프론트는 기존 로직 (`sessionStorage.boini_room.totalPages = ready.totalPages`) 을 계속 유지한다. 다만 그 값이 BE 와 정합하게 되는 것이 이 스펙의 목표.
