# RC141 StoryWorld correspondence delta

The correspondence baseline is `qa/rc140/storyworld-asset-map.json`, captured from runtime commit `40315fe53661516865c69576364197375c48fe2d`. That map covers 55 zones, 259 actors, 33 midboss identities across 35 route entries, 26 boss-skill source cells, 199 narration scenes, 61 Story records, and 414 catalog assets, with zero missing asset paths.

RC141 is an audio integration follow-up. It adds event routing for existing title controls, Seoha's awakening, Kairo phase attacks, Hwando's existing basic attack, and the existing resonance transaction. It adds no zones, quests, dialogue, boss identities, or narrative routes, so there is no new StoryWorld entry to reconcile. The existing zone, actor, boss, and narration mappings remain the source of truth.

QA is deliberately scoped to correspondence and event selection. First-map natural progression on the RC141 base SHA is available in the corresponding test report; a fresh full Dream campaign and natural hidden-final-boss defeat have not been verified on this follow-up SHA. Older native-save runs are recorded separately and are not presented as exact-current-SHA evidence.
