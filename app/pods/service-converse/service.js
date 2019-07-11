import Service from '@ember/service';
import ENV from 'ucb-tmist/config/environment';

const CONVERSE = window.converse;

export default Service.extend({
	initPlugin: false,
	initialize() {
		window.console.log('initialize XMPP');

		CONVERSE.initialize({
			authentication: 'login', // 认证方式，默认为 'login'
			'auto_reconnect': true,
			'bosh_service_url': 'http://123.56.179.133:7070/http-bind/',
			'show_controlbox_by_default': false,
			'auto_login': true,
			jid: 'swang@max.logic',
			password: 'swang',
			// keepalive: true,
			i18n: 'zh',
			debug: ENV.environment === 'development',
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
	// generatePluginConfig(controller) {
	// 	return EmberObject.create({
	// 		initialize: function () {
	// 			this._converse.log('converse plugin initialize');
	// 			controller.set('hasPlugin', true);
	// 			this._converse.api.listen.on('message', obj => {
	// 				let message = isEmpty(obj.stanza.textContent) ? '{}' : obj.stanza.textContent;

	// 				window.console.log(JSON.parse(message).msg);
	// 				window.console.log(this._converse.api.user.status.get());
	// 				if (!isEmpty(message)) {
	// 					controller.set('xmppMessage', JSON.parse(message));
	// 					return JSON.parse(message);
	// 				}
	// 			});
	// 		}
	// 	});
	// }
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
