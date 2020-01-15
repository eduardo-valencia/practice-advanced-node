const Page = require('./helpers/page')
jest.setTimeout(30000)

let page

beforeEach(async () => {
  page = await Page.build()
  await page.goto('http://localhost:3000')
})

afterEach(async () => {
  await page.close()
})

test('The header has the correct text.', async () => {
  const text = await page.$eval('a.brand-logo', el => el.innerHTML)
  expect(text).toBe('Blogster')
})

test('clicking login starts oauth flow', async () => {
  await page.click('.right a')
  const url = await page.url()
  expect(url).toMatch(/accounts\.google\.com/)
})

test('When signed in, show the logout button.', async () => {
  await page.login()
  const selector = 'a[href="/auth/logout"]'
  const text = await page.getContentsOf(selector)
  expect(text).toEqual('Logout')
})
