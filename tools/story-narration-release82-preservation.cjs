'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
const EXPANDED_BASE="473f5fe6ab717bb975c35f198938f43dd55f9358";
const EXPANDED_BASE_TREE="302e4753a5729016ee7fd642b57f98e3c5c330d2";
const EXPANDED_AUDIO_REVISION="6f5e498fe7ddc57cd694851cf2d89262ce9b67e1";
const BASE_MANIFEST_SHA256="68dbee6e0f43887be252af75884b3247409e5b76d546c6d8182483d6307f6725";
const EXPANDED_MANIFEST_SHA256="6ddb1b8765e653fdc1fea807ff7855d004a56be0215417f1d10fad3fb10c867f";
const EXPANDED_SOURCE_MANIFEST_SHA256="f39f8896e2fafbe9ac6657bea11471444d39cdb807c0927ebce0b61387df1192";
const EXPANDED_BINDINGS_SHA256="b28fe69ca5545c4b50cb523e0452eb23135af1b9fc1bc09d2789efd3d86b546d";
const EXPANDED_NEW_UNITS=[
  "cult03.post",
  "cult04.pre",
  "death.title",
  "death.verse1",
  "death.verse2",
  "ending.title",
  "journal.dist00.p2",
  "journal.dist00.p3",
  "prologue.passing"
];
const EXPANDED_NEW_ROUTES=[
  "cult03:post",
  "cult04:pre",
  "death:verse",
  "ending:title",
  "journal:cult04:entry",
  "journal:dist00:body"
];
const EXPANDED_NEW_AUDIO=[
  {
    "file": "assets/story-narration/v1/audio/cult03-post-6aaf5ffa02154df998feed90.mp3",
    "sha256": "6aaf5ffa02154df998feed90c6d6d1b8b0d67a26efe3cf25f70d1b42409ed2f6",
    "bytes": 320300,
    "gitSha": "95a4d6c0e2bf43a043e94947b9bd02b45840a09d"
  },
  {
    "file": "assets/story-narration/v1/audio/cult04-pre-5049638b5121c49058c22f85.mp3",
    "sha256": "5049638b5121c49058c22f8522ae35c5a67005ad60b93aae0b8a072cb74971ea",
    "bytes": 293804,
    "gitSha": "6350a75fc2b976a18f6379ce634aceb2dc31cb2a"
  },
  {
    "file": "assets/story-narration/v1/audio/death-title-c0fb883cbc30d27a1801a817.mp3",
    "sha256": "c0fb883cbc30d27a1801a8179bbb6af40a9910eff1c850e6bd5142e545366280",
    "bytes": 67628,
    "gitSha": "e985d2991193b3de84208b7492d53173eb06ae34"
  },
  {
    "file": "assets/story-narration/v1/audio/death-verse1-234eded73b094df218e9f318.mp3",
    "sha256": "234eded73b094df218e9f31883b955aeb94c76b330c3d9ca3da4df43ed7b4494",
    "bytes": 58028,
    "gitSha": "341f0a2a71aa30b647b2cce9cfb35b23cdb0cce4"
  },
  {
    "file": "assets/story-narration/v1/audio/death-verse2-59e9bb4110551875cf15fd2f.mp3",
    "sha256": "59e9bb4110551875cf15fd2f1c753c2bac3131cf24e2183e2f9c21486df204ad",
    "bytes": 73772,
    "gitSha": "9dc1f66b64e6dac3e7a173dda65d0bf06f4770de"
  },
  {
    "file": "assets/story-narration/v1/audio/ending-title-d17fc91efd3d079941ca3a53.mp3",
    "sha256": "d17fc91efd3d079941ca3a5306842c14e86b1a582619ea03a5ded82f37ee2c76",
    "bytes": 129452,
    "gitSha": "17615ef85326260d6171e10477fb303fb253ecb4"
  },
  {
    "file": "assets/story-narration/v1/audio/journal-dist00-p2-577e3ec3ac3111455e5e2536.mp3",
    "sha256": "577e3ec3ac3111455e5e253661a2ce986d521d3a1af77fc678c08bb75d67c1e8",
    "bytes": 309932,
    "gitSha": "71d40e509ee1ed7f5e0f74d4fc5cc3df7128a9b0"
  },
  {
    "file": "assets/story-narration/v1/audio/journal-dist00-p3-2c42737d8b295f2f1db9d3ef.mp3",
    "sha256": "2c42737d8b295f2f1db9d3efdb670ef0581a5f2e5f58a1036fb63d52e2e0b4f9",
    "bytes": 477356,
    "gitSha": "cc09abf52346fec9d91167a82ea11b8bd10396e0"
  },
  {
    "file": "assets/story-narration/v1/audio/p-038f99915ab596fb313edf42.mp3",
    "sha256": "038f99915ab596fb313edf42e0b68902346d02246d5965f04619d488b6793895",
    "bytes": 66860,
    "gitSha": "500c468a247c16ea9bdad201c323d61d3bfaa06c"
  },
  {
    "file": "assets/story-narration/v1/audio/p-2831efe357f38ddb7d3c027d.mp3",
    "sha256": "2831efe357f38ddb7d3c027da39dd4475d83d17a137a9494fc4157488d1f0129",
    "bytes": 60716,
    "gitSha": "34de5bd241d9318bd3b387cd7ca35ca9fec74387"
  },
  {
    "file": "assets/story-narration/v1/audio/p-82b116f70f17961ba16f3b47.mp3",
    "sha256": "82b116f70f17961ba16f3b47195d823dd77dddd7123c4748cb237ce5c94ca383",
    "bytes": 303404,
    "gitSha": "55c5a28d51c1e0c69fce9b13c4a3148eb847a125"
  },
  {
    "file": "assets/story-narration/v1/audio/p-a084f0a17236e84cf617a22d.mp3",
    "sha256": "a084f0a17236e84cf617a22dc7ad408e2f3e888479510dfd87a62f9c26fab310",
    "bytes": 81068,
    "gitSha": "78a1d5cfffc17208170a2a09874ecf87dfc70a2b"
  },
  {
    "file": "assets/story-narration/v1/audio/p-b7d6321ca2583146ad24c818.mp3",
    "sha256": "b7d6321ca2583146ad24c8182235bdb56869df74575e79c19ee867f1e47196d0",
    "bytes": 122540,
    "gitSha": "ab96017d0dc1c101f1a6c9b64b1a8882308bff92"
  },
  {
    "file": "assets/story-narration/v1/audio/p-b930c4444cdc7ed759268a8c.mp3",
    "sha256": "b930c4444cdc7ed759268a8c98ff1fa088497d96795f25559a2ddc1478b77bd7",
    "bytes": 313388,
    "gitSha": "ad05efd859de548fc86bd4b62797b776eb731c2e"
  },
  {
    "file": "assets/story-narration/v1/audio/p-baf73ef7bd1b85a125f9e994.mp3",
    "sha256": "baf73ef7bd1b85a125f9e994d6d01d41b5fa25bb005fb9ffae3ec9659ce8ad36",
    "bytes": 286892,
    "gitSha": "bc40cc16c6e2d1e491cd56674f1ff8451748b536"
  },
  {
    "file": "assets/story-narration/v1/audio/p-f67481f65822970f9222a832.mp3",
    "sha256": "f67481f65822970f9222a832587638e1822f47c8efe628786e1cffff747816cf",
    "bytes": 470444,
    "gitSha": "865924b7e1b71f6ad05248d33ca5611448280fd3"
  },
  {
    "file": "assets/story-narration/v1/audio/p-ff21a017beef92039e04fe8a.mp3",
    "sha256": "ff21a017beef92039e04fe8ab57c3bd5144d6c0b3857f0226e37deb09a41a8f3",
    "bytes": 51116,
    "gitSha": "fde587b6ceb3142d33e4d13857f2be4df8189652"
  },
  {
    "file": "assets/story-narration/v1/audio/prologue-passing-05215515dc64cf8f993c5ffc.mp3",
    "sha256": "05215515dc64cf8f993c5ffc7d3750739f258b25e89fb328261df12513e8f8a8",
    "bytes": 87980,
    "gitSha": "728ba3ec39818e1bd5a0e28968e70624477b3a81"
  }
];
const EXPANDED_NEW_ASSETS={
  "audio/cult03-post-6aaf5ffa02154df998feed90.mp3": {
    "sha256": "6aaf5ffa02154df998feed90c6d6d1b8b0d67a26efe3cf25f70d1b42409ed2f6",
    "bytes": 320300,
    "duration": 19.992,
    "textSha256": "9591bcffcc688447c3534eee3fd679cce9b9232ede3614ea2a93b8b4281e394c",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "cb7bbc4fba06e2fb495c8d1095901042028a6e25494272e85ab76c4956da61cb",
        "audioSha256": "e61ffe35a084d3baba598a0f03770aaffe2850069a42f7be8d8d4722f9a309bc",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "a84382d4b89bde03027df98978c4a1491ee99391989cdee51192fa74503b0b84",
        "audioSha256": "4bd8e2db3b0a1e903ab9178737e37a3e2a09aef56f58e2ecebef874da711c545",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/cult04-pre-5049638b5121c49058c22f85.mp3": {
    "sha256": "5049638b5121c49058c22f8522ae35c5a67005ad60b93aae0b8a072cb74971ea",
    "bytes": 293804,
    "duration": 18.336,
    "textSha256": "ced200dc34e016b5fe225aa34a2bc17fd7cd3d5c58535432f51325e3503a8297",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "9abc4846aa31550f959a08cfe141b8617462bcb88db39b5063c4b29f73b528c9",
        "audioSha256": "c85af6f97d2a4078fe5779b4bd9cb1b2d8ea328cd3c0a56d70341250f3d2067d",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "d1230ae48c53706b3aa8a13e3f7cdea93b444f74a250834fb7fae7979584eb3b",
        "audioSha256": "01bc8086a43e4225a00750e36158dffc7badddc0546c5fb7de07e5303f14beb1",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/death-title-c0fb883cbc30d27a1801a817.mp3": {
    "sha256": "c0fb883cbc30d27a1801a8179bbb6af40a9910eff1c850e6bd5142e545366280",
    "bytes": 67628,
    "duration": 4.2,
    "textSha256": "2f4a3a8bc3204e0d7871463ddecf02c3d204d8ac14d3d66f9ccb33b381d1fe26",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "2f4a3a8bc3204e0d7871463ddecf02c3d204d8ac14d3d66f9ccb33b381d1fe26",
        "audioSha256": "8cca5f3115be49af7c4b3d019b4032b0f19668d64d6cdd160376f739718e2b94",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/death-verse1-234eded73b094df218e9f318.mp3": {
    "sha256": "234eded73b094df218e9f31883b955aeb94c76b330c3d9ca3da4df43ed7b4494",
    "bytes": 58028,
    "duration": 3.6,
    "textSha256": "9bf94cc7b7d175d6c3dd31f9ccd98a316eafbc3e66fc36a2104f0930aa8c4c73",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "9bf94cc7b7d175d6c3dd31f9ccd98a316eafbc3e66fc36a2104f0930aa8c4c73",
        "audioSha256": "941dbd9c9a322ea934887427e3fe1288d40026ea2aad2e9d4ec33633ecaf1073",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/death-verse2-59e9bb4110551875cf15fd2f.mp3": {
    "sha256": "59e9bb4110551875cf15fd2f1c753c2bac3131cf24e2183e2f9c21486df204ad",
    "bytes": 73772,
    "duration": 4.584,
    "textSha256": "7080695c7029c0c34a61ef660f4addb25c7227ae569f1038f0ac1dc4330f0d5b",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "7080695c7029c0c34a61ef660f4addb25c7227ae569f1038f0ac1dc4330f0d5b",
        "audioSha256": "e1bcdd4c5d91c54b5489c49a10209981db98035d1323d69afd13e5316d9a666a",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/ending-title-d17fc91efd3d079941ca3a53.mp3": {
    "sha256": "d17fc91efd3d079941ca3a5306842c14e86b1a582619ea03a5ded82f37ee2c76",
    "bytes": 129452,
    "duration": 8.064,
    "textSha256": "436fe116940364aae801358f94602e563d42675543a29b462bb9ad2142157fa6",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "436fe116940364aae801358f94602e563d42675543a29b462bb9ad2142157fa6",
        "audioSha256": "7e6d31057cc34ba83b06f87fd438c4b92fd6594d6a8257a5c33fdce1601aa6df",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/journal-dist00-p2-577e3ec3ac3111455e5e2536.mp3": {
    "sha256": "577e3ec3ac3111455e5e253661a2ce986d521d3a1af77fc678c08bb75d67c1e8",
    "bytes": 309932,
    "duration": 19.344,
    "textSha256": "f4a410f7d2ec325e422f5dc8aa410c92c3b7e5f3fc6d0109b5b5fff8d849381e",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "751c9e52982f55fef3283357b644be3a77bb6ac7dc5aedfc41fdf086960d94cc",
        "audioSha256": "745636f2aadb8fbbf66b156b00c52e28ad3cf92e7c15242905a79d6238ad3500",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "eefc1095763925f23f059524a3e3205abcec85afab9ba3282fd31cfbaf3362a2",
        "audioSha256": "0ee9b2593615df334a4aaa9eed638070b983991dca03f3edd66f1ac150af0feb",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/journal-dist00-p3-2c42737d8b295f2f1db9d3ef.mp3": {
    "sha256": "2c42737d8b295f2f1db9d3efdb670ef0581a5f2e5f58a1036fb63d52e2e0b4f9",
    "bytes": 477356,
    "duration": 29.808,
    "textSha256": "35658788a0bf1532fb759f68cc319d8d8620811a057f24fd205743f1d6cc9ab5",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "0c4a856c4fc0a4200955a1ba1431ecc9b39d1b4ef33aba2b652430a46bdd9b1b",
        "audioSha256": "d3f2d6b2a21839480190fb15c00b2c33092e05699ab44531f209b99caa34e2f2",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "177e3cc120011dd5da7ecde84773d1f33d93d1ab9d110c1b77d14e88be3255a7",
        "audioSha256": "2b831e5e9bbb267a61298ce8e27097281006416d715d5f609f8296d81fb2d0f9",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "44e3733c67f32ee1be378acb2eb6b3ceaaadeb3134d84a56b0701647414dc55a",
        "audioSha256": "9c9f19de0a88558bf3ab8dbc92bbd84bedafa2bd031caef3e29245a5d1cf987c",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/p-038f99915ab596fb313edf42.mp3": {
    "sha256": "038f99915ab596fb313edf42e0b68902346d02246d5965f04619d488b6793895",
    "bytes": 66860,
    "duration": 4.152,
    "textSha256": "7080695c7029c0c34a61ef660f4addb25c7227ae569f1038f0ac1dc4330f0d5b",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "7080695c7029c0c34a61ef660f4addb25c7227ae569f1038f0ac1dc4330f0d5b",
        "audioSha256": "e1bcdd4c5d91c54b5489c49a10209981db98035d1323d69afd13e5316d9a666a",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/p-2831efe357f38ddb7d3c027d.mp3": {
    "sha256": "2831efe357f38ddb7d3c027da39dd4475d83d17a137a9494fc4157488d1f0129",
    "bytes": 60716,
    "duration": 3.768,
    "textSha256": "2f4a3a8bc3204e0d7871463ddecf02c3d204d8ac14d3d66f9ccb33b381d1fe26",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "2f4a3a8bc3204e0d7871463ddecf02c3d204d8ac14d3d66f9ccb33b381d1fe26",
        "audioSha256": "8cca5f3115be49af7c4b3d019b4032b0f19668d64d6cdd160376f739718e2b94",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/p-82b116f70f17961ba16f3b47.mp3": {
    "sha256": "82b116f70f17961ba16f3b47195d823dd77dddd7123c4748cb237ce5c94ca383",
    "bytes": 303404,
    "duration": 18.936,
    "textSha256": "f4a410f7d2ec325e422f5dc8aa410c92c3b7e5f3fc6d0109b5b5fff8d849381e",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "751c9e52982f55fef3283357b644be3a77bb6ac7dc5aedfc41fdf086960d94cc",
        "audioSha256": "745636f2aadb8fbbf66b156b00c52e28ad3cf92e7c15242905a79d6238ad3500",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "eefc1095763925f23f059524a3e3205abcec85afab9ba3282fd31cfbaf3362a2",
        "audioSha256": "0ee9b2593615df334a4aaa9eed638070b983991dca03f3edd66f1ac150af0feb",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/p-a084f0a17236e84cf617a22d.mp3": {
    "sha256": "a084f0a17236e84cf617a22dc7ad408e2f3e888479510dfd87a62f9c26fab310",
    "bytes": 81068,
    "duration": 5.04,
    "textSha256": "f0b403d260532bb538a98861e6c663f4606e485376dcb4646ef224f5a0bd3f3b",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "f0b403d260532bb538a98861e6c663f4606e485376dcb4646ef224f5a0bd3f3b",
        "audioSha256": "b72e01388a2f69a8b5acc6cf1b512625ed08596b1122a07d4178f14949346c5d",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/p-b7d6321ca2583146ad24c818.mp3": {
    "sha256": "b7d6321ca2583146ad24c8182235bdb56869df74575e79c19ee867f1e47196d0",
    "bytes": 122540,
    "duration": 7.632,
    "textSha256": "436fe116940364aae801358f94602e563d42675543a29b462bb9ad2142157fa6",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "436fe116940364aae801358f94602e563d42675543a29b462bb9ad2142157fa6",
        "audioSha256": "7e6d31057cc34ba83b06f87fd438c4b92fd6594d6a8257a5c33fdce1601aa6df",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/p-b930c4444cdc7ed759268a8c.mp3": {
    "sha256": "b930c4444cdc7ed759268a8c98ff1fa088497d96795f25559a2ddc1478b77bd7",
    "bytes": 313388,
    "duration": 19.56,
    "textSha256": "9591bcffcc688447c3534eee3fd679cce9b9232ede3614ea2a93b8b4281e394c",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "cb7bbc4fba06e2fb495c8d1095901042028a6e25494272e85ab76c4956da61cb",
        "audioSha256": "e61ffe35a084d3baba598a0f03770aaffe2850069a42f7be8d8d4722f9a309bc",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "a84382d4b89bde03027df98978c4a1491ee99391989cdee51192fa74503b0b84",
        "audioSha256": "4bd8e2db3b0a1e903ab9178737e37a3e2a09aef56f58e2ecebef874da711c545",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/p-baf73ef7bd1b85a125f9e994.mp3": {
    "sha256": "baf73ef7bd1b85a125f9e994d6d01d41b5fa25bb005fb9ffae3ec9659ce8ad36",
    "bytes": 286892,
    "duration": 17.904,
    "textSha256": "ced200dc34e016b5fe225aa34a2bc17fd7cd3d5c58535432f51325e3503a8297",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "9abc4846aa31550f959a08cfe141b8617462bcb88db39b5063c4b29f73b528c9",
        "audioSha256": "c85af6f97d2a4078fe5779b4bd9cb1b2d8ea328cd3c0a56d70341250f3d2067d",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "d1230ae48c53706b3aa8a13e3f7cdea93b444f74a250834fb7fae7979584eb3b",
        "audioSha256": "01bc8086a43e4225a00750e36158dffc7badddc0546c5fb7de07e5303f14beb1",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/p-f67481f65822970f9222a832.mp3": {
    "sha256": "f67481f65822970f9222a832587638e1822f47c8efe628786e1cffff747816cf",
    "bytes": 470444,
    "duration": 29.376,
    "textSha256": "35658788a0bf1532fb759f68cc319d8d8620811a057f24fd205743f1d6cc9ab5",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "0c4a856c4fc0a4200955a1ba1431ecc9b39d1b4ef33aba2b652430a46bdd9b1b",
        "audioSha256": "d3f2d6b2a21839480190fb15c00b2c33092e05699ab44531f209b99caa34e2f2",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "177e3cc120011dd5da7ecde84773d1f33d93d1ab9d110c1b77d14e88be3255a7",
        "audioSha256": "2b831e5e9bbb267a61298ce8e27097281006416d715d5f609f8296d81fb2d0f9",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "44e3733c67f32ee1be378acb2eb6b3ceaaadeb3134d84a56b0701647414dc55a",
        "audioSha256": "9c9f19de0a88558bf3ab8dbc92bbd84bedafa2bd031caef3e29245a5d1cf987c",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/p-ff21a017beef92039e04fe8a.mp3": {
    "sha256": "ff21a017beef92039e04fe8ab57c3bd5144d6c0b3857f0226e37deb09a41a8f3",
    "bytes": 51116,
    "duration": 3.168,
    "textSha256": "9bf94cc7b7d175d6c3dd31f9ccd98a316eafbc3e66fc36a2104f0930aa8c4c73",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "9bf94cc7b7d175d6c3dd31f9ccd98a316eafbc3e66fc36a2104f0930aa8c4c73",
        "audioSha256": "941dbd9c9a322ea934887427e3fe1288d40026ea2aad2e9d4ec33633ecaf1073",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/prologue-passing-05215515dc64cf8f993c5ffc.mp3": {
    "sha256": "05215515dc64cf8f993c5ffc7d3750739f258b25e89fb328261df12513e8f8a8",
    "bytes": 87980,
    "duration": 5.472,
    "textSha256": "f0b403d260532bb538a98861e6c663f4606e485376dcb4646ef224f5a0bd3f3b",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "f0b403d260532bb538a98861e6c663f4606e485376dcb4646ef224f5a0bd3f3b",
        "audioSha256": "b72e01388a2f69a8b5acc6cf1b512625ed08596b1122a07d4178f14949346c5d",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  }
};
const EXPANDED_NEW_SCENES={
  "cult03:post": {
    "textSha256": "9591bcffcc688447c3534eee3fd679cce9b9232ede3614ea2a93b8b4281e394c",
    "audio": "audio/cult03-post-6aaf5ffa02154df998feed90.mp3",
    "duration": 19.992,
    "sha256": "6aaf5ffa02154df998feed90c6d6d1b8b0d67a26efe3cf25f70d1b42409ed2f6"
  },
  "cult04:pre": {
    "textSha256": "ced200dc34e016b5fe225aa34a2bc17fd7cd3d5c58535432f51325e3503a8297",
    "audio": "audio/cult04-pre-5049638b5121c49058c22f85.mp3",
    "duration": 18.336,
    "sha256": "5049638b5121c49058c22f8522ae35c5a67005ad60b93aae0b8a072cb74971ea"
  },
  "death:verse": {
    "textSha256": "cfdba8d53c0f33d2fe94a568ceb79a5322a28f185fc0e2b4ceae6b76274eb386",
    "clips": [
      {
        "audio": "audio/death-title-c0fb883cbc30d27a1801a817.mp3",
        "duration": 4.2,
        "sha256": "c0fb883cbc30d27a1801a8179bbb6af40a9910eff1c850e6bd5142e545366280"
      },
      {
        "audio": "audio/death-verse1-234eded73b094df218e9f318.mp3",
        "duration": 3.6,
        "sha256": "234eded73b094df218e9f31883b955aeb94c76b330c3d9ca3da4df43ed7b4494"
      },
      {
        "audio": "audio/death-verse2-59e9bb4110551875cf15fd2f.mp3",
        "duration": 4.584,
        "sha256": "59e9bb4110551875cf15fd2f1c753c2bac3131cf24e2183e2f9c21486df204ad"
      }
    ]
  },
  "ending:title": {
    "textSha256": "436fe116940364aae801358f94602e563d42675543a29b462bb9ad2142157fa6",
    "audio": "audio/ending-title-d17fc91efd3d079941ca3a53.mp3",
    "duration": 8.064,
    "sha256": "d17fc91efd3d079941ca3a5306842c14e86b1a582619ea03a5ded82f37ee2c76"
  },
  "journal:cult04:entry": {
    "textSha256": "ced200dc34e016b5fe225aa34a2bc17fd7cd3d5c58535432f51325e3503a8297",
    "clips": [
      {
        "audio": "audio/p-baf73ef7bd1b85a125f9e994.mp3",
        "duration": 17.904,
        "sha256": "baf73ef7bd1b85a125f9e994d6d01d41b5fa25bb005fb9ffae3ec9659ce8ad36"
      }
    ]
  },
  "journal:dist00:body": {
    "textSha256": "06f95b5252183d7bbeaca2dc53485acf556f4b4b86078efac2453506a74e93e3",
    "clips": [
      {
        "audio": "audio/p-82b116f70f17961ba16f3b47.mp3",
        "duration": 18.936,
        "sha256": "82b116f70f17961ba16f3b47195d823dd77dddd7123c4748cb237ce5c94ca383"
      },
      {
        "audio": "audio/p-f67481f65822970f9222a832.mp3",
        "duration": 29.376,
        "sha256": "f67481f65822970f9222a832587638e1822f47c8efe628786e1cffff747816cf"
      }
    ]
  }
};
const EXPECTED_ANCHOR_BLOBS={
  "base": {
    "assets/story-narration/v1/manifest.json": "9322ff30fe5e94115d88c52ce843ca770805c0d8",
    "index.html": "a9259987b1a38c8c36981e48d86c9b4a1e859489"
  },
  "seed": {
    "assets/story-narration/v1/manifest.json": "7b56496a0f99c85047d6cf99809aff3af569999c",
    "index.html": "f0edec179b05c98115442791eef516dfbcb7212b"
  }
};
const HISTORICAL_GUARD_PINS={
  "tools/rc130-preservation.cjs": "a9f94dca0c3a6b9279f3cada0a89a609030b23c926681ebb17f59791792dbec4",
  "tools/story-narration-release73-preservation.cjs": "3a29ed2f18769ce2513ba5039a272ded9a3efd828a383504728449a4db0b1f92",
  "tools/rc132-preservation.cjs": "5dd916e86e1e24453fa490a3e1c6bc7514e3740de23478da9b7bdc7619daf65f"
};
function validateExpandedRevision(root, exec, ensure) {
  const manifestPath='assets/story-narration/v1/manifest.json',prefix='assets/story-narration/v1/';
  const sorted=values=>values.slice().sort();
  assert(/^[a-f0-9]{40}$/.test(EXPANDED_AUDIO_REVISION),'Expanded narration seed must be finalized');
  assert.equal(EXPANDED_NEW_AUDIO.length,18); assert.equal(new Set(EXPANDED_NEW_AUDIO.map(row=>row.file)).size,18);
  assert.deepEqual(sorted(EXPANDED_NEW_UNITS),['cult03.post','cult04.pre','death.title','death.verse1','death.verse2','ending.title','journal.dist00.p2','journal.dist00.p3','prologue.passing']);
  assert.equal(EXPANDED_NEW_ROUTES.length,6); assert.equal(new Set(EXPANDED_NEW_ROUTES).size,6);
  ensure(EXPANDED_BASE); ensure(EXPANDED_AUDIO_REVISION);
  const baseHeaders=exec('git',['cat-file','-p',EXPANDED_BASE]).split('\n\n')[0];
  assert.equal(baseHeaders.split('\n')[0],'tree '+EXPANDED_BASE_TREE,'Expanded baseline tree differs from exact reviewed main');
  const headers=exec('git',['cat-file','-p',EXPANDED_AUDIO_REVISION]).split('\n\n')[0];
  const parents=headers.split('\n').filter(line=>line.startsWith('parent ')).map(line=>line.slice(7));
  assert.deepEqual(parents,[EXPANDED_BASE],'Expanded narration seed must descend directly from its verified main');
  const beforeText=exec('git',['show',EXPANDED_BASE+':'+manifestPath]);
  const afterText=exec('git',['show',EXPANDED_AUDIO_REVISION+':'+manifestPath]);
  assert.equal(digest(beforeText),BASE_MANIFEST_SHA256,'Prior narration manifest differs from exact release 73');
  assert.equal(digest(afterText),EXPANDED_MANIFEST_SHA256,'Expanded narration manifest is not the frozen package');
  const before=JSON.parse(beforeText),after=JSON.parse(afterText);
  const parts=exec('git',['diff','--no-ext-diff','--no-textconv','--no-renames','--name-status','-z',EXPANDED_BASE,EXPANDED_AUDIO_REVISION,'--']).split('\0');
  assert.equal(parts.pop(),''); assert.equal(parts.length%2,0);
  const changes=[];
  for(let i=0;i<parts.length;i+=2)changes.push({status:parts[i],file:parts[i+1]});
  const sortRows=rows=>rows.sort((a,b)=>a.file<b.file?-1:a.file>b.file?1:0);
  const expected=sortRows([{status:'M',file:manifestPath},{status:'M',file:'index.html'},...EXPANDED_NEW_AUDIO.map(row=>({status:'A',file:row.file}))]);
  assert.deepEqual(sortRows(changes),expected,'Expanded narration seed changed an unapproved path or existing asset');
  function entries(ref) {
    return new Map(exec('git',['ls-tree','-z',ref,'--',...expected.map(row=>row.file)]).split('\0').filter(Boolean).map(line=>{
      const match=/^(\d+) (\w+) ([a-f0-9]{40})\t(.+)$/.exec(line);
      assert(match,'Malformed Git tree entry');
      return[match[4],{mode:match[1],type:match[2],sha:match[3]}];
    }));
  }
  const oldTree=entries(EXPANDED_BASE),newTree=entries(EXPANDED_AUDIO_REVISION);
  for(const change of expected) {
    const entry=newTree.get(change.file);
    assert(entry&&entry.mode==='100644'&&entry.type==='blob','Expanded seed path is not an ordinary file: '+change.file);
    if(change.status==='A')assert(!oldTree.has(change.file),'Expanded audio overwrote an existing path');
    else assert(oldTree.get(change.file)?.mode==='100644'&&oldTree.get(change.file)?.type==='blob','Expanded seed changed a file mode/type');
  }
  for(const file of [manifestPath,'index.html']) {
    assert.equal(oldTree.get(file).sha,EXPECTED_ANCHOR_BLOBS.base[file],'Prior anchor blob differs: '+file);
    assert.equal(newTree.get(file).sha,EXPECTED_ANCHOR_BLOBS.seed[file],'Seed anchor blob differs: '+file);
  }
  assert.deepEqual(sorted(Object.keys(after)),sorted(Object.keys(before)),'Expanded narration manifest contract keys changed');
  for(const key of Object.keys(before).filter(key=>!['coverage','assets','scenes'].includes(key)))
    assert.deepEqual(after[key],before[key],'Existing narration contract changed: '+key);
  assert.deepEqual(sorted(Object.keys(after.coverage)),sorted(Object.keys(before.coverage)),'Coverage contract keys changed');
  for(const key of Object.keys(before.coverage).filter(key=>!['includedUnits','pendingUnits','includedRoutes','pendingRoutes'].includes(key)))assert.deepEqual(after.coverage[key],before.coverage[key],'Coverage contract changed: '+key);
  assert.equal(before.coverage.canonicalUnits,119); assert.equal(before.coverage.totalRoutes,297);
  assert.equal(before.coverage.includedUnits.length,73); assert.equal(new Set(before.coverage.includedUnits).size,73);
  assert(EXPANDED_NEW_UNITS.every(id=>!before.coverage.includedUnits.includes(id)&&before.coverage.pendingUnits.includes(id)),'Expanded added unit already existed or was not pending');
  assert.deepEqual(sorted(after.coverage.includedUnits),sorted([...before.coverage.includedUnits,...EXPANDED_NEW_UNITS]),'Unexpected included unit change');
  assert.equal(after.coverage.includedUnits.length,82); assert.equal(new Set(after.coverage.includedUnits).size,82);
  assert.deepEqual(after.coverage.pendingUnits,before.coverage.pendingUnits.filter(id=>!EXPANDED_NEW_UNITS.includes(id)),'Unexpected pending unit change');
  assert.equal(after.coverage.pendingUnits.length,37); assert.equal(new Set(after.coverage.pendingUnits).size,37);
  assert(after.coverage.pendingUnits.every(id=>!after.coverage.includedUnits.includes(id)),'Included and pending units overlap');
  assert.equal(Object.keys(before.assets).length,237); assert.equal(Object.keys(before.retiredAssets).length,14);
  assert.equal(Object.keys(after.assets).length,255); assert.equal(Object.keys(after.retiredAssets).length,14);
  assert.deepEqual(after.retiredAssets,before.retiredAssets,'Retired audio must remain the exact historical fourteen');
  for(const [file,metadata] of Object.entries(before.assets))
    assert.deepEqual(after.assets[file],metadata,'Existing audio metadata changed: '+file);
  const added=Object.keys(after.assets).filter(file=>!Object.hasOwn(before.assets,file)).map(file=>prefix+file);
  assert.deepEqual(sorted(added),sorted(EXPANDED_NEW_AUDIO.map(row=>row.file)),'Expanded seed does not contain the frozen audio set');
  for(const row of EXPANDED_NEW_AUDIO) {
    assert(/^assets\/story-narration\/v1\/audio\/[a-z0-9-]+\.mp3$/.test(row.file),'Expanded audio path is invalid');
    const file=row.file.slice(prefix.length),metadata=after.assets[file];
    assert(!Object.hasOwn(before.assets,file)&&!Object.hasOwn(before.retiredAssets,file),'Expanded audio reused a published address: '+file);
    assert(/^[a-f0-9]{64}$/.test(row.sha256)&&row.file.endsWith('-'+row.sha256.slice(0,24)+'.mp3'),'Frozen audio address does not match content');
    assert.equal(metadata.sha256,row.sha256,'Expanded audio hash differs from frozen selection: '+row.file);
    assert.equal(metadata.bytes,row.bytes,'Expanded audio byte count differs from frozen selection: '+row.file);
    assert.deepEqual(metadata,EXPANDED_NEW_ASSETS[file],'Expanded asset metadata differs from frozen selection: '+file);
    assert.equal(newTree.get(row.file).sha,row.gitSha,'Expanded seed audio blob differs: '+row.file);
    const bytes=cp.execFileSync('git',['--no-replace-objects','show',EXPANDED_AUDIO_REVISION+':'+row.file],{cwd:root,maxBuffer:32*1024*1024});
    assert.equal(digest(bytes),row.sha256,'Expanded seed audio hash differs: '+row.file);
    assert.equal(bytes.length,row.bytes,'Expanded seed audio byte count differs: '+row.file);
  }
  assert.equal(Object.keys(before.scenes).length,176); assert.equal(before.coverage.includedRoutes,176);
  for(const [key,route] of Object.entries(before.scenes))
    assert.deepEqual(after.scenes[key],route,'Existing narration route changed: '+key);
  const newRoutes=Object.keys(after.scenes).filter(key=>!Object.hasOwn(before.scenes,key));
  assert.deepEqual(sorted(newRoutes),EXPANDED_NEW_ROUTES,'Unexpected new narration routes');
  for(const key of EXPANDED_NEW_ROUTES)assert.deepEqual(after.scenes[key],EXPANDED_NEW_SCENES[key],'Expanded route metadata differs from frozen selection: '+key);
  assert.equal(newRoutes.length,6); assert.equal(after.coverage.includedRoutes,182); assert.equal(Object.keys(after.scenes).length,182);
  assert(EXPANDED_NEW_ROUTES.every(key=>before.coverage.pendingRoutes.includes(key)),'New narration route was not pending');
  assert.deepEqual(after.coverage.pendingRoutes,before.coverage.pendingRoutes.filter(key=>!EXPANDED_NEW_ROUTES.includes(key)),'Unexpected pending route change');
  assert.equal(after.coverage.pendingRoutes.length,115); assert.equal(new Set(after.coverage.pendingRoutes).size,115);
  assert(after.coverage.pendingRoutes.every(key=>!Object.hasOwn(after.scenes,key)),'Included and pending routes overlap');
  assert(after.coverage.includedUnits.includes('prologue.passing')&&after.coverage.pendingUnits.includes('prologue.awakening'),'Prologue unit partition changed');
  for(const key of ['prologue:quote','journal:dist00:entry','journal:dist00:all'])
    assert(!Object.hasOwn(after.scenes,key)&&after.coverage.pendingRoutes.includes(key),'Incomplete combined route must remain pending: '+key);
  assert.deepEqual(Object.keys(after.scenes).filter(key=>key.startsWith('journal:dist00:')),['journal:dist00:body'],'Only the completed dist00 body tab may open');
  const from='    <script src="./assets/story-narration/v1/player.js?v=2026100307"></script>';
  const to='    <script src="./assets/story-narration/v1/player.js?v=2026100308"></script>';
  const oldHtml=exec('git',['show',EXPANDED_BASE+':index.html']),newHtml=exec('git',['show',EXPANDED_AUDIO_REVISION+':index.html']);
  assert.equal(oldHtml.split(from).length,2,'Expected one prior expanded narration loader');
  assert.equal(newHtml.split(to).length,2,'Expected one expanded narration loader');
  assert.equal(newHtml,oldHtml.replace(from,to),'Expanded narration seed changed more than the cache query');
  return{base:EXPANDED_BASE,reference:EXPANDED_AUDIO_REVISION,files:EXPANDED_NEW_AUDIO.map(row=>row.file),from,to,
    report:{base:EXPANDED_BASE,reference:EXPANDED_AUDIO_REVISION,sourceManifestSha256:EXPANDED_SOURCE_MANIFEST_SHA256,bindingsSha256:EXPANDED_BINDINGS_SHA256,runtimeManifestSha256:EXPANDED_MANIFEST_SHA256,additionalUnits:9,replacedUnits:[],unchangedPreviouslyPublishedUnits:73,replacedAudioFiles:0,additionalAudioFiles:18,additionalRoutes:6,includedUnits:82,includedRoutes:182,currentAudioFiles:255,retiredAudioFiles:14,oldAudioAndRoutesPreserved:true}};
}

const RUNTIME_PATHS=['assets','audio','data','index.html'];
function verifyCurrentRuntime(root, exec) {
  const rootStat=fs.lstatSync(root);
  assert(rootStat.isDirectory()&&!rootStat.isSymbolicLink(),'Runtime root must be an ordinary directory');
  const committed=exec('git',['diff','--no-ext-diff','--no-textconv','--name-only','-z',EXPANDED_AUDIO_REVISION,'HEAD','--',...RUNTIME_PATHS]).split('\0').filter(Boolean);
  assert.deepEqual(committed,[],'Committed runtime differs from the exact reviewed-82 seed');
  const entries=exec('git',['ls-tree','-r','-z',EXPANDED_AUDIO_REVISION,'--',...RUNTIME_PATHS]).split('\0').filter(Boolean).map(line=>{
    const match=/^(\d+) (\w+) ([a-f0-9]{40})\t(.+)$/.exec(line);
    assert(match,'Malformed runtime Git tree entry');
    assert(match[2]==='blob'&&['100644','100755'].includes(match[1]),'Runtime seed contains a nonordinary path: '+match[4]);
    return{mode:match[1],object:match[3],file:match[4]};
  }).sort((a,b)=>a.file<b.file?-1:a.file>b.file?1:0);
  const expected=entries.map(row=>row.file);
  assert(expected.includes('index.html')&&expected.includes('assets/story-narration/v1/manifest.json'),'Runtime inventory omitted required anchors');
  assert.equal(new Set(expected).size,expected.length,'Runtime inventory contains duplicate paths');
  const expectedDirs=new Set();
  for(const file of expected)for(let dir=path.posix.dirname(file);dir!=='.';dir=path.posix.dirname(dir))expectedDirs.add(dir);
  const actual=[],actualDirs=[];
  function walk(relative) {
    const full=path.join(root,relative);
    let stat;
    try{stat=fs.lstatSync(full);}catch(error){if(error.code==='ENOENT')return;throw error;}
    assert(!stat.isSymbolicLink(),'Current protected runtime contains a symlink: '+relative);
    if(stat.isDirectory()) {
      actualDirs.push(relative);
      for(const name of fs.readdirSync(full))walk(relative+'/'+name);
    } else {
      assert(stat.isFile(),'Current protected runtime is not an ordinary file: '+relative);
      actual.push(relative);
    }
  }
  for(const relative of RUNTIME_PATHS)walk(relative);
  assert.deepEqual(actual.sort(),expected,'Current runtime inventory differs from the exact seed (missing or untracked file)');
  assert.deepEqual(actualDirs.sort(),Array.from(expectedDirs).sort(),'Current runtime directory inventory differs from the exact seed');
  const rows=entries.map(row=>{
    const filename=path.join(root,row.file),stat=fs.lstatSync(filename);
    const actualMode=stat.mode&0o111?'100755':'100644';
    assert.equal(actualMode,row.mode,'Current runtime file mode differs from seed: '+row.file);
    const bytes=fs.readFileSync(filename);
    const actualBlob=crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
    assert.equal(actualBlob,row.object,'Current runtime bytes differ from seed: '+row.file);
    const actual=digest(bytes);
    return{file:row.file,mode:row.mode,gitBlob:row.object,expected:actual,actual};
  });
  return{reference:EXPANDED_AUDIO_REVISION,protectedPaths:RUNTIME_PATHS,checkedFiles:rows.length,checkedDirectories:actualDirs.length,files:rows,committedAndWorkingTreeMatch:true};
}
function ensurePinnedCommit(root,exec,ref) {
  assert(/^[a-f0-9]{40}$/.test(ref)&&[EXPANDED_BASE,EXPANDED_AUDIO_REVISION].includes(ref),'Only an exact pinned 40-hex commit may be fetched: '+ref);
  const exists=()=>cp.spawnSync('git',['--no-replace-objects','cat-file','-e',ref+'^{commit}'],{cwd:root,stdio:'ignore'}).status===0;
  if(!exists())exec('git',['fetch','--no-tags','--depth=1','origin',ref]);
  assert(exists(),'Required pinned commit remains unavailable after exact-SHA fetch: '+ref);
}
function verify(root) {
  root=path.resolve(root);
  assert(fs.lstatSync(root).isDirectory()&&!fs.lstatSync(root).isSymbolicLink(),'Runtime root must be an ordinary directory');
  const exec=(cmd,args,cwd=root)=>cp.execFileSync(cmd,cmd==='git'?['--no-replace-objects',...args]:args,{cwd,encoding:'utf8',maxBuffer:48*1024*1024});
  const ensure=ref=>ensurePinnedCommit(root,exec,ref);
  const expanded=validateExpandedRevision(root,exec,ensure);
  const current=verifyCurrentRuntime(root,exec);
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'hapil-narration82-baseline-')),baseline=path.join(directory,'baseline');
  let added=false;
  try {
    exec('git',['worktree','add','--detach',baseline,EXPANDED_BASE]);added=true;
    for(const [file,sha256] of Object.entries(HISTORICAL_GUARD_PINS)) {
      const filename=path.join(baseline,file),stat=fs.lstatSync(filename);
      assert(stat.isFile()&&!stat.isSymbolicLink()&&!(stat.mode&0o111),'Historical guard has unexpected mode/type: '+file);
      assert.equal(digest(fs.readFileSync(filename)),sha256,'Historical guard differs from exact 473f preimage: '+file);
    }
    // Prove the unchanged prior chain only on its exact detached parent after
    // checking every current runtime byte. Never substitute the browser's game.
    const historical=require(path.join(baseline,'tools/rc130-preservation.cjs')).verify(baseline);
    assert.equal(historical.report.status,'passed','Historical preservation proof did not pass');
    assert(Object.hasOwn(historical,'historical'),'Historical proof omitted the release-gate compatibility result');
    return{historical:historical.historical,report:{status:'passed',base:EXPANDED_BASE,reference:EXPANDED_AUDIO_REVISION,method:'Exact frozen narration delta, complete committed and current runtime inventory and byte/mode proof, then unchanged release-73/RC132/RC131/RC130 preservation on detached pinned 473f baseline',files:current.files,protectedPaths:RUNTIME_PATHS,currentRuntimeProof:current,independentExpandedNarrationBatch:expanded.report,historicalProof:historical.report}};
  }finally{
    try{if(added)exec('git',['worktree','remove','--force',baseline]);}
    finally{fs.rmSync(directory,{recursive:true,force:true});}
  }
}
module.exports={verify,BASE:EXPANDED_BASE};
if(require.main===module)console.log('NARRATION82_PRESERVATION',JSON.stringify(verify(path.resolve(__dirname,'..')).report));
