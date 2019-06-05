import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({
	model() {
		const indexModel = this.modelFor('index'),
			{ detailProposal, scenario } = indexModel;

		return hash({
			scenario,
			detailProposal
		});
	},
	afterModel() {
		let applicationController = this.controllerFor('application');

		applicationController.set('testProgress', 3);
	}
});
