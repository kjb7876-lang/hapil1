'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
const EXPANDED_BASE="0d0017b379ab584e7e791c5bcaea4c54e7fc2b36";
const EXPANDED_BASE_TREE="32f1938ec1387f4468f6240d5c752973b763596e";
const EXPANDED_AUDIO_REVISION="45adabb6a6c39c25f806568bf9a1c6d3bd27fbf9";
const BASE_MANIFEST_SHA256="6ddb1b8765e653fdc1fea807ff7855d004a56be0215417f1d10fad3fb10c867f";
const EXPANDED_MANIFEST_SHA256="20cb70771a0d33aa3cbc4b61934103f9529d702c289b135db494945f5038c550";
const EXPANDED_SOURCE_MANIFEST_SHA256="a665f4f095a40bb1b9efee6fb493f13b11c11397220e4e5b0100e70f13f0f94b";
const EXPANDED_BINDINGS_SHA256="34c85320aa55fadafd25e743c30813bc3886ec0d3d5b50a563a6fdec6cac1358";
const EXPANDED_NEW_UNITS=[
  "cult03.pre",
  "cult06.post",
  "journal.dist00.p1"
];
const EXPANDED_NEW_ROUTES=[
  "cult03:pre",
  "cult06:post",
  "journal:cult03:all",
  "journal:cult03:body",
  "journal:cult03:entry",
  "journal:dist00:all",
  "journal:dist00:entry"
];
const EXPANDED_NEW_AUDIO=[
  {
    "file": "assets/story-narration/v1/audio/cult03-pre-d547787dc4af7174a8bd82ec.mp3",
    "sha256": "d547787dc4af7174a8bd82ecb05b46d9c9fb2776328dc947a320457e4f703293",
    "bytes": 951980,
    "gitSha": "d00d9bd1a0278bb07c03673e1efa7cd4f703cec6"
  },
  {
    "file": "assets/story-narration/v1/audio/cult06-post-6ef248210e02ae9fa902672f.mp3",
    "sha256": "6ef248210e02ae9fa902672f9d473e8117c7c7d305a1b910166582cb660c1fd7",
    "bytes": 288812,
    "gitSha": "c4587a7aeb57df2357e6596a0bfee4c067d03e24"
  },
  {
    "file": "assets/story-narration/v1/audio/journal-dist00-p1-303a0d4ad598120beaa75844.mp3",
    "sha256": "303a0d4ad598120beaa75844eb6683c9e1ce85c7852ef31e09e5af0eaefe2531",
    "bytes": 291500,
    "gitSha": "104eb05a7aa5f491f3fbe6eaca5d5684f86ed469"
  },
  {
    "file": "assets/story-narration/v1/audio/p-0b40d0ea40596167a326efc5.mp3",
    "sha256": "0b40d0ea40596167a326efc56ff7f1c2a47fbd597aa3628555d1f2288004994d",
    "bytes": 284588,
    "gitSha": "d81ede1442befbe1ce1f526ae6a1a70da6905d8f"
  },
  {
    "file": "assets/story-narration/v1/audio/p-4526ea80d7fb70c27fb342f5.mp3",
    "sha256": "4526ea80d7fb70c27fb342f56ea35ef1adaeb50f23dc49881da51fd5efaee50d",
    "bytes": 224684,
    "gitSha": "919dac0bbe30251513d017c9880d14cd1327ca7d"
  },
  {
    "file": "assets/story-narration/v1/audio/p-628adeefdb7f235932d92718.mp3",
    "sha256": "628adeefdb7f235932d92718ae5d8ef082e64398ed1b45d5bbeeb6a2db441e34",
    "bytes": 297644,
    "gitSha": "1024259229dd870cb67b56617929afdd6c26e7fe"
  },
  {
    "file": "assets/story-narration/v1/audio/p-d988c77ea754851eca65bffb.mp3",
    "sha256": "d988c77ea754851eca65bffb0773233fab24658d83e7d9ef565b01cda3980389",
    "bytes": 281900,
    "gitSha": "690e5de33507d59bf1018647b010282197a70a93"
  },
  {
    "file": "assets/story-narration/v1/audio/p-de973153e049cb5111b7167d.mp3",
    "sha256": "de973153e049cb5111b7167dd553e9081c01471009937974c224fd5d9d8bb624",
    "bytes": 218924,
    "gitSha": "0ba2b96b8e79621d7b03d2ebe7a75a6fda03f10e"
  },
  {
    "file": "assets/story-narration/v1/audio/p-e21c2275bc6cb459b1ec68b0.mp3",
    "sha256": "e21c2275bc6cb459b1ec68b04c092a8b7f6e78bdc9dfcdefc3099dfb80cd3662",
    "bytes": 194732,
    "gitSha": "1e4b1bdcbba19bd6da2e9b86adcec7b7a553af3c"
  }
];
const EXPANDED_NEW_ASSETS={
  "audio/cult03-pre-d547787dc4af7174a8bd82ec.mp3": {
    "sha256": "d547787dc4af7174a8bd82ecb05b46d9c9fb2776328dc947a320457e4f703293",
    "bytes": 951980,
    "duration": 59.472,
    "textSha256": "5607bb7a0834fac2986fa7ae1854f5abb0fd61f1bd641b6579292f9e8eb4d39b",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "f92fa66799522e6475543ab2e54123d24a7b927e0ab3041686605e87f499b063",
        "audioSha256": "0828019be7554177190fb6b0496caac1ef05732b5dfd8a2243bf1cfa91f82039",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "0e128e15f629c8dac5dcbed8fed769be214695cbb0c215461d171ee5f429f7b9",
        "audioSha256": "0babfca06126633b294128159e50d561d92785b9540d9a287dfb00b405bd5869",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "a80af6601393437bfca08ad9592e1ef36f63dfc9cd006aa986d234b2f2682185",
        "audioSha256": "f3a7e59bff8a162d5beb40b6401466da3fc38e29cb9569fa8f0fcbb2b288f5a5",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "f6aeadf669936c61a2de9fac6fff6c51fce868b9c9af66e12114e5328512e54c",
        "audioSha256": "34ad11e672fbdb8645a7ac18f2f7ec4401a9b8308c1c60abd6d17cfd6006db81",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "7e13cb7d899a03255b03fcb31e047fc846fefe5b1cc4f91d1f0b2d1e1b4a80b7",
        "audioSha256": "d90f6f0f473e86c8257f8239b817ff48e4e2559ad74e7ab3338bbb3fb7b1cb55",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "0fc5df79b16c5a483865af4e4a90e9d6c56aedbcf300581f13fe51525b57b6c7",
        "audioSha256": "f09514ea6c965bed45706e7b07a13068ea44f47943a13e861c22f26f8dd43fa5",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "fad13e8871dd0f9f89d610e0d5d9dac9968f6050f780d7a9ace20e9243695c85",
        "audioSha256": "9065ccf09902dec39e14f19a91e376e9e33135e0bf9b427f842b5b1dd4ebe1c8",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/cult06-post-6ef248210e02ae9fa902672f.mp3": {
    "sha256": "6ef248210e02ae9fa902672f9d473e8117c7c7d305a1b910166582cb660c1fd7",
    "bytes": 288812,
    "duration": 18.024,
    "textSha256": "973dd925f53a6bbbf940f69112fda501e6cff94dd9364bce3ddd12750c4d4451",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "346c676a2e1288d896f5b012abeb00430a65486301c3eb0fb098e488ed70b0e0",
        "audioSha256": "e00705e0cc3f818b9b14fe7655db98ff5cb943ed0f028c37965534b9fc160b55",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "073afd9ee0ee5aad4954857e7cbb3e3023c8828ebd37245cd9b676645e112e39",
        "audioSha256": "824c0ea6921b74e8c6e5b9494b2579de892a4326482e7b6a7b018e13991436e3",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/journal-dist00-p1-303a0d4ad598120beaa75844.mp3": {
    "sha256": "303a0d4ad598120beaa75844eb6683c9e1ce85c7852ef31e09e5af0eaefe2531",
    "bytes": 291500,
    "duration": 18.192,
    "textSha256": "68a89d720a85174e706571f106bc826e897fd938ea53580beb4adb94475ee94a",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "841f32fd75e974c13df6a6acced6c3d30b26e232907c97646ac88791701286a8",
        "audioSha256": "09caaf3caf1b20a228a898b4a56e3dea742dea7a46fe7aa76432fd88f9828b75",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "ca442c0d715e1573ad5645fcf7d6f102adbf3b55f561f9f1602469de3fc13a4d",
        "audioSha256": "05b612ef2a3d5665a5f313f579b7469f5ce79b15642918155938ce10a11e694a",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/p-0b40d0ea40596167a326efc5.mp3": {
    "sha256": "0b40d0ea40596167a326efc56ff7f1c2a47fbd597aa3628555d1f2288004994d",
    "bytes": 284588,
    "duration": 17.76,
    "textSha256": "68a89d720a85174e706571f106bc826e897fd938ea53580beb4adb94475ee94a",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "841f32fd75e974c13df6a6acced6c3d30b26e232907c97646ac88791701286a8",
        "audioSha256": "09caaf3caf1b20a228a898b4a56e3dea742dea7a46fe7aa76432fd88f9828b75",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "ca442c0d715e1573ad5645fcf7d6f102adbf3b55f561f9f1602469de3fc13a4d",
        "audioSha256": "05b612ef2a3d5665a5f313f579b7469f5ce79b15642918155938ce10a11e694a",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/p-4526ea80d7fb70c27fb342f5.mp3": {
    "sha256": "4526ea80d7fb70c27fb342f56ea35ef1adaeb50f23dc49881da51fd5efaee50d",
    "bytes": 224684,
    "duration": 14.016,
    "textSha256": "eb4e40409732a0b5deaa5d3bde77c1dfb65acabf033dfe6e02721614cc076078",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "0e128e15f629c8dac5dcbed8fed769be214695cbb0c215461d171ee5f429f7b9",
        "audioSha256": "0babfca06126633b294128159e50d561d92785b9540d9a287dfb00b405bd5869",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "a80af6601393437bfca08ad9592e1ef36f63dfc9cd006aa986d234b2f2682185",
        "audioSha256": "f3a7e59bff8a162d5beb40b6401466da3fc38e29cb9569fa8f0fcbb2b288f5a5",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/p-628adeefdb7f235932d92718.mp3": {
    "sha256": "628adeefdb7f235932d92718ae5d8ef082e64398ed1b45d5bbeeb6a2db441e34",
    "bytes": 297644,
    "duration": 18.576,
    "textSha256": "ab7c783fba4722536f9684328e0c47e2f8554262ed3f90121957fa78c83c1af1",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "f6aeadf669936c61a2de9fac6fff6c51fce868b9c9af66e12114e5328512e54c",
        "audioSha256": "34ad11e672fbdb8645a7ac18f2f7ec4401a9b8308c1c60abd6d17cfd6006db81",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "7e13cb7d899a03255b03fcb31e047fc846fefe5b1cc4f91d1f0b2d1e1b4a80b7",
        "audioSha256": "d90f6f0f473e86c8257f8239b817ff48e4e2559ad74e7ab3338bbb3fb7b1cb55",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/p-d988c77ea754851eca65bffb.mp3": {
    "sha256": "d988c77ea754851eca65bffb0773233fab24658d83e7d9ef565b01cda3980389",
    "bytes": 281900,
    "duration": 17.592,
    "textSha256": "973dd925f53a6bbbf940f69112fda501e6cff94dd9364bce3ddd12750c4d4451",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "346c676a2e1288d896f5b012abeb00430a65486301c3eb0fb098e488ed70b0e0",
        "audioSha256": "e00705e0cc3f818b9b14fe7655db98ff5cb943ed0f028c37965534b9fc160b55",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "073afd9ee0ee5aad4954857e7cbb3e3023c8828ebd37245cd9b676645e112e39",
        "audioSha256": "824c0ea6921b74e8c6e5b9494b2579de892a4326482e7b6a7b018e13991436e3",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/p-de973153e049cb5111b7167d.mp3": {
    "sha256": "de973153e049cb5111b7167dd553e9081c01471009937974c224fd5d9d8bb624",
    "bytes": 218924,
    "duration": 13.656,
    "textSha256": "1a9347e5306eebf83d7f72827458c2ca1132aa85bd5702f9723d98c5659f7084",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "0fc5df79b16c5a483865af4e4a90e9d6c56aedbcf300581f13fe51525b57b6c7",
        "audioSha256": "f09514ea6c965bed45706e7b07a13068ea44f47943a13e861c22f26f8dd43fa5",
        "endingProfile": "direct-utterance-fulltext-v1"
      },
      {
        "textSha256": "fad13e8871dd0f9f89d610e0d5d9dac9968f6050f780d7a9ace20e9243695c85",
        "audioSha256": "9065ccf09902dec39e14f19a91e376e9e33135e0bf9b427f842b5b1dd4ebe1c8",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  },
  "audio/p-e21c2275bc6cb459b1ec68b0.mp3": {
    "sha256": "e21c2275bc6cb459b1ec68b04c092a8b7f6e78bdc9dfcdefc3099dfb80cd3662",
    "bytes": 194732,
    "duration": 12.144,
    "textSha256": "f92fa66799522e6475543ab2e54123d24a7b927e0ab3041686605e87f499b063",
    "codec": "mp3",
    "bitRate": 128000,
    "sampleRate": 24000,
    "channels": 1,
    "endingProfile": "direct-utterance-fulltext-v1",
    "boundaryProvenance": [
      {
        "textSha256": "f92fa66799522e6475543ab2e54123d24a7b927e0ab3041686605e87f499b063",
        "audioSha256": "0828019be7554177190fb6b0496caac1ef05732b5dfd8a2243bf1cfa91f82039",
        "endingProfile": "direct-utterance-fulltext-v1"
      }
    ]
  }
};
const EXPANDED_NEW_SCENES={
  "cult03:pre": {
    "textSha256": "5607bb7a0834fac2986fa7ae1854f5abb0fd61f1bd641b6579292f9e8eb4d39b",
    "audio": "audio/cult03-pre-d547787dc4af7174a8bd82ec.mp3",
    "duration": 59.472,
    "sha256": "d547787dc4af7174a8bd82ecb05b46d9c9fb2776328dc947a320457e4f703293"
  },
  "cult06:post": {
    "textSha256": "973dd925f53a6bbbf940f69112fda501e6cff94dd9364bce3ddd12750c4d4451",
    "audio": "audio/cult06-post-6ef248210e02ae9fa902672f.mp3",
    "duration": 18.024,
    "sha256": "6ef248210e02ae9fa902672f9d473e8117c7c7d305a1b910166582cb660c1fd7"
  },
  "journal:cult03:all": {
    "textSha256": "360bd965e5d1dcdaf4c3686e5a4a0891dd694e38970fde69149dcccb7d21d2b3",
    "clips": [
      {
        "audio": "audio/p-e21c2275bc6cb459b1ec68b0.mp3",
        "duration": 12.144,
        "sha256": "e21c2275bc6cb459b1ec68b04c092a8b7f6e78bdc9dfcdefc3099dfb80cd3662"
      },
      {
        "audio": "audio/p-4526ea80d7fb70c27fb342f5.mp3",
        "duration": 14.016,
        "sha256": "4526ea80d7fb70c27fb342f56ea35ef1adaeb50f23dc49881da51fd5efaee50d"
      },
      {
        "audio": "audio/p-628adeefdb7f235932d92718.mp3",
        "duration": 18.576,
        "sha256": "628adeefdb7f235932d92718ae5d8ef082e64398ed1b45d5bbeeb6a2db441e34"
      },
      {
        "audio": "audio/p-de973153e049cb5111b7167d.mp3",
        "duration": 13.656,
        "sha256": "de973153e049cb5111b7167dd553e9081c01471009937974c224fd5d9d8bb624"
      },
      {
        "audio": "audio/p-b930c4444cdc7ed759268a8c.mp3",
        "duration": 19.56,
        "sha256": "b930c4444cdc7ed759268a8c98ff1fa088497d96795f25559a2ddc1478b77bd7"
      }
    ]
  },
  "journal:cult03:body": {
    "textSha256": "fb9cc237e5de40256f5ce7a1a5a0215b239e5b65fb86bba55e2114cad840708e",
    "clips": [
      {
        "audio": "audio/p-4526ea80d7fb70c27fb342f5.mp3",
        "duration": 14.016,
        "sha256": "4526ea80d7fb70c27fb342f56ea35ef1adaeb50f23dc49881da51fd5efaee50d"
      },
      {
        "audio": "audio/p-628adeefdb7f235932d92718.mp3",
        "duration": 18.576,
        "sha256": "628adeefdb7f235932d92718ae5d8ef082e64398ed1b45d5bbeeb6a2db441e34"
      },
      {
        "audio": "audio/p-de973153e049cb5111b7167d.mp3",
        "duration": 13.656,
        "sha256": "de973153e049cb5111b7167dd553e9081c01471009937974c224fd5d9d8bb624"
      },
      {
        "audio": "audio/p-b930c4444cdc7ed759268a8c.mp3",
        "duration": 19.56,
        "sha256": "b930c4444cdc7ed759268a8c98ff1fa088497d96795f25559a2ddc1478b77bd7"
      }
    ]
  },
  "journal:cult03:entry": {
    "textSha256": "f92fa66799522e6475543ab2e54123d24a7b927e0ab3041686605e87f499b063",
    "clips": [
      {
        "audio": "audio/p-e21c2275bc6cb459b1ec68b0.mp3",
        "duration": 12.144,
        "sha256": "e21c2275bc6cb459b1ec68b04c092a8b7f6e78bdc9dfcdefc3099dfb80cd3662"
      }
    ]
  },
  "journal:dist00:all": {
    "textSha256": "d0a8fc67859c0affd64de2d81d99e37777e329ab3878a0edf2671f0036e803ba",
    "clips": [
      {
        "audio": "audio/p-0b40d0ea40596167a326efc5.mp3",
        "duration": 17.76,
        "sha256": "0b40d0ea40596167a326efc56ff7f1c2a47fbd597aa3628555d1f2288004994d"
      },
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
  },
  "journal:dist00:entry": {
    "textSha256": "68a89d720a85174e706571f106bc826e897fd938ea53580beb4adb94475ee94a",
    "clips": [
      {
        "audio": "audio/p-0b40d0ea40596167a326efc5.mp3",
        "duration": 17.76,
        "sha256": "0b40d0ea40596167a326efc56ff7f1c2a47fbd597aa3628555d1f2288004994d"
      }
    ]
  }
};
const EXPECTED_ANCHOR_BLOBS={
  "base": {
    "assets/story-narration/v1/manifest.json": "7b56496a0f99c85047d6cf99809aff3af569999c",
    "index.html": "f0edec179b05c98115442791eef516dfbcb7212b"
  },
  "seed": {
    "assets/story-narration/v1/manifest.json": "301a78c70e028201ea59f15a6124671daa78d315",
    "index.html": "1b4a54e6e63e177fb1f045f00ddcfed62a9dbc2c"
  }
};
const HISTORICAL_GUARD_PINS={
  "tools/story-narration-release82-preservation.cjs": "6aa0adf099e46c5e92f21da6749e9893345dc760a1e3c5de0373b42d446b79af",
  "tools/rc130-preservation.cjs": "b4d769be5ba73b3765971a3e70c8889d2087ae4c4a47a17625c8e9cfbf00ccb2",
  "tools/story-narration-release73-preservation.cjs": "3a29ed2f18769ce2513ba5039a272ded9a3efd828a383504728449a4db0b1f92",
  "tools/rc132-preservation.cjs": "5dd916e86e1e24453fa490a3e1c6bc7514e3740de23478da9b7bdc7619daf65f"
};
function validateExpandedRevision(root, exec, ensure) {
  const manifestPath='assets/story-narration/v1/manifest.json',prefix='assets/story-narration/v1/';
  const sorted=values=>values.slice().sort();
  assert(/^[a-f0-9]{40}$/.test(EXPANDED_AUDIO_REVISION),'Expanded narration seed must be finalized');
  assert.equal(EXPANDED_NEW_AUDIO.length,9); assert.equal(new Set(EXPANDED_NEW_AUDIO.map(row=>row.file)).size,9);
  assert.deepEqual(sorted(EXPANDED_NEW_UNITS),['cult03.pre','cult06.post','journal.dist00.p1']);
  assert.equal(EXPANDED_NEW_ROUTES.length,7); assert.equal(new Set(EXPANDED_NEW_ROUTES).size,7);
  ensure(EXPANDED_BASE); ensure(EXPANDED_AUDIO_REVISION);
  const baseHeaders=exec('git',['cat-file','-p',EXPANDED_BASE]).split('\n\n')[0];
  assert.equal(baseHeaders.split('\n')[0],'tree '+EXPANDED_BASE_TREE,'Expanded baseline tree differs from exact reviewed main');
  const headers=exec('git',['cat-file','-p',EXPANDED_AUDIO_REVISION]).split('\n\n')[0];
  const parents=headers.split('\n').filter(line=>line.startsWith('parent ')).map(line=>line.slice(7));
  assert.deepEqual(parents,[EXPANDED_BASE],'Expanded narration seed must descend directly from its verified main');
  const beforeText=exec('git',['show',EXPANDED_BASE+':'+manifestPath]);
  const afterText=exec('git',['show',EXPANDED_AUDIO_REVISION+':'+manifestPath]);
  assert.equal(digest(beforeText),BASE_MANIFEST_SHA256,'Prior narration manifest differs from exact release 82');
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
  assert.equal(before.coverage.includedUnits.length,82); assert.equal(new Set(before.coverage.includedUnits).size,82);
  assert(EXPANDED_NEW_UNITS.every(id=>!before.coverage.includedUnits.includes(id)&&before.coverage.pendingUnits.includes(id)),'Expanded added unit already existed or was not pending');
  assert.deepEqual(sorted(after.coverage.includedUnits),sorted([...before.coverage.includedUnits,...EXPANDED_NEW_UNITS]),'Unexpected included unit change');
  assert.equal(after.coverage.includedUnits.length,85); assert.equal(new Set(after.coverage.includedUnits).size,85);
  assert.deepEqual(after.coverage.pendingUnits,before.coverage.pendingUnits.filter(id=>!EXPANDED_NEW_UNITS.includes(id)),'Unexpected pending unit change');
  assert.equal(after.coverage.pendingUnits.length,34); assert.equal(new Set(after.coverage.pendingUnits).size,34);
  assert(after.coverage.pendingUnits.every(id=>!after.coverage.includedUnits.includes(id)),'Included and pending units overlap');
  assert.equal(Object.keys(before.assets).length,255); assert.equal(Object.keys(before.retiredAssets).length,14);
  assert.equal(Object.keys(after.assets).length,264); assert.equal(Object.keys(after.retiredAssets).length,14);
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
  assert.equal(Object.keys(before.scenes).length,182); assert.equal(before.coverage.includedRoutes,182);
  for(const [key,route] of Object.entries(before.scenes))
    assert.deepEqual(after.scenes[key],route,'Existing narration route changed: '+key);
  const newRoutes=Object.keys(after.scenes).filter(key=>!Object.hasOwn(before.scenes,key));
  assert.deepEqual(sorted(newRoutes),EXPANDED_NEW_ROUTES,'Unexpected new narration routes');
  for(const key of EXPANDED_NEW_ROUTES)assert.deepEqual(after.scenes[key],EXPANDED_NEW_SCENES[key],'Expanded route metadata differs from frozen selection: '+key);
  assert.equal(newRoutes.length,7); assert.equal(after.coverage.includedRoutes,189); assert.equal(Object.keys(after.scenes).length,189);
  assert(EXPANDED_NEW_ROUTES.every(key=>before.coverage.pendingRoutes.includes(key)),'New narration route was not pending');
  assert.deepEqual(after.coverage.pendingRoutes,before.coverage.pendingRoutes.filter(key=>!EXPANDED_NEW_ROUTES.includes(key)),'Unexpected pending route change');
  assert.equal(after.coverage.pendingRoutes.length,108); assert.equal(new Set(after.coverage.pendingRoutes).size,108);
  assert(after.coverage.pendingRoutes.every(key=>!Object.hasOwn(after.scenes,key)),'Included and pending routes overlap');
  assert(after.coverage.includedUnits.includes('prologue.passing')&&after.coverage.pendingUnits.includes('prologue.awakening'),'Prologue unit partition changed');
  for(const key of ['prologue:quote'])
    assert(!Object.hasOwn(after.scenes,key)&&after.coverage.pendingRoutes.includes(key),'Incomplete combined route must remain pending: '+key);
  assert.deepEqual(sorted(Object.keys(after.scenes).filter(key=>key.startsWith('journal:dist00:'))),['journal:dist00:all','journal:dist00:body','journal:dist00:entry'],'All completed dist00 tabs must be present');
  const from='    <script src="./assets/story-narration/v1/player.js?v=2026100308"></script>';
  const to='    <script src="./assets/story-narration/v1/player.js?v=2026100309"></script>';
  const oldHtml=exec('git',['show',EXPANDED_BASE+':index.html']),newHtml=exec('git',['show',EXPANDED_AUDIO_REVISION+':index.html']);
  assert.equal(oldHtml.split(from).length,2,'Expected one prior expanded narration loader');
  assert.equal(newHtml.split(to).length,2,'Expected one expanded narration loader');
  assert.equal(newHtml,oldHtml.replace(from,to),'Expanded narration seed changed more than the cache query');
  return{base:EXPANDED_BASE,reference:EXPANDED_AUDIO_REVISION,files:EXPANDED_NEW_AUDIO.map(row=>row.file),from,to,
    report:{base:EXPANDED_BASE,reference:EXPANDED_AUDIO_REVISION,sourceManifestSha256:EXPANDED_SOURCE_MANIFEST_SHA256,bindingsSha256:EXPANDED_BINDINGS_SHA256,runtimeManifestSha256:EXPANDED_MANIFEST_SHA256,additionalUnits:3,replacedUnits:[],unchangedPreviouslyPublishedUnits:82,replacedAudioFiles:0,additionalAudioFiles:9,additionalRoutes:7,includedUnits:85,includedRoutes:189,currentAudioFiles:264,retiredAudioFiles:14,oldAudioAndRoutesPreserved:true}};
}

const RUNTIME_PATHS=['assets','audio','data','index.html'];
function verifyCurrentRuntime(root, exec) {
  const rootStat=fs.lstatSync(root);
  assert(rootStat.isDirectory()&&!rootStat.isSymbolicLink(),'Runtime root must be an ordinary directory');
  const committed=exec('git',['diff','--no-ext-diff','--no-textconv','--name-only','-z',EXPANDED_AUDIO_REVISION,'HEAD','--',...RUNTIME_PATHS]).split('\0').filter(Boolean);
  assert.deepEqual(committed,[],'Committed runtime differs from the exact reviewed-85 seed');
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
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'hapil-narration85-baseline-')),baseline=path.join(directory,'baseline');
  let added=false;
  try {
    exec('git',['worktree','add','--detach',baseline,EXPANDED_BASE]);added=true;
    for(const [file,sha256] of Object.entries(HISTORICAL_GUARD_PINS)) {
      const filename=path.join(baseline,file),stat=fs.lstatSync(filename);
      assert(stat.isFile()&&!stat.isSymbolicLink()&&!(stat.mode&0o111),'Historical guard has unexpected mode/type: '+file);
      assert.equal(digest(fs.readFileSync(filename)),sha256,'Historical guard differs from exact 0d0017b3 preimage: '+file);
    }
    // Prove the unchanged prior chain only on its exact detached parent after
    // checking every current runtime byte. Never substitute the browser's game.
    const historical=require(path.join(baseline,'tools/rc130-preservation.cjs')).verify(baseline);
    assert.equal(historical.report.status,'passed','Historical preservation proof did not pass');
    assert(Object.hasOwn(historical,'historical'),'Historical proof omitted the release-gate compatibility result');
    return{historical:historical.historical,report:{status:'passed',base:EXPANDED_BASE,reference:EXPANDED_AUDIO_REVISION,method:'Exact frozen narration delta, complete committed and current runtime inventory and byte/mode proof, then unchanged release-82/release-73/RC132/RC131/RC130 preservation on detached pinned 0d0017b3 baseline',files:current.files,protectedPaths:RUNTIME_PATHS,currentRuntimeProof:current,independentExpandedNarrationBatch:expanded.report,historicalProof:historical.report}};
  }finally{
    try{if(added)exec('git',['worktree','remove','--force',baseline]);}
    finally{fs.rmSync(directory,{recursive:true,force:true});}
  }
}
module.exports={verify,BASE:EXPANDED_BASE};
if(require.main===module)console.log('NARRATION85_PRESERVATION',JSON.stringify(verify(path.resolve(__dirname,'..')).report));
