# 동네선물 (Neighborhood Gifts)

## 프로젝트 개요

**동네선물**은 동네의 엄선된 소상공인 장소들을 방문하고 환급 받을 수 있는 혁신적인 플랫폼입니다. 
Hono + Cloudflare Pages + D1 데이터베이스로 구축된 풀스택 웹 애플리케이션입니다.

### 핵심 특징

- 🏪 **소상공인 지원**: 동네 엄선된 소상공인 가게 할인 방문권
- 💰 **10%~20% 환급**: 개별 구매 및 공동구매 환급 혜택
- 👥 **공동구매**: 2명이 모이면 더 높은 할인율 적용
- 🤝 **같이가요**: 방문권 소유자들이 함께 갈 사람을 찾는 커뮤니티
- 🎫 **자유로운 선물**: 구매한 방문권을 친구에게 선물 가능
- 💬 **후기 시스템**: 방문 후 후기 작성 및 영수증 제출로 환급

## 🔗 공개 URL

- **개발 서버**: https://3000-ijb6lnvhjqs8sh7x574pv-3844e1b6.sandbox.novita.ai
- **API 엔드포인트**: https://3000-ijb6lnvhjqs8sh7x574pv-3844e1b6.sandbox.novita.ai/api

## 🛠 기술 스택

### Backend
- **Hono** - 경량 고성능 웹 프레임워크
- **TypeScript** - 타입 안전성
- **Cloudflare Workers** - 엣지 컴퓨팅
- **Cloudflare D1** - SQLite 기반 분산 데이터베이스

### Frontend
- **HTML5** / **CSS3** - 시맨틱 마크업 및 모던 스타일링
- **Vanilla JavaScript** - 프레임워크 없는 순수 JS
- **Font Awesome** - 아이콘 라이브러리

### Deployment
- **Cloudflare Pages** - 글로벌 CDN 배포
- **PM2** - 프로세스 관리 (개발 환경)

## 📊 데이터 모델

### 주요 테이블

- **users** - 사용자 정보 (전화번호, 닉네임)
- **gifts** - 동네선물 상품 정보
- **gift_images** - 상품 이미지
- **comments** - 사용자 후기
- **group_buys** - 공동구매 정보
- **together_posts** - 같이가요 게시글
- **together_applications** - 같이가요 신청
- **purchases** - 구매 내역
- **gift_likes** / **together_likes** - 좋아요 관계

## 🌐 API 엔드포인트

### 인증 (Authentication)
- `POST /api/auth/check` - 전화번호 확인
- `POST /api/auth/login` - 로그인/회원가입
- `POST /api/auth/request-verification` - SMS 인증 요청
- `POST /api/auth/verify-code` - 인증 코드 확인

### 동네선물 (Gifts)
- `GET /api/gifts` - 전체 선물 목록
- `GET /api/gifts/:id` - 선물 상세 정보
- `POST /api/gifts/:id/like` - 좋아요 토글
- `GET /api/gifts/likes/:userId` - 사용자 좋아요 목록

### 후기 (Comments)
- `POST /api/comments` - 후기 작성
- `POST /api/comments/:id/like` - 후기 공감

### 공동구매 (Group Buys)
- `POST /api/group-buys` - 공동구매 생성
- `POST /api/group-buys/:id/join` - 공동구매 참여

### 같이가요 (Together Posts)
- `GET /api/together-posts` - 전체 게시글
- `GET /api/together-posts/:id` - 게시글 상세
- `POST /api/together-posts` - 게시글 작성
- `POST /api/together-posts/:id/apply` - 참여 신청
- `PATCH /api/together-applications/:id` - 신청 승인/거절
- `POST /api/together-posts/:id/like` - 좋아요 토글

### 구매 (Purchases)
- `POST /api/purchases` - 구매 생성
- `GET /api/purchases/:userId` - 구매 내역
- `PATCH /api/purchases/:id/review` - 후기 작성 완료
- `PATCH /api/purchases/:id/receipt` - 영수증 제출

## 🚀 로컬 개발 환경 설정

### 1. 프로젝트 클론 및 의존성 설치

```bash
cd /home/user/webapp
npm install
```

### 2. 로컬 D1 데이터베이스 초기화

```bash
# 마이그레이션 실행
npm run db:migrate:local

# 샘플 데이터 삽입
npm run db:seed
```

### 3. 프로젝트 빌드

```bash
npm run build
```

### 4. 개발 서버 실행

```bash
# PM2로 실행 (권장)
pm2 start ecosystem.config.cjs

# 또는 직접 실행
npm run dev:sandbox
```

### 5. 서버 확인

```bash
# API 테스트
curl http://localhost:3000/api/gifts

# 웹 브라우저에서
open http://localhost:3000
```

## 📦 프로젝트 구조

```
webapp/
├── src/
│   ├── index.tsx         # 메인 Hono 애플리케이션
│   ├── types.ts          # TypeScript 타입 정의
│   └── renderer.tsx      # SSR 렌더러
├── public/
│   ├── index.html        # 메인 HTML
│   └── static/
│       ├── css/
│       │   └── style.css # 스타일시트
│       └── js/
│           ├── data.js   # 클라이언트 데이터
│           └── main.js   # 클라이언트 로직
├── migrations/
│   └── 0001_initial_schema.sql  # DB 스키마
├── seed.sql              # 샘플 데이터
├── ecosystem.config.cjs  # PM2 설정
├── wrangler.jsonc        # Cloudflare 설정
├── package.json
└── README.md
```

## 🎯 주요 기능 (완료)

### 1. 인증 시스템 ✅
- 전화번호 기반 SMS 인증
- 닉네임 관리
- 로그인/로그아웃

### 2. 동네선물 메인화면 ✅
- 동네 엄선된 장소의 할인 방문권 목록
- 이미지 슬라이더 (1:1 비율)
- 환급률 표시
- 좋아요, 공유하기 기능

### 3. 동네선물 상세화면 ✅
- 상세 이미지 슬라이더
- 상품명, 가격, 환급률 정보
- 상세 소개 및 가게 정보
- 추천 후기 섹션
- 공동구매 섹션
- 같이가요 섹션

### 4. 공동구매 시스템 ✅
- 공동구매 신청 및 참여
- 24시간 내 2명 모집 시 자동 성사
- 실시간 카운트다운 타이머

### 5. 구매 및 결제 ✅
- 수량 선택
- 0원 결제 (보증금 개념)
- 방문권 코드 자동 생성
- 유효기간 3개월

### 6. 같이가요 시스템 ✅
- 게시글 작성 및 조회
- 참여 신청 및 승인/거절
- 작성자 정보 공개

### 7. 마이페이지 ✅
- 구매 내역
- 내가 쓴 같이가요
- 신청한 같이가요
- 내 좋아요 (동네선물/같이가요)

### 8. 후기 작성 및 환급 ✅
- 후기 작성 모달
- 영수증 제출 버튼
- 환급 프로세스 안내

## 📱 반응형 디자인

- **모바일 최적화** (480px 이하)
- **데스크톱 지원** (480px 초과)
- **터치 친화적 UI**

## 🔐 환경 변수

로컬 개발 환경에서는 D1 데이터베이스가 자동으로 `.wrangler/state/v3/d1`에 생성됩니다.

프로덕션 배포 시 필요한 설정:
- Cloudflare D1 데이터베이스 ID (`wrangler.jsonc`에 설정)

## 🚀 배포 가이드

### Cloudflare Pages 배포

1. **Cloudflare D1 데이터베이스 생성**

```bash
npx wrangler d1 create webapp-production
# 출력된 database_id를 wrangler.jsonc에 입력
```

2. **프로덕션 마이그레이션**

```bash
npm run db:migrate:prod
```

3. **Cloudflare Pages 프로젝트 생성**

```bash
npx wrangler pages project create webapp --production-branch main
```

4. **배포**

```bash
npm run deploy:prod
```

## 📝 NPM Scripts

```json
{
  "dev": "vite",                                    // Vite 개발 서버
  "dev:sandbox": "wrangler pages dev dist ...",    // Wrangler 개발 서버
  "build": "vite build",                            // 프로덕션 빌드
  "deploy:prod": "npm run build && wrangler pages deploy dist --project-name webapp",
  "db:migrate:local": "wrangler d1 migrations apply webapp-production --local",
  "db:migrate:prod": "wrangler d1 migrations apply webapp-production",
  "db:seed": "wrangler d1 execute webapp-production --local --file=./seed.sql",
  "db:reset": "rm -rf .wrangler/state/v3/d1 && npm run db:migrate:local && npm run db:seed",
  "clean-port": "fuser -k 3000/tcp 2>/dev/null || true",
  "test": "curl http://localhost:3000"
}
```

## 🐛 알려진 이슈

- 프론트엔드가 현재 메모리 기반 데이터를 사용하고 있어 API 연동이 필요함
- 실제 SMS 인증 구현 필요
- 실제 결제 시스템 연동 필요
- 채팅 기능 미구현

## 🔮 향후 계획

### Phase 1: API 완전 연동
- [ ] 프론트엔드 JavaScript를 API 호출로 전환
- [ ] 로그인 세션 관리 구현
- [ ] 실시간 데이터 업데이트

### Phase 2: 기능 확장
- [ ] 실제 SMS 인증 연동
- [ ] 실제 결제 시스템 연동
- [ ] 채팅 기능 구현
- [ ] 푸시 알림

### Phase 3: 최적화
- [ ] 이미지 최적화 및 CDN
- [ ] 성능 모니터링
- [ ] SEO 최적화

## 📄 라이선스

이 프로젝트는 교육 및 시연 목적으로 제작되었습니다.

## 👨‍💻 개발자

- **프로젝트 이름**: 동네선물 (Neighborhood Gifts)
- **버전**: 1.0.0
- **마지막 업데이트**: 2025-12-20

---

**동네선물**과 함께 동네 엄선된 장소를 방문하고 환급 받으세요! 🎁✨
