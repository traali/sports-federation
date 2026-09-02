async function inspectBasketData() {
  const base = 'https://koripallo-api.torneopal.net/taso/rest'
  const headers = {
    'Accept': 'json/df8e84j9xtdz269euy3h',
    'Referer': 'https://tulospalvelu.basket.fi/',
    'User-Agent': 'Mozilla/5.0'
  }

  // 1. Inspect Match 1011397 Preview
  console.log('=== MATCH 1011397 ===')
  const mRes = await fetch(`${base}/getMatch?match_id=1011397`, { headers })
  const mData = await mRes.json()
  console.log('Match Status:', mData.call?.status)
  console.log('Match Teams:', mData.match?.team_A_name, 'vs', mData.match?.team_B_name)
  console.log('Match Category:', mData.match?.category_name, 'Competition:', mData.match?.competition_name)
  console.log('Match Keys:', Object.keys(mData.match || {}))

  // 2. Inspect Group 303102
  console.log('\n=== GROUP 303102 ===')
  const gRes = await fetch(`${base}/getGroup?group_id=303102`, { headers })
  const gData = await gRes.json()
  console.log('Group Status:', gData.call?.status)
  console.log('Group Name:', gData.group?.group_name)
  console.log('Group Teams Count:', gData.group?.teams?.length)
  console.log('Group Matches Count:', gData.group?.matches?.length)

  // 3. Find any played matches in basketball to see quarter scores & player stats
  const matches = gData.group?.matches || []
  const played = matches.filter(m => m.status === 'played' || (m.fs_A && m.fs_A !== ''))
  console.log('Played matches in this group:', played.length)

  if (played.length > 0) {
    const samplePlayed = played[0]
    console.log('\n=== SAMPLE PLAYED MATCH ID:', samplePlayed.match_id, '===')
    const pRes = await fetch(`${base}/getMatch?match_id=${samplePlayed.match_id}`, { headers })
    const pData = await pRes.json()
    console.log('Full Played Match Keys:', Object.keys(pData.match || {}))
    console.log('Score:', pData.match?.fs_A, '–', pData.match?.fs_B)
    console.log('Quarter Scores:', {
      q1: `${pData.match?.p1s_A}–${pData.match?.p1s_B}`,
      q2: `${pData.match?.p2s_A}–${pData.match?.p2s_B}`,
      q3: `${pData.match?.p3s_A}–${pData.match?.p3s_B}`,
      q4: `${pData.match?.p4s_A}–${pData.match?.p4s_B}`
    })
    console.log('Events Count:', pData.match?.events?.length)
    if (pData.match?.events?.length) {
      console.log('Sample Event:', pData.match.events.slice(0, 3))
    }
  } else {
    // If no played match in this group, let's query recent matches in competition
    console.log('\nSearching for recent played basketball matches in competition...')
    const compId = mData.match?.competition_id || 'etekp2627'
    const catRes = await fetch(`${base}/getMatches?competition_id=${compId}&status=played`, { headers })
    const catData = await catRes.json()
    console.log('Played matches in comp:', catData.matches?.length)
    if (catData.matches?.length) {
      console.log('Sample match:', catData.matches[0])
    }
  }
}

inspectBasketData().catch(e => console.error(e))
