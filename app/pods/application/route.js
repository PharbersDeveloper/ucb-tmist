import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ENV from 'ucb-tmist/config/environment';
import { isEmpty } from '@ember/utils';
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

		if (isEmpty(accountId)) {
			return;
		}
	},
	actions: {
		error(error, transition) {
			window.console.log(error);
			window.console.log(transition);
			// if (ENV.environment === 'production') {
			// 	window.location = ENV.redirectUri;
			// }
		}
	}
});
