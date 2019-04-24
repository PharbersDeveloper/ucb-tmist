import Route from '@ember/routing/route';
import { A } from '@ember/array';
import { hash } from 'rsvp';

export default Route.extend({
	// beforeModel(transition) {
	// 	let proposalId = transition.params['page-scenario']['proposal_id'];

	// 	this.transitionTo('/scenario/' + proposalId + '/business');
	// },
	beforeModel(transition) {
		let resourceConfig = this.modelFor('page-scenario'),
			destConfigs = resourceConfig.destConfigs,
			firstDestConfig = destConfigs.get('firstObject'),
			proposalId = transition.params['page-scenario']['proposal_id'];

		this.transitionTo('/scenario/' + proposalId + '/index/hospital/' +
			firstDestConfig.id);
	},
	isHaveBusinessInput(businessInputs, self, destConfigs) {
		let isNewBusinessInputs = businessInputs.filter(ele => ele.get('isNew'));

		if (isNewBusinessInputs.length > 0) {
			return self.normalFlow(isNewBusinessInputs);
		}
		return self.generateBusinessInputs(destConfigs);
	},
	normalFlow(newBusinessInputs) {
		return newBusinessInputs;
	},
	generateBusinessInputs(destConfigs) {
		let promiseArray = A([]);

		promiseArray = destConfigs.map(ele => {
			return this.get('store').createRecord('businessinput', {
				destConfig: ele,
				destConfigId: ele.id,
				representativeId: '',
				resourceConfigId: '',
				salesTarget: '',
				budget: '',
				meetingPlaces: '',
				visitTime: ''
			});
		});
		return promiseArray;
	},
	model() {
		let store = this.get('store'),
			totalConfigs = this.modelFor('page-scenario'),
			destConfigs = totalConfigs.destConfigs,
			goodsConfigs = totalConfigs.goodsConfigs,
			businessInputs = store.peekAll('businessinput'),
			tmp = this.isHaveBusinessInput(businessInputs, this, destConfigs);

		this.controllerFor('page-scenario.index').set('businessInputs', tmp);
		return hash({
			businessInputs: tmp,
			mConf: totalConfigs.resourceConfManager,
			goodsConfigs,
			destConfigs,
			salesConfigs: totalConfigs.salesConfigs
		});
	}
});
