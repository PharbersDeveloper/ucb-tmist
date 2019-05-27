import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';
import RSVP from 'rsvp';

export default Route.extend({
	cookies: service(),
	ajax: service(),
	activate() {
		this._super(...arguments);
		let applicationController = this.controllerFor('application');

		applicationController.set('testProgress', 0);
		localStorage.removeItem('reDeploy');
	},
	model() {
		let applicationModel = this.modelFor('application'),
			store = this.get('store'),
			cookies = this.get('cookies'),
			useableProposals = A([]),
			accountId = cookies.read('account_id'),
			papers = A([]);

		if (!isEmpty(applicationModel)) {
			return RSVP.hash({
				papers: applicationModel.papers,
				useableProposals: applicationModel.useableProposals,
				detailProposal: applicationModel.detailProposal,
				detailPaper: applicationModel.detailPaper,
				scenario: applicationModel.scenario
			});
		}
		return store.query('useableProposal', {
			'account-id': accountId
		}).then(data => {
			useableProposals = data;
			let promiseArray = A([]);

			promiseArray = useableProposals.map(ele => {
				return ele.get('proposal');
			});
			return RSVP.Promise.all(promiseArray);
		}).then(data => {
			let useableProposalIds = data,
				promiseArray = A([]),
				ajax = this.get('ajax');

			promiseArray = useableProposalIds.map(ele => {
				return ajax.request(`/v0/GeneratePaper?proposal-id=${ele.id}
				&account-id=${cookies.read('account_id')}`, {
						method: 'POST',
						data: {}
					});
			});
			return RSVP.Promise.all(promiseArray);

		}).then(data => {
			data.forEach(ele => {
				store.pushPayload(ele);
			});
			papers = store.peekAll('paper');
			return RSVP.hash({
				results: A([]),
				papers,
				useableProposals,
				detailProposal: useableProposals.get('firstObject'),
				detailPaper: papers.get('firstObject')
			});
		});
	}
});
