import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { A } from '@ember/array';

export default Route.extend({
	model() {
		let store = this.get('store'),
			totalModel = this.modelFor('page-scenario'),
			representativeinputs = store.peekAll('representativeinput').filter(ele => ele.get('isNew')),
			businessinputs = store.peekAll('businessinput').filter(ele => ele.get('isNew'));

		return hash({
			businessinputs,
			representativeinputs,
			goodsConfigs: totalModel.goodsConfigs.filter(ele => ele.get('productConfig.productType') === 0)
		});

	},
	setupController(controller, model) {
		this._super(...arguments);
		controller.set('tmpGc', model.goodsConfigs.get('firstObject'));
		controller.set('tmpSr', A([]));
	}
});
