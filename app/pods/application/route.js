import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import { A } from '@ember/array';
import { isEmpty } from '@ember/utils';
export default Route.extend({
	cookies: service(),
	beforeModel({ targetName }) {
		let cookies = this.get('cookies'),
			token = cookies.read('access_token');

		if (!token && targetName !== 'oauth-callback') {
			this.transitionTo('page-login');
		}
	},
	model() {
		let store = this.get('store'),
			cookies = this.get('cookies'),
			useableProposals = A([]),
			accountId = cookies.read('account_id'),
			papers = A([]);

		if (isEmpty(accountId)) {
			return;
		}
		return store.query('useableProposal', {
			'account-id': accountId
		}).then(data => {
			useableProposals = data;
			let promiseArray = A([]);

			promiseArray = useableProposals.map(ele => {
				return store.query('paper', {
					'proposal-id': ele.get('proposal').get('id'),
					'account-id': accountId
				});
			});
			return RSVP.Promise.all(promiseArray);

		}).then(data => {
			papers = data;
			return RSVP.hash({
				papers,
				useableProposals,
				detailProposal: useableProposals.get('firstObject'),
				detailPaper: papers[0].get('firstObject')
			});
		});
	},
	actions: {
		error(error, transition) {
			console.log(error);
			console.log(transition);
			this.transitionTo('application');
		}
	}
});
