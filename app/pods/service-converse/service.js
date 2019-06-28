import Service from '@ember/service';
// import { isEmpty } from '@ember/utils';

const CONVERSE = window.converse;

export default Service.extend({
	initPlugin: false,
	initialize() {
		console.log('initialize XMPP');
		console.log(CONVERSE);
		CONVERSE.initialize({
			authentication: 'login', // 认证方式，默认为 'login'
			'auto_reconnect': true,
			'bosh_service_url': 'http://123.56.179.133:7070/http-bind/',
			'show_controlbox_by_default': false,
			'auto_login': true,
			jid: 'swang@max.logic',
			password: 'swang',
			i18n: 'zh',
			debug: true,
			'auto_join_rooms': [
				{
					jid: '5cbe7ab8f4ce4352ecb082a3@conference.max.logic',
					nick: 'ucbClient'
				}],
			// 'view_mode': 'embedded',
			'show_desktop_notifications': false,
			'whitelisted_plugins': ['chat_plugin']
		});
	}
	// addPlugins(controller) {
	// 	const that = this;

	// 	if (!this.get('initPlugin')) {

	// 		let response = CONVERSE.plugins.add('chat_plugin', {
	// 			initialize: function () {
	// 				controller.set('hasPlugin', true);
	// 				that.set('initPlugin', true);
	// 				this._converse.api.listen.on('message', obj => {
	// 					let message = obj.stanza.textContent;

	// 					if (!isEmpty(message)) {
	// 						that.set('xmppMessage', JSON.parse(message));

	// 						controller.set('xmppMessage', JSON.parse(message));
	// 						return JSON.parse(message);
	// 					}
	// 					// return obj;
	// 				});
	// 			}
	// 		});

	// 		return response;
	// 	}
	// }
});
