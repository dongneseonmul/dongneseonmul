-- 같이사요 환급률 업데이트
-- 일반 구매 기능 제거로 공동구매 환급률만 적용

-- 1. 로컬브루어리 - 수제맥주 2잔 + 안주 1개: 25% 환급
UPDATE gifts 
SET discount_rate = 25,
    discounted_price = CAST(original_price * 0.75 AS INTEGER)
WHERE id = 1;

-- 2. 카페봄날 - 아메리카노 + 디저트 세트: 30% 환급
UPDATE gifts 
SET discount_rate = 30,
    discounted_price = CAST(original_price * 0.70 AS INTEGER)
WHERE id = 2;

-- 3. 이탈리안키친 - 파스타 + 샐러드 세트: 25% 환급
UPDATE gifts 
SET discount_rate = 25,
    discounted_price = CAST(original_price * 0.75 AS INTEGER)
WHERE id = 3;

-- 4. 플라워카페 - 음료 1잔 + 꽃 한 송이: 30% 환급
UPDATE gifts 
SET discount_rate = 30,
    discounted_price = CAST(original_price * 0.70 AS INTEGER)
WHERE id = 4;

-- 확인 쿼리
SELECT id, store_name, product_name, discount_rate, original_price, discounted_price
FROM gifts
ORDER BY id;
