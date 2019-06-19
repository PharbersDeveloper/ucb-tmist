import Controller from '@ember/controller';
// import ENV from 'ucb-tmist/config/environment';
import { inject as service } from '@ember/service';

export default Controller.extend({
	cookies: service(),
	serviceCycle: service(),
	actions: {
		continueTest() {
			// let pageIndexModel = this.modelFor('index');

			// window.location = ENV.redirectUri;
			// this.store.query('scenario', {
			// 	'proposal-id': this.get('model').detailProposal.get('proposal.id'),
			// 	'account-id': this.cookies.read('account_id')
			// }).then(data => {
			// 	window.console.log(data);
				// pageIndexModel.scenario = data.firstObject;
				// debugger
				// this.transitionToRoute('page-scenario', this.get('model').detailProposal.get('proposal.id'));
			// });
			this.transitionToRoute('index');
			// this.serviceCycle.set('needRefresh', true);
			this.serviceCycle.set('needRedirectToSce', true);
		},
		checkManagerReport() {
			this.transitionToRoute('page-report');
		}
	}
});
