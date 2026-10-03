'use strict';
// Requested editorial pass after the existing approved spelling/spacing corrections.
// It must never be applied to JavaScript source syntax or to the original voice1/2 transcripts.
const pattern = /(?:\.*…[.…]*|\.{3,})[.!?。！？]*/gu;
function replaceNarrativeEllipses(text) {
  return String(text).replace(pattern, (match, offset, input) => {
    const separator = offset > 0 && /[\p{L}\p{N}]/u.test(input[offset - 1]) ? ' ' : '';
    return separator + '그러하였다.';
  });
}
module.exports = {replaceNarrativeEllipses};
