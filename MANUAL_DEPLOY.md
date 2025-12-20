# 🚀 Cloudflare Pages 수동 배포 가이드

API 토큰 권한 문제로 인해 Dashboard에서 수동으로 배포합니다.

## ✅ Step 1: D1 데이터베이스 마이그레이션 (수동)

### 1-1. Cloudflare Dashboard 접속
1. https://dash.cloudflare.com 접속
2. **Workers & Pages** → **D1** 클릭
3. **webapp-production** 데이터베이스 클릭
4. **Console** 탭 선택

### 1-2. 스키마 생성 SQL 실행

아래 SQL을 **한 번에 복사**해서 Console에 붙여넣고 **Execute** 클릭:

```sql
-- 전체 마이그레이션 SQL은 migrations/0001_initial_schema.sql 참조
-- 또는 아래 파일을 복사해서 실행:
```

**파일 위치**: `/home/user/webapp/migrations/0001_initial_schema.sql`

### 1-3. 샘플 데이터 삽입 (선택사항)

아래 SQL을 Console에 붙여넣고 Execute:

```sql
-- 샘플 데이터는 seed.sql 참조
```

**파일 위치**: `/home/user/webapp/seed.sql`

---

## ✅ Step 2: Cloudflare Pages 프로젝트 생성

### 2-1. Pages 프로젝트 생성
1. **Workers & Pages** → **Overview** 클릭
2. **Create application** → **Pages** 탭
3. **Upload assets** 선택
4. Project name: `webapp` 입력
5. Production branch: `main`

### 2-2. 빌드 파일 업로드

#### 옵션 A: dist 폴더 직접 업로드
1. 로컬에서 프로젝트 빌드:
   ```bash
   cd /home/user/webapp
   npm run build
   ```
2. `dist` 폴더를 zip으로 압축
3. Cloudflare Pages에 업로드

#### 옵션 B: GitHub 연동 (권장)
1. GitHub 저장소 생성
2. 코드 푸시
3. Cloudflare Pages에서 GitHub 저장소 연결
4. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`

---

## ✅ Step 3: D1 바인딩 설정

### 3-1. Settings → Functions
1. Pages 프로젝트 페이지에서 **Settings** 클릭
2. **Functions** 메뉴 클릭
3. **D1 database bindings** 섹션
4. **Add binding** 클릭:
   - Variable name: `DB`
   - D1 database: `webapp-production`
5. **Save** 클릭

### 3-2. 배포 재시작
- **Deployments** 탭에서 **Retry deployment** 클릭

---

## ✅ Step 4: 배포 확인

### 4-1. URL 확인
- **Deployments** 탭에서 Production URL 확인
- 예: `https://webapp.pages.dev`

### 4-2. API 테스트
```bash
curl https://webapp.pages.dev/api/gifts
```

### 4-3. 메인 페이지 테스트
브라우저에서 `https://webapp.pages.dev` 접속

---

## 📦 빌드 파일 다운로드

현재 빌드된 파일을 다운로드할 수 있습니다:

```bash
cd /home/user/webapp
tar -czf dist.tar.gz dist/
# 파일 위치: /home/user/webapp/dist.tar.gz
```

---

## 🔄 업데이트 배포

코드 수정 후:

1. **GitHub 연동 시**:
   ```bash
   git add .
   git commit -m "update"
   git push origin main
   ```
   → 자동 재배포

2. **수동 업로드 시**:
   - 빌드 후 dist 폴더 재업로드

---

## 💡 현재 작동 중인 개발 서버

배포하지 않아도 현재 개발 서버가 완벽하게 작동합니다:

**개발 서버 URL**: https://3000-ijb6lnvhjqs8sh7x574pv-3844e1b6.sandbox.novita.ai

- ✅ 모든 API 작동
- ✅ 데이터베이스 연결
- ✅ 실시간 테스트 가능

---

## 📋 체크리스트

배포 완료 후 확인:

- [ ] D1 데이터베이스 마이그레이션 완료
- [ ] 샘플 데이터 삽입 완료
- [ ] Pages 프로젝트 생성 완료
- [ ] D1 바인딩 설정 완료
- [ ] 메인 페이지 로드 확인
- [ ] API 엔드포인트 응답 확인
- [ ] 데이터베이스 연결 확인

---

문제가 발생하면 현재 개발 서버를 계속 사용하시면 됩니다!
