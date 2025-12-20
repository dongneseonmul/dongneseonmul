# Cloudflare 배포 가이드 (샌드박스 환경)

## Step 1: Cloudflare API 토큰 생성

1. https://dash.cloudflare.com 접속 및 로그인
2. 우측 상단 프로필 → "My Profile" → "API Tokens"
3. "Create Token" 클릭
4. "Edit Cloudflare Workers" 템플릿 선택
5. 권한 확인 후 토큰 생성
6. 생성된 토큰 복사 (다시 볼 수 없으니 안전하게 보관!)

## Step 2: 샌드박스에서 토큰 설정

### 옵션 A: 직접 로그인 (가장 쉬움)
```bash
cd /home/user/webapp
npx wrangler login
# 출력된 URL을 브라우저에서 열고 로그인
```

### 옵션 B: 환경변수로 설정
```bash
# .env 파일에 토큰 저장 (임시)
echo "CLOUDFLARE_API_TOKEN=your-token-here" > .env

# 또는 직접 export
export CLOUDFLARE_API_TOKEN="your-token-here"

# 확인
npx wrangler whoami
```

## Step 3: D1 데이터베이스 생성
```bash
npx wrangler d1 create webapp-production
# database_id를 복사하세요!
```

## Step 4: wrangler.jsonc 수정
```bash
# 복사한 database_id를 넣으세요
nano wrangler.jsonc
```

## Step 5: 마이그레이션
```bash
npm run db:migrate:prod
```

## Step 6: 배포
```bash
npm run deploy:prod
```

---

## 💡 토큰 없이 로컬 테스트만 하기

배포 없이 로컬에서만 테스트하려면:

```bash
# 로컬 개발 서버 (현재 실행 중)
pm2 list

# 공개 URL 사용
https://3000-ijb6lnvhjqs8sh7x574pv-3844e1b6.sandbox.novita.ai
```

현재 개발 서버가 이미 완벽하게 작동하고 있으므로, 
Cloudflare 배포는 선택사항입니다!
