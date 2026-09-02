async function findBasketKey() {
  const htmlRes = await fetch('https://tulospalvelu.basket.fi/match/1011397/preview', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  const html = await htmlRes.text()
  console.log('HTML length:', html.length)

  const jsMatches = Array.from(html.matchAll(/src="([^"]+\.js)"/g)).map(m => m[1])
  console.log('Found JS scripts:', jsMatches)

  for (const jsPath of jsMatches) {
    const fullUrl = jsPath.startsWith('http') ? jsPath : 'https://tulospalvelu.basket.fi' + (jsPath.startsWith('/') ? '' : '/') + jsPath
    console.log('Fetching JS:', fullUrl)
    const jsRes = await fetch(fullUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const jsText = await jsRes.text()

    const keyMatches = jsText.match(/json\/([a-zA-Z0-9_-]{16,64})/g)
    if (keyMatches) {
      console.log('Found key matches in', jsPath, ':', keyMatches)
    }

    const apiKeyMatch = jsText.match(/apiKey["']?\s*:\s*["']([a-zA-Z0-9_-]+)["']/)
    if (apiKeyMatch) {
      console.log('apiKey:', apiKeyMatch[1])
    }

    const bearerMatch = jsText.match(/Bearer\s+([a-zA-Z0-9_.-]+)/)
    if (bearerMatch) {
      console.log('Bearer:', bearerMatch[1])
    }

    const restMatch = jsText.match(/https?:\/\/[a-zA-Z0-9.-]*torneopal\.net\/[^\s"']+/g)
    if (restMatch) {
      console.log('Torneopal URLs found:', Array.from(new Set(restMatch)))
    }
  }
}

findBasketKey().catch(e => console.error(e))
