# RC142 gameplay and art audit

The runtime candidate audited here is `ec943d56408ea5bfa217fd55e0aa000de6131420`. This follow-up audit adds tests and evidence only; it does not change game runtime code.

## Art and StoryWorld handoff

`gameplay-art-map.json` records the four cult leader forms, the hidden Persona identity, all nine normal/awakened skill paths, and movement bounds. It also pins the SHA-256 of the cult form runtime, Persona runtime, skill mapping and movement policy. Use its `runtimeSourceSha256` object for StoryWorld synchronization. The mapping file SHA-256 is `f6599d7e526e0f7efbfed38c85a74f4e8381145074ddd538560f2b0018b2ee77`.

## Persona attack coverage

`persona-volley-audit.json` covers all nine attack patterns in both normal and awakened states. The staged browser fixture uses the native projectile motion, contact geometry and player-damage transaction path. Every pattern showed the warning text, a disabled collision interval followed by release, native transaction evidence for each measured contact, and a terminal reason for every shot. The test compared eight fixed sidestep directions; every attack/mode pair had a route with fewer measured contacts than standing still. Some evasion routes still take hits.

`persona-render-audit.json` summarizes 1,632 checks each on PC, portrait and landscape. These verify image identity in warning, flight and terminal effect states for all nine patterns, along with the timed native attack rotation. This is staged encounter evidence, not a claim that a natural campaign run defeated the hidden finale.

## Browser performance comparison

`performance-comparison.json` contains two CPU×4 runs for each runtime and one CPU×1 run per runtime. The same Chromium build and scene were used. The candidate and baseline PC/portrait CPU×1 active p95 were about 83 ms. Landscape was 67 ms for candidate and 50 ms for baseline in the single run. CPU×4 measurements were noisy: candidate portrait p95 was 450/583 ms versus baseline 467/433 ms; candidate landscape was 400/400 ms versus baseline 350/417 ms. Candidate results varied in both directions, so this does not establish a stable regression. Both revisions have substantial emulated mobile frame delays; this is not a mobile performance pass, and no attack count was reduced for the comparison. Physical devices were not tested.

The separate native Story/Dream map-boundary audit walked all four movement edges across 55 combat maps, two modes and three layouts (330 fixtures). The attack and movement browser tests are staged fixture checks. Natural hidden-finale completion remains unverified.

## Other limitations

The six Library concept-image files could not be downloaded in this environment: the authorized file download was rejected as unresolved, and the signed read URL was denied by the network proxy with HTTP 403. Their pixels were not inspected or substituted. The shipped audit confirms the checked-in project art decodes in browser tests; it does not verify those six inaccessible source uploads. No physical-phone test was run.
