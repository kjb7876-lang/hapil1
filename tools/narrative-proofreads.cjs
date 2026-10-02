'use strict';
// Conservative, user-authorized corrections; exact sentences prevent unrelated rewrites.
const {corrections}=require('../data/rc57/narrative-proofreads-20261002.json');
function applyNarrativeProofreads(text){for(const row of corrections)text=text.replaceAll(row.oldSentence,row.newSentence);return text;}
module.exports={applyNarrativeProofreads};
