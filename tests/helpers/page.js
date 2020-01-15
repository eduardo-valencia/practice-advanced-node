const puppeteer = require('puppeteer')
const getUser = require('../factories/userFactory')
const getSession = require('../factories/sessionFactory')

let browser, page

class CustomPage {
  // Build is now accessible without making a class instance.
  static async build() {
    browser = await puppeteer.launch({ args: ['--no-sandbox'] })
    page = await browser.newPage()
    const customPage = new CustomPage(page)
    return new Proxy(customPage, {
      get: function(target, property) {
        return target[property] || browser[property] || page[property]
      }
    })
  }

  constructor(page) {
    this.page = page
  }

  async login() {
    const user = await getUser()
    const { sessionString, signature } = getSession(user)
    await this.page.setCookie({ name: 'session', value: sessionString })
    await this.page.setCookie({ name: 'session.sig', value: signature })
    await this.page.goto('http://localhost:3000/blogs')
    const selector = 'a[href="/auth/logout"]'
    await this.page.waitForSelector(selector)
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML)
  }

  get(path) {
    return this.page.evaluate(
      _path =>
        fetch(_path, {
          method: 'GET',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(res => res.json()),
      path
    )
  }

  post(path, data) {
    return this.page.evaluate(
      (_path, _data) =>
        fetch(_path, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(_data)
        }).then(res => res.json()),
      path,
      data
    )
  }

  execRequests(actions) {
    return Promise.all(
      actions.map(({ method, path, data }) => this[method](path, data))
    )
  }
}

module.exports = CustomPage
