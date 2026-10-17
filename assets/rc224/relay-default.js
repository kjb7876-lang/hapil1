/* RC224: use the confirmed HAPIL relay as a default without replacing a player's saved choice. */
(function(root){
  'use strict';
  const config={...(root.__HAPIL_REMOTE_CONFIG_RC222__||{})};
  let saved='';
  try{saved=JSON.parse(root.localStorage?.getItem('hapil.remote.rc222.endpoint')||'null')||'';}catch{}
  if(!config.relayURL&&!saved)config.relayURL='wss://hapil-relay.onrender.com/relay';
  root.__HAPIL_REMOTE_CONFIG_RC222__=config;
})(window);
