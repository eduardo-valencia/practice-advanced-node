const Page = require('./helpers/page')

let page

beforeEach(async () => {
  page = await Page.build()
  await page.goto('http://localhost:3000')
})

afterEach(async () => {
  await page.close()
})

describe('When logged in', async () => {
  beforeEach(async () => {
    await page.login()
    await page.click('a.btn-floating')
  })

  test('The blog forms renders', async () => {
    const label = await page.getContentsOf('form label')
    expect(label).toEqual('Blog Title')
  })

  describe('And using invalid inputs', async () => {
    beforeEach(async () => {
      await page.click('form button')
    })

    test('The form shows an error message.', async () => {
      const titleError = await page.getContentsOf('.title .red-text')
      const contentError = await page.getContentsOf('.content .red-text')

      const error = 'You must provide a value'
      expect(titleError).toEqual(error)
      expect(contentError).toEqual(error)
    })
  })

  describe('And using valid inputs.', () => {
    const content = 'Hello world.'
    beforeEach(async () => {
      await page.type('.title input', content)
      await page.type('.content input', content)
      await page.click('form button')
    })

    test('Submitting takes the user to the review screen.', async () => {
      const text = await page.getContentsOf('h5')
      expect(text).toEqual('Please confirm your entries')
    })

    test('Submitting then adds the blog to the index page.', async () => {
      await page.click('button.green')
      await page.waitFor('.card')

      const title = await page.getContentsOf('.card-title')
      const content = await page.getContentsOf('p')

      expect(title).toEqual(content)
      expect(content).toEqual(content)
    })
  })
})

const error = 'You must log in!'

describe('And is not logged in', async () => {
  const actions = [
    {
      method: 'get',
      path: '/api/blogs'
    },
    {
      method: 'post',
      path: '/api/blogs',
      data: {
        title: 'foo',
        content: 'bar'
      }
    }
  ]

  test('Blog related actions are prohibited', async () => {
    const results = await page.execRequests(actions)
    for (let result of results) {
      expect(result).toEqual({ error })
    }
  })
})
