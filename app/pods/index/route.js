import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';
import { all, hash } from 'rsvp';

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
		// let applicationModel = this.modelFor('application'),
		const store = this.get('store'),
			cookies = this.get('cookies');

		let useableProposals = A([]),
			accountId = cookies.read('account_id'),
			papers = A([]),
			scenario = null,
			scenarioId = null,
			paperinput = null,
			goodsConfigs = A([]);

		// if (!isEmpty(applicationModel)) {
		// 	return RSVP.hash({
		// 		papers: applicationModel.papers,
		// 		useableProposals: applicationModel.useableProposals,
		// 		detailProposal: applicationModel.detailProposal,
		// 		detailPaper: applicationModel.detailPaper,
		// 		scenario: applicationModel.scenario
		// 	});
		// }
		return store.query('useableProposal', {
			'account-id': accountId
		}).then(data => {
			useableProposals = data;
			let promiseArray = A([]);

			promiseArray = useableProposals.map(ele => {
				return ele.get('proposal');
			});
			return all(promiseArray);
		}).then(data => {
			let useableProposalIds = data,
				promiseArray = A([]),
				ajax = this.get('ajax');

			promiseArray = useableProposalIds.map(ele => {
				return ajax.request(`/v0/GeneratePaper?proposal-id=${ele.id}
				&account-id=${cookies.read('account_id')}`, { method: 'POST', data: {} });
			});
			return all(promiseArray);

		}).then(data => {
			data.forEach(ele => {
				store.pushPayload(ele);
			});
			papers = store.peekAll('paper');
			return store.query('scenario', {
				'proposal-id': useableProposals.get('firstObject').get('proposal.id'),
				'account-id': cookies.read('account_id')
			});
		}).then(data => {
			scenario = data.get('firstObject');
			scenarioId = scenario.get('id');
			let state = papers.get('firstObject').get('state'),
				reDeploy = Number(localStorage.getItem('reDeploy'));

			// 周期为新开始/重新部署
			if (state !== 1 || reDeploy === 1) {
				//	如果为新的则需要获取destConfig/resourceConfig/
				// return detailPaper.get('paperinput');
				return null;
			}
			return papers.get('firstObject').get('paperinputs');
		}).then(data => {
			if (isEmpty(data)) {
				paperinput = data;
			} else {
				paperinput = data.get('lastObject');
			}
			return store.query('goodsConfig',
				{ 'scenario-id': scenarioId });
		}).then(data => {
			goodsConfigs = data;
			return all(data.map(ele => ele.get('productConfig')));
		}).then(data => {
			return hash({
				papers,
				useableProposals,
				detailProposal: useableProposals.get('firstObject'),
				detailPaper: papers.get('firstObject'),
				scenario,
				destConfigs: store.query('destConfig',
					{ 'scenario-id': scenarioId }),
				goodsConfigs,
				selfProductConfigs: data.filterBy('productType', 0),
				resourceConfigRepresentatives: store.query('resourceConfig',
					{
						'scenario-id': scenarioId,
						'resource-type': 1
					}),
				resourceConfigManager: store.queryRecord('resourceConfig',
					{
						'scenario-id': scenarioId,
						'resource-type': 0
					}),
				paperinput,
				businessInputs: isEmpty(paperinput) ? null : paperinput.get('businessinputs')
			});
		});
	}
});
