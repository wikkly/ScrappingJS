const puppeteer = require('puppeteer');
const ejs = require('ejs');
const fs = require('fs');

async function scrapeAmazonMonitor() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.amazon.com/s?k=monitor');

  const products = await page.evaluate(() => {
    const productList = [];
    const productElements = document.querySelectorAll('.s-result-item');

    productElements.forEach((productElement) => {
      const nameElement = productElement.querySelector('span.a-text-normal');
      const priceElement = productElement.querySelector('span.a-price-whole');
      const priceElementNext = productElement.querySelector('span.a-price-fraction');
      const linkElement = productElement.querySelector('a.a-link-normal');
      const imageElement = productElement.querySelector('img.s-image');

      if (nameElement && priceElement && linkElement && imageElement) {
        const name = nameElement.textContent.trim();
        const pricedecimal = priceElement.textContent.trim();
        const pricenext = priceElementNext.textContent.trim();
        const link = linkElement.href;
        const image = imageElement.src;

        productList.push({ name, pricedecimal, pricenext, link, image });
      }
    });

    return productList;
  });

  const template = fs.readFileSync('template.ejs', 'utf8');
  const html = ejs.render(template, { products });

  fs.writeFileSync('output.html', html, 'utf8');

  console.log(products);

  await browser.close();
}

scrapeAmazonMonitor();
