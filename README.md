# 쇼핑 리스트 앱

HTML/CSS/JavaScript로 만든 로컬스토리지 기반 쇼핑 리스트 웹 앱입니다.

## 기능

- 아이템 추가 (버튼 클릭 또는 Enter 키)
- 체크박스로 완료 표시 / 취소선 적용
- 개별 아이템 삭제
- 완료된 항목 일괄 삭제
- localStorage로 새로고침 후에도 데이터 유지
- 총 개수 / 완료 개수 통계 표시

## 실행 방법

`shopping-list.html` 파일을 브라우저에서 열면 바로 사용할 수 있습니다.

## 테스트

Playwright를 사용한 자동화 테스트가 포함되어 있습니다.

```bash
npm install
node test-shopping.js
```
