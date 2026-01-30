const { chromium } = require('playwright');

const harborPropertyId = 'a1918825-dabd-4717-9007-9b40885d1270';
const skylinePropertyId = '0b358ba7-34df-4f8b-bd3a-bce698693b4d';

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

async function waitForPage(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
}

async function main() {
  const from = formatDate(new Date());
  const to = formatDate(addDays(new Date(), 3));

  const roomTypes = await fetchJson(
    `http://localhost:8080/api/v1/public/room-types?propertyId=${harborPropertyId}`
  );
  const bookingRoom = roomTypes.find((room) => room.code === 'H-DLX') || roomTypes[0];
  if (!bookingRoom) {
    throw new Error('No room types found for harbor property.');
  }

  const searchUrl = `http://localhost:3001/search?propertyId=${harborPropertyId}&from=${from}&to=${to}&adults=2&children=0`;
  const bookUrl = `http://localhost:3001/book?propertyId=${harborPropertyId}&roomTypeId=${bookingRoom.id}&from=${from}&to=${to}&adults=2&children=0`;
  const galleryUrl = `http://localhost:3001/gallery?propertyId=${harborPropertyId}`;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded' });
  await waitForPage(page);
  await page.screenshot({ path: 'artifacts/screenshots/storefront-home.png', fullPage: true });

  await page.goto('http://localhost:3001/auth/sign-in', { waitUntil: 'domcontentloaded' });
  await waitForPage(page);
  await page.screenshot({ path: 'artifacts/screenshots/storefront-signin.png', fullPage: true });

  await page.fill('input[type="email"]', 'guest.customer@example.com');
  await page.fill('input[type="password"]', 'Welcome123!');
  await page.click('button[type="submit"]');
  await waitForPage(page);

  await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
  await waitForPage(page);
  await page.screenshot({ path: 'artifacts/screenshots/storefront-search.png', fullPage: true });

  await page.goto(bookUrl, { waitUntil: 'domcontentloaded' });
  await waitForPage(page);
  await page.screenshot({ path: 'artifacts/screenshots/storefront-booking.png', fullPage: true });

  await page.goto(galleryUrl, { waitUntil: 'domcontentloaded' });
  await waitForPage(page);
  await page.screenshot({ path: 'artifacts/screenshots/storefront-gallery.png', fullPage: true });

  const adminPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await adminPage.goto('http://localhost:3000/login?next=/admin', { waitUntil: 'domcontentloaded' });
  await waitForPage(adminPage);
  await adminPage.screenshot({ path: 'artifacts/screenshots/admin-login.png', fullPage: true });

  await adminPage.fill('input[name="email"]', 'systemadmin@hotel.com');
  await adminPage.fill('input[name="password"]', 'Password@123');
  await adminPage.click('button[type="submit"]');
  await waitForPage(adminPage);

  await adminPage.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded' });
  await waitForPage(adminPage);
  await adminPage.screenshot({ path: 'artifacts/screenshots/admin-dashboard.png', fullPage: true });

  await adminPage.goto('http://localhost:3000/admin/rooms/types', { waitUntil: 'domcontentloaded' });
  await waitForPage(adminPage);
  await adminPage.screenshot({ path: 'artifacts/screenshots/admin-room-types.png', fullPage: true });

  await adminPage.goto('http://localhost:3000/admin/pricing/rate-plans', { waitUntil: 'domcontentloaded' });
  await waitForPage(adminPage);
  await adminPage.screenshot({ path: 'artifacts/screenshots/admin-rate-plans.png', fullPage: true });

  await adminPage.goto('http://localhost:3000/admin/reservations', { waitUntil: 'domcontentloaded' });
  await waitForPage(adminPage);
  await adminPage.screenshot({ path: 'artifacts/screenshots/admin-reservations.png', fullPage: true });

  await browser.close();

  console.log('Screenshots saved to artifacts/screenshots');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
