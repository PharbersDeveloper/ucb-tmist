import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ENV from 'ucb-tmist/config/environment';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';
// import RSVP from 'rsvp';

export default Route.extend({
	cookies: service(),
	ajax: service(),
	oauthService: service('oauth_service'),
	beforeModel({ targetName }) {
		// let cookies = this.get('cookies'),
		// 	token = cookies.read('access_token');
		// // scope = cookies.read('scope');

		// // 初始化 notice 页面的 notcie
		// if (isEmpty(localStorage.getItem('notice'))) {
		// 	localStorage.setItem('notice', true);
		// }
		// if (isEmpty(token) && targetName !== 'oauth-callback') {
		// 	this.transitionTo('page-login');
		// }
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

		// let store = this.get('store'),
		// 	useableProposals = A([]),
		// 	accountId = cookies.read('account_id'),
		// 	papers = A([]);

		if (isEmpty(accountId)) {
			return;
		}
		// return store.query('useableProposal', {
		// 	'account-id': accountId
		// }).then(data => {
		// 	useableProposals = data;
		// 	let promiseArray = A([]);

		// 	promiseArray = useableProposals.map(ele => {
		// 		return ele.get('proposal');
		// 	});
		// 	return RSVP.Promise.all(promiseArray);
		// }).then(data => {
		// 	let useableProposalIds = data,
		// 		promiseArray = A([]),
		// 		ajax = this.get('ajax');

		// 	promiseArray = useableProposalIds.map(ele => {
		// 		return ajax.request(`/v0/GeneratePaper?proposal-id=${ele.id}
		// 		&account-id=${cookies.read('account_id')}`, { method: 'POST', data: {} });
		// 	});
		// 	return RSVP.Promise.all(promiseArray);

		// }).then(data => {
		// 	data.forEach(ele => {
		// 		store.pushPayload(ele);
		// 	});
		// 	papers = store.peekAll('paper');
		// 	return RSVP.hash({
		// 		papers,
		// 		useableProposals,
		// 		detailProposal: useableProposals.get('firstObject'),
		// 		detailPaper: papers.get('firstObject')
		// 	});
		// });
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
