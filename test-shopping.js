/**
 * 쇼핑 리스트 앱 자동화 테스트
 * 실행: node test-shopping.js
 */
const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:8787/shopping-list.html';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function clearStorage(page) {
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 400,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  await page.goto(BASE_URL);

  console.log('\n📋 [테스트 1] 초기 상태 확인');
  await clearStorage(page);

  const emptyMsg = await page.locator('#emptyMsg').isVisible();
  assert(emptyMsg, '아이템이 없을 때 빈 상태 메시지가 표시된다');

  const listCount = await page.locator('#list li').count();
  assert(listCount === 0, '초기 리스트가 비어 있다 (0개)');

  console.log('\n📋 [테스트 2] 아이템 추가 - 버튼 클릭');

  await page.fill('#itemInput', '사과');
  await page.click('button:has-text("추가")');
  await page.waitForTimeout(200);

  const countAfterAdd1 = await page.locator('#list li').count();
  assert(countAfterAdd1 === 1, '아이템 1개 추가 후 리스트에 1개가 표시된다');

  const firstText = await page.locator('#list li .item-text').first().innerText();
  assert(firstText === '사과', '추가된 아이템 텍스트가 "사과"이다');

  const inputAfterAdd = await page.inputValue('#itemInput');
  assert(inputAfterAdd === '', '추가 후 입력창이 비워진다');

  const emptyMsgHidden = !(await page.locator('#emptyMsg').isVisible());
  assert(emptyMsgHidden, '아이템 추가 후 빈 상태 메시지가 사라진다');

  console.log('\n📋 [테스트 3] 아이템 추가 - Enter 키');

  await page.fill('#itemInput', '우유');
  await page.press('#itemInput', 'Enter');
  await page.waitForTimeout(200);

  await page.fill('#itemInput', '계란');
  await page.press('#itemInput', 'Enter');
  await page.waitForTimeout(200);

  const countAfterEnter = await page.locator('#list li').count();
  assert(countAfterEnter === 3, 'Enter 키로 추가 후 총 3개가 표시된다');

  console.log('\n📋 [테스트 4] 공백 입력 방어');

  await page.fill('#itemInput', '   ');
  await page.click('button:has-text("추가")');
  await page.waitForTimeout(200);

  const countAfterEmpty = await page.locator('#list li').count();
  assert(countAfterEmpty === 3, '공백만 입력하면 아이템이 추가되지 않는다');

  console.log('\n📋 [테스트 5] 체크(완료) 기능');

  const firstCheckbox = page.locator('#list li input[type="checkbox"]').first();
  await firstCheckbox.click();
  await page.waitForTimeout(200);

  const isChecked = await firstCheckbox.isChecked();
  assert(isChecked, '체크박스 클릭 후 checked 상태가 된다');

  const hasCheckedClass = await page.locator('#list li').first().evaluate(el => el.classList.contains('checked'));
  assert(hasCheckedClass, '체크된 아이템에 .checked 클래스가 추가된다');

  const isStrikethrough = await page.locator('#list li .item-text').first().evaluate(el => {
    return window.getComputedStyle(el).textDecoration.includes('line-through');
  });
  assert(isStrikethrough, '체크된 아이템 텍스트에 취소선이 적용된다');

  const statsText = await page.locator('#stats').innerText();
  assert(statsText.includes('완료 1개'), '통계에 완료 1개가 표시된다');

  console.log('\n📋 [테스트 6] 체크 해제');

  await firstCheckbox.click();
  await page.waitForTimeout(200);

  const isUnchecked = !(await firstCheckbox.isChecked());
  assert(isUnchecked, '다시 클릭하면 체크가 해제된다');

  const statsAfterUncheck = await page.locator('#stats').innerText();
  assert(statsAfterUncheck.includes('완료 0개'), '체크 해제 후 통계가 완료 0개로 돌아온다');

  console.log('\n📋 [테스트 7] 개별 아이템 삭제');

  const deleteBtn = page.locator('#list li .delete-btn').first();
  await deleteBtn.click();
  await page.waitForTimeout(200);

  const countAfterDelete = await page.locator('#list li').count();
  assert(countAfterDelete === 2, '삭제 후 아이템이 1개 줄어든다 (3 → 2)');

  const remainingTexts = await page.locator('#list li .item-text').allInnerTexts();
  assert(!remainingTexts.includes('사과'), '삭제된 "사과"가 목록에 없다');
  assert(remainingTexts.includes('우유') && remainingTexts.includes('계란'), '"우유"와 "계란"은 남아있다');

  console.log('\n📋 [테스트 8] 완료된 항목 일괄 삭제');

  const checkboxes = page.locator('#list li input[type="checkbox"]');
  await checkboxes.first().click();
  await page.waitForTimeout(200);

  const countBeforeClear = await page.locator('#list li').count();
  assert(countBeforeClear === 2, '일괄삭제 전 아이템이 2개이다');

  await page.click('button:has-text("완료된 항목 모두 삭제")');
  await page.waitForTimeout(200);

  const countAfterClear = await page.locator('#list li').count();
  assert(countAfterClear === 1, '완료 항목 삭제 후 미완료 아이템만 1개 남는다');

  const remainingAfterClear = await page.locator('#list li .item-text').first().innerText();
  assert(remainingAfterClear === '계란', '미완료 아이템 "계란"만 남는다');

  console.log('\n📋 [테스트 9] 새로고침 후 localStorage 유지');

  await page.reload();
  await page.waitForTimeout(300);

  const countAfterReload = await page.locator('#list li').count();
  assert(countAfterReload === 1, '새로고침 후에도 아이템이 유지된다');

  const textAfterReload = await page.locator('#list li .item-text').first().innerText();
  assert(textAfterReload === '계란', '새로고침 후 "계란"이 그대로 표시된다');

  console.log('\n📋 [테스트 10] 전체 삭제 후 빈 상태 복귀');

  await page.click('#list li .delete-btn');
  await page.waitForTimeout(200);

  const emptyMsgVisible = await page.locator('#emptyMsg').isVisible();
  assert(emptyMsgVisible, '모든 아이템 삭제 후 빈 상태 메시지가 다시 나타난다');

  const finalCount = await page.locator('#list li').count();
  assert(finalCount === 0, '최종 리스트가 비어 있다 (0개)');

  console.log('\n' + '═'.repeat(45));
  console.log(`  총 ${passed + failed}개 테스트  |  ✅ ${passed}개 통과  |  ❌ ${failed}개 실패`);
  console.log('═'.repeat(45));

  await page.waitForTimeout(1500);
  await browser.close();

  process.exit(failed > 0 ? 1 : 0);
})();