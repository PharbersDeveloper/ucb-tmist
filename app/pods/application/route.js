import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ENV from 'ucb-tmist/config/environment';
import { isEmpty } from '@ember/utils';
// import converse from 'converse';
// import { A } from '@ember/array';
// import RSVP from 'rsvp';

export default Route.extend({
	cookies: service(),
	ajax: service(),
	oauthService: service('oauth_service'),
	beforeModel({ targetName }) {
		if (targetName === 'oauth-callback') {
			return;
		}
		// 初始化 notice 页面的 notcie
		if (isEmpty(localStorage.getItem('notice'))) {
			localStorage.setItem('notice', true);
		}
		if (this.get('oauthService').judgeAuth()) {
			this.transitionTo('index');
		} else {
			this.transitionTo('page-login');
		}
	},
	model() {
		const cookies = this.get('cookies');

		let accountId = cookies.read('account_id');

		// converse.initialize({
		// 	authentication: 'login', // 认证方式，默认为 'login'
		// 	'bosh_service_url': 'http://123.56.179.133:7070/http-bind/',
		// 	'show_controlbox_by_default': false,
		// 	'auto_login': true,
		// 	jid: 'swang@max.logic',
		// 	password: 'swang',
		// 	i18n: 'zh',
		// 	// 'auto_join_rooms':
		// 	// 'view_mode': 'embedded',
		// 	'show_desktop_notifications': false,
		// 	'whitelisted_plugins': ['chat_plugin']
		// });
		if (isEmpty(accountId)) {
			return;
		}
	},
	actions: {
		error(error, transition) {
			window.console.log(error);
			window.console.log(transition);
			if (ENV.environment === 'production') {
				window.location = ENV.redirectUri;
			}
		}
	}
});
